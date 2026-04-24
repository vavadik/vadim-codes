<template>
  <Teleport to="body">
    <template v-for="(entry, index) in store.stack" :key="entry.id">
      <Transition name="popup" appear>
        <div
          class="fixed inset-0 flex items-center justify-center bg-black/50"
          :style="{ zIndex: 1000 + index * 2 }"
          @click="store.pop(entry.id)"
        >
          <div class="popup-content" :style="{ zIndex: 1000 + index * 2 + 1 }" @click.stop>
            <component
              :is="entry.component"
              v-bind="entry.props"
              :resolve="(value: unknown) => store.pop(entry.id, value)"
            />
          </div>
        </div>
      </Transition>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { usePopupStore } from '@/stores/popup';

const store = usePopupStore();

watch(
  () => store.stack.length > 0,
  (hasPopups) => {
    document.body.style.overflow = hasPopups ? 'hidden' : '';
  }
);
</script>

<style scoped>
.popup-enter-active {
  transition: opacity 150ms ease;
}
.popup-leave-active {
  transition: opacity 120ms ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

.popup-enter-active .popup-content {
  transition: transform 150ms ease;
}
.popup-leave-active .popup-content {
  transition: transform 120ms ease;
}
.popup-enter-from .popup-content {
  transform: scale(0.95) translateY(8px);
}
.popup-leave-to .popup-content {
  transform: scale(0.95) translateY(8px);
}
</style>
