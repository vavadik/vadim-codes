<template>
  <div class="canvas-table-wrapper">
    <table class="canvas-table">
      <thead v-if="node.head?.length">
        <tr>
          <th v-for="(h, i) in node.head" :key="i" :style="{ width: colWidth(i) }">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in rows" :key="ri">
          <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { TableNode } from '@/editor/types';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();

const node = computed(() => store.getNode(props.nodeId) as TableNode);

const rows = computed<string[][]>(() => {
  try {
    const parsed = JSON.parse(node.value.content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
});

function colWidth(i: number): string {
  const pcts = node.value.headWidthPercentages;
  if (!pcts || i >= pcts.length) return 'auto';
  return `${pcts[i]}%`;
}
</script>

<style scoped lang="scss">
.canvas-table-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 10px;
}

.canvas-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    border: 1px solid #d1d5db;
    padding: 2px 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    user-select: none;
  }

  th {
    background: #2980ba;
    color: #fff;
    font-weight: 600;
  }

  tr:nth-child(even) td {
    background: #f5f5f5;
  }
}
</style>
