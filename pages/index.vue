<template>
  <main class="p-8 text-center">
    <h1 class="text-2xl font-bold mb-4">BrainPDF Demo</h1>
    <p class="mb-2">Local-first PDF toolkit running entirely in the browser.</p>
    <p>Status: <span :class="statusClass">{{ onlineStatus }}</span></p>
    <button
      v-if="!isOnline"
      class="mt-2 px-4 py-1 bg-yellow-500 text-white rounded"
      @click="resetPwa"
    >Refresh</button>
    <p class="mt-2">Available memory: {{ availableMemoryMB }} MB</p>
    <p>Max PDF size: {{ maxPdfSizeMB }} MB</p>

    <div
      class="mt-4 cursor-pointer"
      style="border: 2px dashed #ccc; padding: 1rem;"
      @click="openFilePicker"
      @drop.prevent="onDrop"
      @dragover.prevent
    >
      <p v-if="!selectedFile">Drop PDF here or click to select</p>
      <p v-else>{{ selectedFile.name }} ({{ (selectedFile.size/1024/1024).toFixed(1) }} MB)</p>
      <input ref="fileInput" type="file" accept="application/pdf" style="display:none" @change="handleFile" />
    </div>
    <div v-if="fileTooLarge" class="text-red-600 mt-2">File exceeds maximum allowed size.</div>

    <div v-if="selectedFile && !fileTooLarge" class="mt-4">
      <div v-if="progress < 100">
        <p>Parsing... {{ progress }}%</p>
        <div class="w-full bg-gray-200 h-2">
          <div class="bg-blue-500 h-2" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      <div v-else>
        <div class="flex items-center mb-2 justify-center">
          <label class="mr-2">Split method:</label>
          <select v-model="splitMode" class="border">
            <option value="equal">Equal parts</option>
            <option value="size">Chunk size (MB)</option>
          </select>
        </div>
        <div v-if="splitMode === 'equal'" class="mb-2">
          <label>Parts:</label>
          <input type="number" v-model.number="equalParts" min="1" class="border w-16 ml-2" />
        </div>
        <div v-else class="mb-2">
          <label>Size(MB):</label>
          <input type="number" v-model.number="chunkSize" min="1" class="border w-16 ml-2" />
        </div>
        <button class="px-4 py-2 bg-green-500 text-white rounded" @click="splitFile">Split</button>
      </div>

      <div v-if="sections.length > 0" class="mt-4 text-left">
        <h2 class="font-semibold mb-2">Sections</h2>
        <div v-for="(sec, index) in sections" :key="index" class="flex items-center mb-1">
          <input type="checkbox" v-model="selectedSections" :value="index" class="mr-2" />
          <span>{{ sec.name }}</span>
        </div>
        <button class="mt-2 px-4 py-2 bg-blue-500 text-white rounded" @click="exportSections" :disabled="selectedSections.length === 0">Export</button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getAvailableMemoryMB, computeMaxPdfSizeMB } from '~/utils/memory'
import { createZip } from '~/utils/zip'
import { splitPdfEqual, splitPdfBySize } from '~/utils/split'

const isOnline = ref(true)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const fileData = ref<Uint8Array | null>(null)
const progress = ref(0)
const fileTooLarge = ref(false)

const splitMode = ref<'equal' | 'size'>('equal')
const equalParts = ref(2)
const chunkSize = ref(1)
const sections = ref<{ name: string; data: Uint8Array }[]>([])
const selectedSections = ref<number[]>([])

const availableMemoryMB = ref(0)
const maxPdfSizeMB = ref(0)

const update = () => { isOnline.value = navigator.onLine }

onMounted(() => {
  update()
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
  availableMemoryMB.value = getAvailableMemoryMB()
  maxPdfSizeMB.value = computeMaxPdfSizeMB(availableMemoryMB.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', update)
  window.removeEventListener('offline', update)
})

const openFilePicker = () => {
  fileInput.value?.click()
}

const handleFile = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files[0]) {
    selectedFile.value = files[0]
    fileTooLarge.value = files[0].size / (1024 * 1024) > maxPdfSizeMB.value
    if (!fileTooLarge.value) parseFile()
  }
}

const onDrop = (e: DragEvent) => {
  const files = e.dataTransfer?.files
  if (files && files[0]) {
    const ev = { target: { files } } as unknown as Event
    handleFile(ev)
  }
}

function parseFile() {
  if (!selectedFile.value) return
  progress.value = 0
  const reader = new FileReader()
  reader.onprogress = (e) => {
    if (e.lengthComputable) {
      progress.value = Math.round((e.loaded / e.total) * 100)
    }
  }
  reader.onload = () => {
    progress.value = 100
    fileData.value = new Uint8Array(reader.result as ArrayBuffer)
  }
  reader.readAsArrayBuffer(selectedFile.value)
}

async function splitFile() {
  if (!fileData.value) return
  const data = fileData.value
  sections.value = []
  selectedSections.value = []
  if (splitMode.value === 'equal') {
    const parts = await splitPdfEqual(data, equalParts.value)
    parts.forEach((p, i) => {
      sections.value.push({ name: `section-${i + 1}.pdf`, data: p })
    })
  } else {
    const sizeBytes = Math.max(1, chunkSize.value) * 1024 * 1024
    const parts = await splitPdfBySize(data, sizeBytes)
    parts.forEach((p, i) => {
      sections.value.push({ name: `section-${i + 1}.pdf`, data: p })
    })
  }
}

function exportSections() {
  const files = selectedSections.value.map(i => sections.value[i])
  if (files.length === 1) {
    const blob = new Blob([files[0].data], { type: 'application/pdf' })
    downloadBlob(blob, files[0].name)
  } else if (files.length > 1) {
    const zipBlob = createZip(files.map(f => ({ name: f.name, data: f.data })))
    downloadBlob(zipBlob, 'sections.zip')
  }
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

async function resetPwa() {
  const regs = await navigator.serviceWorker.getRegistrations()
  await Promise.all(regs.map(r => r.unregister()))
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map(k => caches.delete(k)))
  }
  window.location.reload()
}

const onlineStatus = computed(() => (isOnline.value ? 'Online' : 'Offline'))
const statusClass = computed(() => (isOnline.value ? 'text-green-600' : 'text-red-600'))
</script>

<style scoped>
main {
  max-width: 600px;
  margin: 0 auto;
}
</style>
