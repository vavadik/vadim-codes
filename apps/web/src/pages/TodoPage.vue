<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">Todos</h1>

      <form class="flex gap-2 mb-6" @submit.prevent="handleCreate">
        <input
          v-model="newTitle"
          type="text"
          placeholder="What needs to be done?"
          class="input input-bordered flex-1"
        />
        <Button type="submit" :loading="creating">Add</Button>
      </form>

      <div v-if="store.loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="todo in store.todos"
          :key="todo.id"
          class="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
        >
          <input
            type="checkbox"
            class="checkbox"
            :checked="todo.done"
            @change="store.update(todo.id, { done: !todo.done })"
          />
          <span class="flex-1" :class="{ 'line-through opacity-50': todo.done }">
            {{ todo.title }}
          </span>
          <Button variant="error" size="xs" @click="store.remove(todo.id)">Delete</Button>
        </li>

        <li v-if="!store.todos.length" class="text-center opacity-50 py-12">
          No todos yet. Add one above!
        </li>
      </ul>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '@/components/layouts/AppLayout.vue';
import Button from '@/components/ui/Button.vue';
import { useTodoStore } from '@/stores/todo';

const store = useTodoStore();
const newTitle = ref('');
const creating = ref(false);

onMounted(() => store.fetchAll());

async function handleCreate() {
  if (!newTitle.value.trim()) {
    return;
  }
  creating.value = true;
  try {
    await store.create(newTitle.value.trim());
    newTitle.value = '';
  } finally {
    creating.value = false;
  }
}
</script>
