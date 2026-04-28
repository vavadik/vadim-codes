<template>
  <div class="overflow-x-auto rounded-box border border-base-300">
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Child SObject</th>
          <th>Field</th>
          <th>Relationship Name</th>
          <th>Cascade Delete</th>
          <th>Restricted Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rel in visible" :key="`${rel.childSObject}-${rel.field}`" class="hover">
          <td class="font-mono text-xs">{{ rel.childSObject }}</td>
          <td class="font-mono text-xs">{{ rel.field }}</td>
          <td class="font-mono text-xs text-base-content/60">{{ rel.relationshipName ?? '—' }}</td>
          <td>
            <span v-if="rel.cascadeDelete" class="text-warning text-xs">●</span>
          </td>
          <td>
            <span v-if="rel.restrictedDelete" class="text-error text-xs">●</span>
          </td>
        </tr>
        <tr v-if="visible.length === 0">
          <td colspan="5" class="text-center text-base-content/40 py-4">No child relationships</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-if="hiddenCount > 0" class="text-xs text-base-content/40 mt-1">
    {{ hiddenCount }} deprecated relationship{{ hiddenCount === 1 ? '' : 's' }} hidden
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SfChildRelationship } from '@vadim-codes/composer-ai-contracts';

const props = defineProps<{ relationships: SfChildRelationship[] }>();

const visible = computed(() => props.relationships.filter((r) => !r.deprecatedAndHidden));
const hiddenCount = computed(() => props.relationships.length - visible.value.length);
</script>
