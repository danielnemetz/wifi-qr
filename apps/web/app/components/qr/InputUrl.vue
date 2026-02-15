<script setup lang="ts">
const { t } = useI18n()
const url = defineModel<string>('url', { required: true })
</script>

<template>
  <h2 class="text-lg font-semibold tracking-tight">{{ t('url.title') }}</h2>
  <div class="space-y-2">
    <Label for="url">{{ t('url.label') }}</Label>
    <Input id="url" v-model="url" type="url" :placeholder="t('url.placeholder')" />
  </div>
</template>
