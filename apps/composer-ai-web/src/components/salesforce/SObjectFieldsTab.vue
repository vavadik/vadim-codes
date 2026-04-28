<template>
  <div class="overflow-x-auto rounded-box border border-base-300">
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Name</th>
          <th>Label</th>
          <th>Type</th>
          <th>Required</th>
          <th>Updateable</th>
          <th>References</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="field in fields" :key="field.name" class="hover">
          <td class="font-mono text-xs">{{ field.name }}</td>
          <td>{{ field.label }}</td>
          <td>
            <span class="badge badge-ghost badge-sm">{{ field.type }}</span>
          </td>
          <td>
            <span v-if="!field.nillable && field.createable" class="text-error text-xs">●</span>
          </td>
          <td>
            <span v-if="field.updateable" class="text-success text-xs">●</span>
          </td>
          <td class="font-mono text-xs text-base-content/60">
            {{ field.referenceTo?.join(', ') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { SfField } from '@vadim-codes/composer-ai-contracts';

defineProps<{ fields: SfField[] }>();
</script>
