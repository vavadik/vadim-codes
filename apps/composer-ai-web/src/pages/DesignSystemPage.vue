<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
      <!-- Buttons -->
      <Card>
        <template #header>Buttons</template>
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="error">Error</Button>
          </div>
          <Divider>Sizes</Divider>
          <div class="flex flex-wrap items-center gap-2">
            <Button size="xs">XSmall</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <Divider>States</Divider>
          <div class="flex flex-wrap gap-2">
            <Button :loading="true">Loading</Button>
            <Button :disabled="true">Disabled</Button>
          </div>
        </div>
      </Card>

      <!-- Badges -->
      <Card>
        <template #header>Badges</template>
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <Divider>Sizes</Divider>
          <div class="flex flex-wrap items-center gap-2">
            <Badge size="xs">XSmall</Badge>
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </div>
      </Card>

      <!-- Alerts -->
      <Card>
        <template #header>Alerts</template>
        <div class="flex flex-col gap-3">
          <Alert variant="info">This is an informational message.</Alert>
          <Alert variant="success">Operation completed successfully.</Alert>
          <Alert variant="warning">Please review before continuing.</Alert>
          <Alert variant="error">Something went wrong. Please try again.</Alert>
          <Alert variant="info" :dismissible="true">This alert can be dismissed.</Alert>
        </div>
      </Card>

      <!-- Card -->
      <Card>
        <template #header>Card</template>
        <p class="text-base-content/60 text-sm">Cards compose header, body, and footer slots.</p>
        <div class="mt-3">
          <Card>
            <template #header>Card Title</template>
            This is the card body. It accepts any content via the default slot.
            <template #footer>Footer note — secondary text</template>
          </Card>
        </div>
      </Card>

      <!-- Inputs -->
      <Card>
        <template #header>Input</template>
        <div class="flex flex-col gap-4 max-w-sm">
          <Input v-model="inputValue" label="Label" placeholder="Enter text…" />
          <Input
            v-model="errorInputValue"
            label="With error"
            placeholder="Enter email…"
            type="email"
            error="Please enter a valid email address."
          />
          <Input label="Disabled" placeholder="Not editable" :disabled="true" />
        </div>
      </Card>

      <!-- Modal -->
      <Card>
        <template #header>Modal</template>
        <Button @click="modalOpen = true">Open modal</Button>
        <Modal :open="modalOpen" @close="modalOpen = false">
          <template #title>Modal title</template>
          <p class="text-base-content/70">This is the modal body content.</p>
          <template #actions>
            <Button variant="ghost" @click="modalOpen = false">Cancel</Button>
            <Button @click="modalOpen = false">Confirm</Button>
          </template>
        </Modal>
      </Card>

      <!-- Divider -->
      <Card>
        <template #header>Divider</template>
        <div class="flex flex-col gap-1">
          <p class="text-sm">Above</p>
          <Divider />
          <p class="text-sm">Below</p>
          <Divider>With label</Divider>
          <p class="text-sm">After label</p>
        </div>
      </Card>

      <!-- Loading -->
      <Card>
        <template #header>Loading</template>
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-6">
            <Loading variant="spinner" />
            <Loading variant="dots" />
            <Loading variant="ring" />
            <Loading variant="bars" />
          </div>
          <Divider>Sizes</Divider>
          <div class="flex flex-wrap items-center gap-6">
            <Loading size="xs" />
            <Loading size="sm" />
            <Loading size="md" />
            <Loading size="lg" />
          </div>
        </div>
      </Card>

      <!-- Popups -->
      <Card>
        <template #header>Popups</template>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-base-content/60">
            Call and await any popup from anywhere in the app via
            <code class="bg-base-200 px-1 rounded text-xs">usePopup()</code>. Resolves with the
            popup's return value; backdrop click resolves
            <code class="bg-base-200 px-1 rounded text-xs">undefined</code>.
          </p>
          <Divider>ConfirmPopup</Divider>
          <div class="flex flex-wrap items-center gap-3">
            <Button @click="openConfirm">Open confirm</Button>
            <span v-if="confirmResult !== null" class="text-sm text-base-content/60">
              Resolved:
              <code class="bg-base-200 px-1 rounded text-xs">{{ String(confirmResult) }}</code>
            </span>
          </div>
          <Divider>Custom popup</Divider>
          <div class="flex flex-wrap items-center gap-3">
            <Button variant="secondary" @click="openCustom">Open custom</Button>
            <span v-if="customResult !== null" class="text-sm text-base-content/60">
              Resolved:
              <code class="bg-base-200 px-1 rounded text-xs">{{ String(customResult) }}</code>
            </span>
          </div>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Alert, Badge, Button, Card, Divider, Input, Loading, Modal } from '@/components/ui';
import AppLayout from '@/components/layouts/AppLayout.vue';
import { usePopup } from '@/composables/usePopup';
import ConfirmPopup from '@/components/popup/ConfirmPopup.vue';
import CustomPopup from '@/components/popup/CustomPopup.vue';

const modalOpen = ref(false);
const inputValue = ref('');
const errorInputValue = ref('');

const { open } = usePopup();

const confirmResult = ref<boolean | undefined | null>(null);

async function openConfirm() {
  confirmResult.value = null;
  confirmResult.value = await open<boolean>(ConfirmPopup, {
    title: 'Delete item',
    message: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmLabel: 'Delete',
  });
}

const customResult = ref<string | undefined | null>(null);

async function openCustom() {
  customResult.value = null;
  customResult.value = await open<string>(CustomPopup, {
    title: 'Rename',
    initialValue: 'My document',
  });
}
</script>
