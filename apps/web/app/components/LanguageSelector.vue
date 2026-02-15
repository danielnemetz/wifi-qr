<script setup lang="ts">
import 'flag-icons/css/flag-icons.min.css'

const { locale, locales, setLocale } = useI18n()

const COUNTRY: Record<string, string> = { en: 'gb', de: 'de' }
</script>

<template>
  <Select :model-value="locale" @update:model-value="setLocale(String($event))">
    <SelectTrigger :key="locale" class="h-8 w-auto gap-1.5 border-none shadow-none bg-transparent px-2 text-sm">
      <span :class="['fi', 'fi-' + (COUNTRY[locale] || 'xx')]" />
    </SelectTrigger>
    <SelectContent align="end">
      <SelectItem v-for="loc in locales" :key="loc.code" :value="loc.code">
        <span :class="['fi', 'fi-' + (COUNTRY[loc.code] || 'xx'), 'mr-2']" /> {{ loc.name }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
