<template>
  <div class="navbar bg-base-100 border-b border-base-300 px-6">
    <div class="navbar-start">
      <slot name="brand" />
    </div>
    <div class="navbar-end gap-2">
      <slot />
    </div>
  </div>
</template>
