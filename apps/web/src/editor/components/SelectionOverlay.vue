<template>
  <div class="selection-overlay">
    <div
      v-for="handle in handles"
      :key="handle.cursor"
      class="selection-handle"
      :style="handle.style"
      @mousedown.stop.prevent="startResize(handle.cursor, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useCanvasScale } from '@/editor/composables/useCanvasScale';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();
const { toMm } = useCanvasScale();

const H = 8; // handle size in px

const handles = computed(() => {
  const positions = [
    { cursor: 'nw-resize', top: -H / 2, left: -H / 2 },
    { cursor: 'n-resize', top: -H / 2, left: '50%' },
    { cursor: 'ne-resize', top: -H / 2, right: -H / 2 },
    { cursor: 'e-resize', top: '50%', right: -H / 2 },
    { cursor: 'se-resize', bottom: -H / 2, right: -H / 2 },
    { cursor: 's-resize', bottom: -H / 2, left: '50%' },
    { cursor: 'sw-resize', bottom: -H / 2, left: -H / 2 },
    { cursor: 'w-resize', top: '50%', left: -H / 2 },
  ];
  return positions.map((p) => ({
    cursor: p.cursor,
    style: {
      ...Object.fromEntries(
        Object.entries(p)
          .filter(([k]) => k !== 'cursor')
          .map(([k, v]) => [k, typeof v === 'number' ? `${v}px` : v])
      ),
      width: `${H}px`,
      height: `${H}px`,
      cursor: p.cursor,
      transform: p.cursor.includes('50%') ? 'translateY(-50%)' : undefined,
    },
  }));
});

function startResize(cursor: string, e: MouseEvent) {
  const node = store.getNode(props.nodeId);
  if (!node) return;

  const startX = e.clientX;
  const startY = e.clientY;
  const startW = node.width;
  const startH = node.height;
  const startNodeX = node.x;
  const startNodeY = node.y;

  function onMove(ev: MouseEvent) {
    const dxMm = toMm(ev.clientX - startX);
    const dyMm = toMm(ev.clientY - startY);
    let newW = startW;
    let newH = startH;
    let newX = startNodeX;
    let newY = startNodeY;

    if (cursor.includes('e')) newW = Math.max(10, startW + dxMm);
    if (cursor.includes('s')) newH = Math.max(5, startH + dyMm);
    if (cursor.includes('w')) {
      newW = Math.max(10, startW - dxMm);
      newX = startNodeX + (startW - newW);
    }
    if (cursor.includes('n')) {
      newH = Math.max(5, startH - dyMm);
      newY = startNodeY + (startH - newH);
    }

    store.updateNode(props.nodeId, { width: newW, height: newH, x: newX, y: newY });
  }

  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp, { once: true });
}
</script>

<style scoped lang="scss">
.selection-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.selection-handle {
  position: absolute;
  background: #fff;
  border: 2px solid #6366f1;
  border-radius: 2px;
  pointer-events: all;
  z-index: 10;
}
</style>
