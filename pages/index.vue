<template>
  <main class="p-8">
    <h1 class="text-2xl font-bold mb-4">BrainPDF Offline Demo</h1>
    <p class="mb-2">This homepage demonstrates the PWA's offline capability.</p>
    <p>Status: <span :class="statusClass">{{ onlineStatus }}</span></p>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const isOnline = ref(true)
const update = () => { isOnline.value = navigator.onLine }

onMounted(() => {
  update()
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', update)
  window.removeEventListener('offline', update)
})

const onlineStatus = computed(() => (isOnline.value ? 'Online' : 'Offline'))
const statusClass = computed(() => (isOnline.value ? 'text-green-600' : 'text-red-600'))
</script>

<style scoped>
main {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
</style>
