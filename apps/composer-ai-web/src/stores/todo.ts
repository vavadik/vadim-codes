import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiClient } from '@/composables/useApiClient';
import type { TodoDto } from '@vadim-codes/composer-ai-contracts';

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<TodoDto[]>([]);
  const loading = ref(false);
  async function fetchAll() {
    loading.value = true;
    try {
      const res = await apiClient.todo.list();
      if (res.status === 200) {
        todos.value = res.body;
      }
    } finally {
      loading.value = false;
    }
  }

  async function create(title: string) {
    loading.value = true;
    try {
      const res = await apiClient.todo.create({ body: { title } });
      if (res.status === 201) {
        todos.value.unshift(res.body);
      }
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, data: { title?: string; done?: boolean }) {
    loading.value = true;
    try {
      const res = await apiClient.todo.update({ params: { id }, body: data });
      if (res.status === 200) {
        const idx = todos.value.findIndex((t) => t.id === id);
        if (idx !== -1) {
          todos.value[idx] = res.body;
        }
      }
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string) {
    loading.value = true;
    try {
      const res = await apiClient.todo.remove({ params: { id } });
      if (res.status === 200) {
        todos.value = todos.value.filter((t) => t.id !== id);
      }
    } finally {
      loading.value = false;
    }
  }

  return { todos, loading, fetchAll, create, update, remove };
});
