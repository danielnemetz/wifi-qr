<script setup lang="ts">
const { t } = useI18n()
const email = defineModel<string>('email', { required: true })
const subject = defineModel<string>('subject', { required: true })
const body = defineModel<string>('body', { required: true })
</script>

<template>
  <h2 class="text-lg font-semibold tracking-tight">{{ t('email.title') }}</h2>
  <div class="space-y-2">
    <Label for="email">{{ t('email.address') }}</Label>
    <Input id="email" v-model="email" type="email" :placeholder="t('email.addressPlaceholder')" />
  </div>
  <div class="space-y-2">
    <Label for="emailSubject">{{ t('email.subject') }}</Label>
    <Input id="emailSubject" v-model="subject" :placeholder="t('email.subjectPlaceholder')" />
  </div>
  <div class="space-y-2">
    <Label for="emailBody">{{ t('email.body') }}</Label>
    <textarea
      id="emailBody"
      v-model="body"
      :placeholder="t('email.bodyPlaceholder')"
      rows="3"
      class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
    />
  </div>
</template>
