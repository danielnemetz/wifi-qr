<script setup lang="ts">
const { t } = useI18n()
const phone = defineModel<string>('phone', { required: true })
const body = defineModel<string>('body', { required: true })
</script>

<template>
  <h2 class="text-lg font-semibold tracking-tight">{{ t('sms.title') }}</h2>
  <div class="space-y-2">
    <Label for="smsPhone">{{ t('sms.phone') }}</Label>
    <Input id="smsPhone" v-model="phone" type="tel" :placeholder="t('sms.phonePlaceholder')" />
  </div>
  <div class="space-y-2">
    <Label for="smsBody">{{ t('sms.body') }}</Label>
    <Input id="smsBody" v-model="body" :placeholder="t('sms.bodyPlaceholder')" />
  </div>
</template>
