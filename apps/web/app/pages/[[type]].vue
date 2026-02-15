<script setup lang="ts">
import { QrCode, Loader2, Sun, Moon, Monitor } from 'lucide-vue-next'
import type { QrType } from '@qr/core'
import { QR_TYPE_LABELS } from '@qr/core'
import { QR_TYPES_ORDERED } from '~/utils/constants'
import { useQrStyle } from '~/composables/useQrStyle'
import { useQrGenerator } from '~/composables/useQrGenerator'

const route = useRoute()
const colorMode = useColorMode()

const DEFAULT_TYPE = QR_TYPES_ORDERED[0] as QrType
const qrType = ref<QrType>(DEFAULT_TYPE)

// ── URL ↔ type sync ──
watch(
  qrType,
  (t) => {
    const path = `/${t}`
    if (route.path !== path) navigateTo(path, { replace: true })
  },
  { flush: 'post' },
)

watch(
  () => route.path,
  () => {
    const tParam = route.params.type
    const s = typeof tParam === 'string' ? tParam : Array.isArray(tParam) ? tParam[0] : ''
    const t = s && QR_TYPES_ORDERED.includes(s) ? (s as QrType) : DEFAULT_TYPE
    if (qrType.value !== t) qrType.value = t
  },
  { immediate: true },
)

onMounted(() => {
  if (route.path === '/') navigateTo(`/${DEFAULT_TYPE}`, { replace: true })
})

// ── Composables ──
const style = useQrStyle()
const gen = useQrGenerator(qrType, style.getStylePayload)

// ── Debounced auto-regeneration ──
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [
    ...gen.allInputRefs,
    style.colorBackground,
    style.colorDotsStart,
    style.colorDotsEnd,
    style.colorCorners,
    style.colorText,
    style.dotsType,
    style.cornersSquareType,
    style.cornersDotType,
    style.imageSize,
    style.qrMargin,
    style.showInfoInImage,
  ],
  () => {
    if (!gen.previewUrl.value) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => gen.generate(), 300)
  },
)
</script>

<template>
  <div class="min-h-screen bg-muted flex items-center justify-center lg:p-6">
    <Card class="w-full lg:max-w-7xl shadow-lg rounded-none lg:rounded-xl relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-3 right-3 h-8 w-8 z-10"
              @click="colorMode.preference = colorMode.preference === 'system' ? 'light' : colorMode.preference === 'light' ? 'dark' : 'system'"
            >
              <Monitor v-if="colorMode.preference === 'system'" class="h-4 w-4" />
              <Sun v-else-if="colorMode.preference === 'light'" class="h-4 w-4" />
              <Moon v-else class="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ colorMode.preference === 'system' ? 'Auto (OS)' : colorMode.preference === 'light' ? 'Light' : 'Dark' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div class="grid grid-cols-1 lg:grid-cols-3">
        <!-- Input Column -->
        <div class="lg:max-h-[min(800px,calc(100vh-100px))] flex flex-col border-b lg:border-b-0 lg:border-r border-border">
          <div class="p-5 lg:p-6 space-y-4 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            <div class="space-y-2">
              <Label for="qrType">QR type</Label>
              <Select v-model="qrType">
                <SelectTrigger id="qrType">
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="t in QR_TYPES_ORDERED" :key="t" :value="t">
                    {{ QR_TYPE_LABELS[t as QrType] }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <QrInputWifi
              v-if="qrType === 'wifi'"
              v-model:ssid="gen.ssid.value"
              v-model:encryption="gen.encryption.value"
              v-model:password="gen.password.value"
              v-model:is-hidden="gen.isHidden.value"
            />
            <QrInputUrl v-else-if="qrType === 'url'" v-model:url="gen.urlContent.value" />
            <QrInputText v-else-if="qrType === 'text'" v-model:text="gen.textContent.value" />
            <QrInputVcard
              v-else-if="qrType === 'vcard'"
              v-model:name="gen.vcardName.value"
              v-model:phone="gen.vcardPhone.value"
              v-model:email="gen.vcardEmail.value"
              v-model:org="gen.vcardOrg.value"
              v-model:title="gen.vcardTitle.value"
              v-model:role="gen.vcardRole.value"
              v-model:url="gen.vcardUrl.value"
              v-model:note="gen.vcardNote.value"
              v-model:birthday="gen.vcardBirthday.value"
              v-model:street="gen.vcardStreet.value"
              v-model:city="gen.vcardCity.value"
              v-model:zip="gen.vcardZip.value"
              v-model:country="gen.vcardCountry.value"
              v-model:active-fields="gen.activeVcardFields.value"
              :available-fields="gen.AVAILABLE_VCARD_FIELDS"
              @add-field="gen.addVcardField"
              @remove-field="gen.removeVcardField"
            />
            <QrInputEmail
              v-else-if="qrType === 'email'"
              v-model:email="gen.emailAddress.value"
              v-model:subject="gen.emailSubject.value"
              v-model:body="gen.emailBody.value"
            />
            <QrInputSms
              v-else-if="qrType === 'sms'"
              v-model:phone="gen.smsPhone.value"
              v-model:body="gen.smsBody.value"
            />
            <QrInputTel v-else-if="qrType === 'tel'" v-model:phone="gen.telPhone.value" />
            <QrInputGeo
              v-else-if="qrType === 'geo'"
              v-model:lat="gen.geoLat.value"
              v-model:lng="gen.geoLng.value"
            />

            <div class="flex-1" />
            <p v-if="gen.errorMessage.value" class="text-sm text-destructive">
              {{ gen.errorMessage.value }}
            </p>
            <Button
              class="w-full"
              size="lg"
              :disabled="!gen.canGenerate.value || gen.generating.value"
              @click="gen.generate"
            >
              <Loader2 v-if="gen.generating.value" class="mr-2 h-4 w-4 animate-spin" />
              <QrCode v-else class="mr-2 h-4 w-4" />
              {{ gen.generating.value ? 'Generating...' : 'Generate QR code' }}
            </Button>
          </div>
        </div>

        <!-- Preview Column -->
        <QrPreviewPanel
          :preview-url="gen.previewUrl.value"
          :generating="gen.generating.value"
          :downloading-pdf="gen.downloadingPdf.value"
          :empty-state-hint="gen.emptyStateHint.value"
          @download-png="gen.downloadImage"
          @download-pdf="gen.downloadPdf"
        />

        <!-- Style Column -->
        <QrStylePanel
          v-model:color-background="style.colorBackground.value"
          v-model:color-dots-start="style.colorDotsStart.value"
          v-model:color-dots-end="style.colorDotsEnd.value"
          v-model:color-corners="style.colorCorners.value"
          v-model:color-text="style.colorText.value"
          v-model:dots-type="style.dotsType.value"
          v-model:corners-square-type="style.cornersSquareType.value"
          v-model:corners-dot-type="style.cornersDotType.value"
          v-model:image-size="style.imageSize.value"
          v-model:qr-margin="style.qrMargin.value"
          v-model:show-info-in-image="style.showInfoInImage.value"
          @randomize="style.randomizeColors"
        />
      </div>
    </Card>
  </div>
</template>
