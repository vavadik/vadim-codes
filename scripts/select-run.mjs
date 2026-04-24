import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { checkbox } from '@inquirer/prompts';
import { styleText } from 'node:util';

const rootDir = join(import.meta.dirname, '..');
const WORKSPACE_DIRS = ['apps', 'packages'];
const STATE_FILE = join(import.meta.dirname, '.select-run-state.json');

function discoverPackages() {
  const packages = [];
  for (const dir of WORKSPACE_DIRS) {
    const fullDir = join(rootDir, dir);
    if (!existsSync(fullDir)) {
      continue;
    }
    for (const entry of readdirSync(fullDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const pkgPath = join(fullDir, entry.name, 'package.json');
      if (!existsSync(pkgPath)) {
        continue;
      }
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      if (pkg.name) {
        packages.push({
          name: pkg.name,
          dir: join(dir, entry.name),
          scripts: Object.keys(pkg.scripts || {}),
        });
      }
    }
  }
  return packages;
}

function loadState() {
  if (!existsSync(STATE_FILE)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveState(state) {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function main() {
  const command = process.argv[2];

  if (!command) {
    const allPackages = discoverPackages();
    const allScripts = [...new Set(allPackages.flatMap((p) => p.scripts))].sort();
    console.log(`Usage: pnpm select <command>\n`);
    console.log(`Available scripts: ${allScripts.join(', ')}`);
    process.exit(1);
  }

  const packages = discoverPackages();
  const matching = packages.filter((p) => p.scripts.includes(command));

  if (matching.length === 0) {
    console.log(`No packages found with script "${command}".`);
    process.exit(1);
  }

  const state = loadState();
  const previousSelection = state[command];

  const choices = matching.map((pkg) => {
    const label = `${pkg.name} (${pkg.dir})`;
    const checked = previousSelection != null ? previousSelection.includes(pkg.name) : true; // default: all selected on first run
    return {
      name: label,
      checkedName: styleText('green', label),
      value: pkg.name,
      checked,
    };
  });

  let selected;
  try {
    selected = await checkbox({
      message: `Select packages to run "${command}":`,
      choices,
      pageSize: choices.length,
      theme: {
        icon: {
          checked: styleText('green', '●'),
          unchecked: '○',
        },
      },
    });
  } catch {
    // Ctrl+C or prompt cancelled — exit without saving state
    process.exit(0);
  }

  if (selected.length === 0) {
    console.log('No packages selected.');
    process.exit(0);
  }

  // Save selection state for next run
  state[command] = selected;
  saveState(state);

  const filters = selected.map((name) => `--filter=${name}`).join(' ');
  const cmd = `turbo run ${command} ${filters}`;
  console.log(`\nRunning: ${cmd}\n`);

  try {
    execSync(cmd, { stdio: 'inherit', cwd: rootDir });
  } catch (err) {
    process.exit(err.status ?? 1);
  }
}

main();
