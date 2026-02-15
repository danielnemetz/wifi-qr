<script setup lang="ts">
const { t } = useI18n()
const text = defineModel<string>('text', { required: true })
</script>

<template>
  <h2 class="text-lg font-semibold tracking-tight">{{ t('text.title') }}</h2>
  <div class="space-y-2">
    <Label for="text">{{ t('text.label') }}</Label>
    <textarea
      id="text"
      v-model="text"
      :placeholder="t('text.placeholder')"
      rows="5"
      class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
    />
  </div>
</template>
