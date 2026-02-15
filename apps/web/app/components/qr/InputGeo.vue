<script setup lang="ts">
const { t } = useI18n()
const lat = defineModel<string>('lat', { required: true })
const lng = defineModel<string>('lng', { required: true })
</script>

<template>
  <h2 class="text-lg font-semibold tracking-tight">{{ t('geo.title') }}</h2>
  <div class="space-y-2">
    <Label for="geoLat">{{ t('geo.lat') }}</Label>
    <Input id="geoLat" v-model="lat" type="text" inputmode="decimal" :placeholder="t('geo.latPlaceholder')" />
  </div>
  <div class="space-y-2">
    <Label for="geoLng">{{ t('geo.lng') }}</Label>
    <Input id="geoLng" v-model="lng" type="text" inputmode="decimal" :placeholder="t('geo.lngPlaceholder')" />
  </div>
  <MapPickerDialog
    :lat="lat"
    :lng="lng"
    @confirm="(newLat: string, newLng: string) => { lat = newLat; lng = newLng }"
  />
</template>
