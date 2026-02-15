<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'

const { t } = useI18n()

const ssid = defineModel<string>('ssid', { required: true })
const encryption = defineModel<string>('encryption', { required: true })
const password = defineModel<string>('password', { required: true })
const isHidden = defineModel<boolean>('isHidden', { required: true })

const showPassword = ref(false)
</script>

<template>
  <h2 class="text-lg font-semibold tracking-tight">{{ t('wifi.title') }}</h2>
  <div class="space-y-2">
    <Label for="ssid">{{ t('wifi.ssid') }}</Label>
    <Input id="ssid" v-model="ssid" :placeholder="t('wifi.ssidPlaceholder')" required />
  </div>
  <div class="space-y-2">
    <Label for="encryption">{{ t('wifi.encryption') }}</Label>
    <Select v-model="encryption">
      <SelectTrigger id="encryption">
        <SelectValue :placeholder="t('wifi.chooseCrypto')" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="WPA">{{ t('wifi.wpa') }}</SelectItem>
        <SelectItem value="WEP">{{ t('wifi.wep') }}</SelectItem>
        <SelectItem value="nopass">{{ t('wifi.none') }}</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div v-if="encryption !== 'nopass'" class="space-y-2">
    <Label for="password">{{ t('wifi.password') }}</Label>
    <div class="relative">
      <Input
        id="password"
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="t('wifi.passwordPlaceholder')"
        class="pr-10"
      />
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        @click="showPassword = !showPassword"
      >
        <Eye v-if="!showPassword" class="h-4 w-4" />
        <EyeOff v-else class="h-4 w-4" />
      </button>
    </div>
  </div>
  <div class="flex items-center gap-2">
    <Checkbox id="hidden" v-model="isHidden" />
    <Label for="hidden" class="text-sm font-normal cursor-pointer">
      {{ t('wifi.hidden') }}
    </Label>
  </div>
</template>
