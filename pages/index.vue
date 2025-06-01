<template>
  <main class="p-8">
    <h1 class="text-2xl font-bold mb-4">BrainPDF Offline Demo</h1>
    <p class="mb-2">This homepage demonstrates the PWA's offline capability.</p>
    <p>Status: <span :class="statusClass">{{ onlineStatus }}</span></p>

    <div class="mt-4">
      <input type="file" accept="application/pdf" @change="handleFile" />
      <button
        v-if="downloadUrl"
        @click="triggerDownload"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Download PDF
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const isOnline = ref(true)
const selectedFile = ref<File | null>(null)
const downloadUrl = ref<string | null>(null)
const update = () => { isOnline.value = navigator.onLine }

const handleFile = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files[0]) {
    selectedFile.value = files[0]
    if (downloadUrl.value) {
      URL.revokeObjectURL(downloadUrl.value)
    }
    downloadUrl.value = URL.createObjectURL(files[0])
  } else {
    selectedFile.value = null
    if (downloadUrl.value) {
      URL.revokeObjectURL(downloadUrl.value)
    }
    downloadUrl.value = null
  }
}

const triggerDownload = () => {
  if (downloadUrl.value) {
    const link = document.createElement('a')
    link.href = downloadUrl.value
    link.download = selectedFile.value?.name || 'file.pdf'
    link.click()
  }
}

onMounted(() => {
  update()
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', update)
  window.removeEventListener('offline', update)
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value)
  }
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
