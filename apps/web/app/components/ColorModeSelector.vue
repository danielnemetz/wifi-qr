<script setup lang="ts">
import { Monitor, Sun, Moon } from 'lucide-vue-next'

const { t } = useI18n()
const colorMode = useColorMode()
</script>

<template>
  <Select :model-value="colorMode.preference" @update:model-value="colorMode.preference = String($event)">
    <SelectTrigger :key="colorMode.preference" class="h-8 w-auto gap-1.5 border-none shadow-none bg-transparent px-2 text-sm">
      <Monitor v-if="colorMode.preference === 'system'" class="h-4 w-4" />
      <Sun v-else-if="colorMode.preference === 'light'" class="h-4 w-4" />
      <Moon v-else class="h-4 w-4" />
    </SelectTrigger>
    <SelectContent align="end">
      <SelectItem value="system"><Monitor class="inline h-4 w-4 mr-2" />{{ t('theme.auto') }}</SelectItem>
      <SelectItem value="light"><Sun class="inline h-4 w-4 mr-2" />{{ t('theme.light') }}</SelectItem>
      <SelectItem value="dark"><Moon class="inline h-4 w-4 mr-2" />{{ t('theme.dark') }}</SelectItem>
    </SelectContent>
  </Select>
</template>
