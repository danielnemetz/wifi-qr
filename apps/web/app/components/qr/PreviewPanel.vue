<script setup lang="ts">
import { Download, FileText, QrCode, Loader2 } from 'lucide-vue-next'

const { t } = useI18n()

defineProps<{
  previewUrl: string | null
  generating: boolean
  downloadingPdf: boolean
  emptyStateHint: string
}>()

const emit = defineEmits<{
  downloadPng: []
  downloadPdf: []
}>()
</script>

<template>
  <div
    class="lg:max-h-[min(800px,calc(100vh-100px))] p-5 lg:p-6 flex flex-col items-center justify-center min-h-[350px] border-b lg:border-b-0 lg:border-r border-border gap-4 bg-muted/30"
  >
    <template v-if="previewUrl">
      <img
        :src="previewUrl"
        alt="QR code preview"
        class="w-full max-w-xs rounded-lg shadow-md"
      />
      <div class="flex gap-2">
        <Button variant="outline" @click="emit('downloadPng')">
          <Download class="mr-2 h-4 w-4" />
          PNG
        </Button>
        <Button variant="outline" :disabled="downloadingPdf" @click="emit('downloadPdf')">
          <Loader2 v-if="downloadingPdf" class="mr-2 h-4 w-4 animate-spin" />
          <FileText v-else class="mr-2 h-4 w-4" />
          PDF
        </Button>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col items-center gap-3 text-muted-foreground">
        <QrCode class="h-16 w-16 opacity-20" />
        <p class="text-sm text-center">
          {{ t('preview.emptyHint', { hint: emptyStateHint }) }}<br />
          <strong>{{ t('preview.emptyAction') }}</strong>.
        </p>
      </div>
    </template>
  </div>
</template>
