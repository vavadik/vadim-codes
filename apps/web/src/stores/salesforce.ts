import { ref } from 'vue';
import { defineStore } from 'pinia';
import { apiClient } from '@/composables/useApiClient';
import type { SfSObjectSummary, SfSObjectDescribe } from '@composer-ai/contracts';

export const useSalesforceStore = defineStore('salesforce', () => {
  const sobjects = ref<SfSObjectSummary[]>([]);
  const currentDescribe = ref<SfSObjectDescribe | null>(null);
  const selectedName = ref<string | null>(null);
  const loading = ref(false);
  const describeLoading = ref(false);
  const currentRecord = ref<Record<string, unknown> | null>(null);
  const recordLoading = ref(false);
  const recordError = ref<string | null>(null);

  async function fetchSobjects() {
    loading.value = true;
    try {
      const res = await apiClient.salesforce.sobjects();
      if (res.status === 200) {
        sobjects.value = res.body.sobjects;
      }
    } finally {
      loading.value = false;
    }
  }

  async function describeSObject(name: string) {
    selectedName.value = name;
    currentDescribe.value = null;
    currentRecord.value = null;
    recordError.value = null;
    describeLoading.value = true;
    try {
      const res = await apiClient.salesforce.describe({ params: { name } });
      if (res.status === 200) {
        currentDescribe.value = res.body;
      }
    } finally {
      describeLoading.value = false;
    }
  }

  async function fetchRecord(name: string, id: string) {
    currentRecord.value = null;
    recordError.value = null;
    recordLoading.value = true;
    try {
      const res = await apiClient.salesforce.getRecord({ params: { name, id } });
      if (res.status === 200) {
        currentRecord.value = res.body;
      } else {
        recordError.value = (res.body as { message: string }).message;
      }
    } catch {
      recordError.value = 'Failed to fetch record';
    } finally {
      recordLoading.value = false;
    }
  }

  return {
    sobjects,
    currentDescribe,
    selectedName,
    loading,
    describeLoading,
    currentRecord,
    recordLoading,
    recordError,
    fetchSobjects,
    describeSObject,
    fetchRecord,
  };
});
