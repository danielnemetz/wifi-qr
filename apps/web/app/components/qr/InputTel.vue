<script setup lang="ts">
const { t } = useI18n()
const phone = defineModel<string>('phone', { required: true })
</script>

<template>
  <h2 class="text-lg font-semibold tracking-tight">{{ t('tel.title') }}</h2>
  <div class="space-y-2">
    <Label for="telPhone">{{ t('tel.phone') }}</Label>
    <Input id="telPhone" v-model="phone" type="tel" :placeholder="t('tel.phonePlaceholder')" />
  </div>
</template>
