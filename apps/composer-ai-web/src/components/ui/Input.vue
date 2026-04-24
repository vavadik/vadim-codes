<template>
  <fieldset class="fieldset gap-1">
    <label v-if="label" class="fieldset-label">{{ label }}</label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input w-full"
      :class="{ 'input-error': error }"
    />
    <p v-if="error" class="fieldset-label text-error">{{ error }}</p>
  </fieldset>
</template>

<script setup lang="ts">
type InputType = 'text' | 'email' | 'password' | 'number' | 'search';

const props = withDefaults(
  defineProps<{
    label?: string;
    placeholder?: string;
    type?: InputType;
    error?: string;
    disabled?: boolean;
  }>(),
  { type: 'text' }
);

const model = defineModel<string>({ default: '' });
</script>
