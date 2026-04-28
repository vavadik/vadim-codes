import { ref } from 'vue';
import { defineStore } from 'pinia';
import { apiClient } from '@/composables/useApiClient';
import type {
  SfImageAttachment,
  SfImageSearchResult,
  SfSObjectSummary,
  SfSObjectDescribe,
} from '@vadim-codes/composer-ai-contracts';

export const useSalesforceStore = defineStore('salesforce', () => {
  const sobjects = ref<SfSObjectSummary[]>([]);
  const currentDescribe = ref<SfSObjectDescribe | null>(null);
  const selectedName = ref<string | null>(null);
  const loading = ref(false);
  const describeLoading = ref(false);
  const currentRecord = ref<Record<string, unknown> | null>(null);
  const recordLoading = ref(false);
  const recordError = ref<string | null>(null);
  const imageAttachments = ref<SfImageAttachment[]>([]);
  const imagesLoading = ref(false);
  const imagesError = ref<string | null>(null);
  const imagesRecordId = ref<string | null>(null);
  const imageSearchResults = ref<SfImageSearchResult[]>([]);
  const imageSearchLoading = ref(false);
  const imageSearchError = ref<string | null>(null);

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
    imageAttachments.value = [];
    imagesError.value = null;
    imagesRecordId.value = null;
    imageSearchResults.value = [];
    imageSearchError.value = null;
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
    imageAttachments.value = [];
    imagesError.value = null;
    imagesRecordId.value = null;
    imageSearchResults.value = [];
    imageSearchError.value = null;
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

  async function fetchImageAttachments(name: string, id: string) {
    imagesLoading.value = true;
    imagesError.value = null;
    imagesRecordId.value = id;
    try {
      const res = await apiClient.salesforce.getImageAttachments({ params: { name, id } });
      if (res.status === 200) {
        imageAttachments.value = res.body;
      } else {
        imagesError.value = (res.body as { message: string }).message;
      }
    } catch {
      imagesError.value = 'Failed to fetch image attachments';
    } finally {
      imagesLoading.value = false;
    }
  }

  async function searchImages(name: string, id: string, prompt: string) {
    imageSearchLoading.value = true;
    imageSearchError.value = null;
    imageSearchResults.value = [];
    try {
      const res = await apiClient.salesforce.searchImages({
        params: { name, id },
        body: { prompt },
      });
      if (res.status === 200) {
        imageSearchResults.value = res.body.results;
      } else {
        imageSearchError.value = (res.body as { message: string }).message;
      }
    } catch {
      imageSearchError.value = 'Image search failed';
    } finally {
      imageSearchLoading.value = false;
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
    imageAttachments,
    imagesLoading,
    imagesError,
    imagesRecordId,
    imageSearchResults,
    imageSearchLoading,
    imageSearchError,
    fetchSobjects,
    describeSObject,
    fetchRecord,
    fetchImageAttachments,
    searchImages,
  };
});
