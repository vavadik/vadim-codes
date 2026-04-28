<template>
  <div class="p-6 space-y-4">
    <div class="flex items-center gap-3">
      <h2 class="text-xl font-semibold">{{ describe.label }}</h2>
      <code class="text-sm text-base-content/60">{{ describe.name }}</code>
      <span v-if="describe.custom" class="badge badge-outline">custom</span>
    </div>

    <div class="flex gap-4 text-sm text-base-content/60">
      <span v-if="describe.queryable">queryable</span>
      <span v-if="describe.createable">createable</span>
      <span v-if="describe.updateable">updateable</span>
      <span v-if="describe.deletable">deletable</span>
    </div>

    <SObjectRecordLookup />

    <div class="collapse collapse-arrow border border-base-300 rounded-box">
      <input type="checkbox" />
      <div class="collapse-title text-sm font-medium">Fields ({{ describe.fields.length }})</div>
      <div class="collapse-content p-0!">
        <SObjectFieldsTab :fields="describe.fields" />
      </div>
    </div>

    <div class="collapse collapse-arrow border border-base-300 rounded-box">
      <input type="checkbox" />
      <div class="collapse-title text-sm font-medium">
        Child Relationships ({{ describe.childRelationships.length }})
      </div>
      <div class="collapse-content p-0!">
        <SObjectChildRelationshipsTab :relationships="describe.childRelationships" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SfSObjectDescribe } from '@vadim-codes/composer-ai-contracts';
import SObjectRecordLookup from './SObjectRecordLookup.vue';
import SObjectFieldsTab from './SObjectFieldsTab.vue';
import SObjectChildRelationshipsTab from './SObjectChildRelationshipsTab.vue';

defineProps<{ describe: SfSObjectDescribe }>();
</script>
