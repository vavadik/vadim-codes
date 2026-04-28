import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  BeforeApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn, ChildProcess } from 'child_process';
import { randomUUID } from 'crypto';
import { dirname } from 'path';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

@Injectable()
export class ClipProcessService implements OnApplicationBootstrap, BeforeApplicationShutdown {
  private readonly logger = new Logger(ClipProcessService.name);
  private worker: ChildProcess | null = null;
  private ready = false;
  private buffer = '';
  private readonly pending = new Map<string, PendingRequest>();

  constructor(private readonly config: ConfigService) {}

  async onApplicationBootstrap() {
    await this.spawnWorker();
  }

  beforeApplicationShutdown() {
    this.worker?.kill();
    this.worker = null;
  }

  get isReady() {
    return this.ready;
  }

  async send<T>(method: string, params?: unknown): Promise<T> {
    if (!this.ready || !this.worker) {
      throw new Error('CLIP worker is not ready');
    }
    const id = randomUUID();
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      this.worker!.stdin!.write(JSON.stringify({ id, method, params }) + '\n');
    });
  }

  private spawnWorker(): Promise<void> {
    const scriptPath = this.config.getOrThrow<string>('CLIP_WORKER_PATH');
    const projectDir = dirname(scriptPath);
    const uvBinary = this.config.get<string>('UV_BINARY') ?? 'uv';

    const home = process.env['HOME'] ?? '';
    const extraPaths = [`${home}/.local/bin`, `${home}/.cargo/bin`].join(':');
    const spawnEnv = {
      ...process.env,
      PATH: `${extraPaths}:${process.env['PATH'] ?? ''}`,
      HF_HOME: `${projectDir}/.hf_cache`,
    };

    return new Promise((resolve, reject) => {
      this.worker = spawn(uvBinary, ['run', '--directory', projectDir, 'python3', scriptPath], {
        env: spawnEnv,
        stdio: ['pipe', 'pipe', 'inherit'],
      });

      this.worker.stdout!.setEncoding('utf8');
      this.worker.stdout!.on('data', (chunk: string) => {
        this.buffer += chunk;
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.trim()) {
            this.handleLine(line, resolve, reject);
          }
        }
      });

      this.worker.on('error', (err) => {
        this.logger.error(`Worker spawn error: ${err.message}`);
        reject(err);
      });

      this.worker.on('exit', (code) => {
        this.logger.warn(`Worker exited with code ${code}`);
        this.ready = false;
        for (const { reject } of this.pending.values()) {
          reject(new Error('CLIP worker exited'));
        }
        this.pending.clear();
      });
    });
  }

  private handleLine(line: string, resolveStart: () => void, _rejectStart: (e: Error) => void) {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(line) as Record<string, unknown>;
    } catch {
      this.logger.error(`Unparseable worker output: ${line}`);
      return;
    }

    if (msg['type'] === 'ready') {
      this.ready = true;
      this.logger.log(`CLIP worker ready (model: ${msg['model']})`);
      resolveStart();
      return;
    }

    const id = msg['id'] as string | null;
    if (!id) {
      this.logger.error(`Worker error (no id): ${msg['error']}`);
      return;
    }
    const pending = this.pending.get(id);
    if (!pending) {
      return;
    }
    this.pending.delete(id);

    if (msg['error']) {
      pending.reject(new Error(msg['error'] as string));
    } else {
      pending.resolve(msg['result']);
    }
  }
}
