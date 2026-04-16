<template>
  <div class="tooltip-anchor" @mouseenter="onEnter" @mouseleave="onLeave">
    <slot />
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div
          v-if="visible && text && !disabled"
          ref="tooltipEl"
          class="ui-tooltip"
          :class="`ui-tooltip--${placement}`"
          :style="tooltipStyle"
          role="tooltip"
        >
          {{ text }}
          <div class="ui-tooltip__arrow" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';

type Placement = 'top' | 'bottom' | 'left' | 'right';

const props = withDefaults(
  defineProps<{
    text?: string;
    placement?: Placement;
    delay?: number;
    disabled?: boolean;
  }>(),
  { placement: 'bottom', delay: 400 }
);

const OFFSET = 8; // gap between anchor and tooltip
const MARGIN = 8; // minimum distance from viewport edges

const visible = ref(false);
const ready = ref(false); // false = opacity 0 while measuring
const anchorRect = ref<DOMRect | null>(null);
const correction = ref({ dx: 0, dy: 0 });
const tooltipEl = ref<HTMLElement | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

/** Ideal position + centering transform based on placement, before overflow correction. */
const idealPos = computed(() => {
  const r = anchorRect.value;
  if (!r) {
    return { top: 0, left: 0, transform: '' };
  }
  switch (props.placement) {
    case 'top':
      return {
        top: r.top - OFFSET,
        left: r.left + r.width / 2,
        transform: 'translate(-50%, -100%)',
      };
    case 'bottom':
      return { top: r.bottom + OFFSET, left: r.left + r.width / 2, transform: 'translateX(-50%)' };
    case 'left':
      return {
        top: r.top + r.height / 2,
        left: r.left - OFFSET,
        transform: 'translate(-100%, -50%)',
      };
    case 'right':
      return { top: r.top + r.height / 2, left: r.right + OFFSET, transform: 'translateY(-50%)' };
  }
});

const tooltipStyle = computed(() => ({
  top: `${idealPos.value.top + correction.value.dy}px`,
  left: `${idealPos.value.left + correction.value.dx}px`,
  transform: idealPos.value.transform,
  // hidden until overflow correction is applied to prevent position flash
  opacity: ready.value ? undefined : 0,
}));

async function doShow() {
  correction.value = { dx: 0, dy: 0 };
  ready.value = false;
  visible.value = true;

  await nextTick();

  if (!tooltipEl.value) {
    ready.value = true;
    return;
  }

  const el = tooltipEl.value.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let dx = 0;
  let dy = 0;

  if (el.right > vw - MARGIN) {
    dx -= el.right - (vw - MARGIN);
  }
  if (el.left + dx < MARGIN) {
    dx = MARGIN - el.left;
  }
  if (el.bottom > vh - MARGIN) {
    dy -= el.bottom - (vh - MARGIN);
  }
  if (el.top + dy < MARGIN) {
    dy = MARGIN - el.top;
  }

  correction.value = { dx, dy };
  ready.value = true;
}

function onEnter(e: MouseEvent) {
  const anchor = e.currentTarget as HTMLElement;
  const target = (anchor.firstElementChild as HTMLElement) ?? anchor;
  anchorRect.value = target.getBoundingClientRect();
  timer = setTimeout(doShow, props.delay);
}

function onLeave() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  visible.value = false;
  ready.value = false;
}

onUnmounted(onLeave);
</script>

<style scoped lang="scss">
.tooltip-anchor {
  display: contents;
}
</style>

<style lang="scss">
.ui-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 5px 10px;
  background: var(--color-neutral);
  color: var(--color-neutral-content);
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.4;
  border-radius: 5px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);

  &__arrow {
    position: absolute;
    width: 0;
    height: 0;
  }

  &--bottom &__arrow {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid var(--color-neutral);
  }

  &--top &__arrow {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid var(--color-neutral);
  }

  &--left &__arrow {
    top: 50%;
    right: -4px;
    transform: translateY(-50%);
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 5px solid var(--color-neutral);
  }

  &--right &__arrow {
    top: 50%;
    left: -4px;
    transform: translateY(-50%);
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 5px solid var(--color-neutral);
  }
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.12s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
