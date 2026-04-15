<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 border-b border-base-300 px-6">
      <div class="navbar-start">
        <RouterLink to="/" class="text-xl font-bold">composer-ai</RouterLink>
      </div>
      <div class="navbar-end gap-4">
        <RouterLink to="/design-system" class="link link-hover text-sm">Design System</RouterLink>
        <RouterLink to="/editor" class="link link-hover text-sm">Editor</RouterLink>
        <a href="#" class="link link-hover text-sm">GitHub</a>
      </div>
    </div>

    <slot />
  </div>
</template>
