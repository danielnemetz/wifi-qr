<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Eye, EyeOff, Download, QrCode, Loader2, Shuffle, Sun, Moon } from 'lucide-vue-next'
import { generateColorScheme } from '~/utils/colorScheme'

const colorMode = useColorMode()

// --- QR type & content ---
type QrType = 'wifi' | 'url' | 'text' | 'vcard' | 'email' | 'sms' | 'tel' | 'geo'
const qrType = ref<QrType>('wifi')
const urlContent = ref('')
const textContent = ref('')
// vCard
const vcardName = ref('')
const vcardPhone = ref('')
const vcardEmail = ref('')
const vcardOrg = ref('')
// E-Mail
const emailAddress = ref('')
const emailSubject = ref('')
const emailBody = ref('')
// SMS
const smsPhone = ref('')
const smsBody = ref('')
// Telefon
const telPhone = ref('')
// Standort
const geoLat = ref('')
const geoLng = ref('')

// --- Network settings (Wi‑Fi) ---
const ssid = ref('')
const encryption = ref('WPA')
const password = ref('')
const showPassword = ref(false)
const isHidden = ref(false)

// --- Style settings ---
const colorBackground = ref('#E4E4F4')
const colorDotsStart = ref('#2B5A8C')
const colorDotsEnd = ref('#1B6B4A')
const colorCorners = ref('#2B4C7E')
const colorText = ref('#3A3A50')
const dotsType = ref('rounded')
const cornersSquareType = ref('extra-rounded')
const cornersDotType = ref('dot')
const imageSize = ref(1200)
const qrMargin = ref(30)
const qrMarginArr = computed({
  get: () => [qrMargin.value],
  set: (v: number[]) => { qrMargin.value = v[0] },
})
const showInfoInImage = ref(true)

// --- Generation state ---
const generating = ref(false)
const previewUrl = ref<string | null>(null)
const blobRef = ref<Blob | null>(null)
const errorMessage = ref('')

const emptyStateHint = computed(() => {
  const hints: Record<QrType, string> = {
    wifi: 'Fülle die Netzwerkdaten aus',
    url: 'Gib eine URL ein',
    text: 'Gib einen Text ein',
    vcard: 'Trage Kontaktdaten ein',
    email: 'Gib eine E-Mail-Adresse ein',
    sms: 'Gib eine Telefonnummer ein',
    tel: 'Gib eine Telefonnummer ein',
    geo: 'Gib Breiten- und Längengrad ein',
  }
  return hints[qrType.value]
})

const canGenerate = computed(() => {
  if (qrType.value === 'wifi') {
    if (!ssid.value.trim()) return false
    if (encryption.value !== 'nopass' && !password.value) return false
    return true
  }
  if (qrType.value === 'url') return urlContent.value.trim().length > 0
  if (qrType.value === 'text') return textContent.value.trim().length > 0
  if (qrType.value === 'vcard') {
    return vcardName.value.trim() || vcardPhone.value.trim() || vcardEmail.value.trim()
  }
  if (qrType.value === 'email') return emailAddress.value.trim().length > 0
  if (qrType.value === 'sms' || qrType.value === 'tel') return (qrType.value === 'sms' ? smsPhone : telPhone).value.trim().length > 0
  if (qrType.value === 'geo') return geoLat.value.trim().length > 0 && geoLng.value.trim().length > 0
  return false
})

async function generate() {
  if (!canGenerate.value) return
  generating.value = true
  errorMessage.value = ''

  try {
    const body: Record<string, unknown> = {
      type: qrType.value,
      style: {
          colorBackground: colorBackground.value,
          colorDotsStart: colorDotsStart.value,
          colorDotsEnd: colorDotsEnd.value,
          colorCorners: colorCorners.value,
          colorText: colorText.value,
          dotsType: dotsType.value,
          cornersSquareType: cornersSquareType.value,
          cornersDotType: cornersDotType.value,
          imageSize: imageSize.value,
          qrMargin: qrMargin.value,
          showInfoInImage: Boolean(showInfoInImage.value),
        },
    }
    if (qrType.value === 'wifi') {
      body.ssid = ssid.value.trim()
      body.encryption = encryption.value
      body.password = encryption.value !== 'nopass' ? password.value : undefined
      body.isHidden = isHidden.value
    } else if (qrType.value === 'url') {
      body.url = urlContent.value.trim()
    } else if (qrType.value === 'text') {
      body.text = textContent.value.trim()
    } else if (qrType.value === 'vcard') {
      body.vcardName = vcardName.value.trim()
      body.vcardPhone = vcardPhone.value.trim()
      body.vcardEmail = vcardEmail.value.trim()
      body.vcardOrg = vcardOrg.value.trim()
    } else if (qrType.value === 'email') {
      body.email = emailAddress.value.trim()
      body.emailSubject = emailSubject.value.trim()
      body.emailBody = emailBody.value.trim()
    } else if (qrType.value === 'sms') {
      body.smsPhone = smsPhone.value.trim()
      body.smsBody = smsBody.value.trim()
    } else if (qrType.value === 'tel') {
      body.telPhone = telPhone.value.trim()
    } else if (qrType.value === 'geo') {
      body.geoLat = Number(geoLat.value)
      body.geoLng = Number(geoLng.value)
    }

    const response = await $fetch<Blob>('/api/generate', {
      method: 'POST',
      body,
      responseType: 'blob',
    })

    // Revoke previous URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }

    blobRef.value = response
    previewUrl.value = URL.createObjectURL(response)
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Fehler bei der Generierung'
  } finally {
    generating.value = false
  }
}

function downloadFilename(): string {
  if (qrType.value === 'wifi') {
    return `${ssid.value.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}.png`
  }
  if (qrType.value === 'url') {
    try {
      const u = new URL(urlContent.value.trim())
      return `${u.hostname.replace(/[^a-zA-Z0-9_.-]/g, '_')}.png`
    } catch {
      return 'url.png'
    }
  }
  if (qrType.value === 'text') {
    const first = textContent.value.trim().split(/\r?\n/)[0]?.slice(0, 30) || 'text'
    return `${first.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`
  }
  if (qrType.value === 'vcard') {
    const n = vcardName.value.trim() || 'vcard'
    return `${n.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`
  }
  if (qrType.value === 'email') {
    const e = emailAddress.value.trim().replace(/[^a-zA-Z0-9_.@+-]/g, '_') || 'email'
    return `${e}.png`
  }
  if (qrType.value === 'sms') return `sms_${smsPhone.value.replace(/\D/g, '').slice(-8) || 'sms'}.png`
  if (qrType.value === 'tel') return `tel_${telPhone.value.replace(/\D/g, '').slice(-8) || 'tel'}.png`
  if (qrType.value === 'geo') return `geo_${geoLat.value}_${geoLng.value}.png`.replace(/[^a-zA-Z0-9_.-]/g, '_')
  return 'qr.png'
}

function downloadImage() {
  if (!blobRef.value || !previewUrl.value) return
  const a = document.createElement('a')
  a.href = previewUrl.value
  a.download = downloadFilename()
  a.click()
}

function randomizeColors() {
  const scheme = generateColorScheme()
  colorBackground.value = scheme.background
  colorDotsStart.value = scheme.dotsStart
  colorDotsEnd.value = scheme.dotsEnd
  colorCorners.value = scheme.corners
  colorText.value = scheme.text
}

// --- Auto-regenerate on style changes (after first generation) ---
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [
    qrType,
    ssid,
    encryption,
    password,
    isHidden,
    urlContent,
    textContent,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
    emailAddress,
    emailSubject,
    emailBody,
    smsPhone,
    smsBody,
    telPhone,
    geoLat,
    geoLng,
    colorBackground,
    colorDotsStart,
    colorDotsEnd,
    colorCorners,
    colorText,
    dotsType,
    cornersSquareType,
    cornersDotType,
    imageSize,
    qrMargin,
    showInfoInImage,
  ],
  () => {
    if (!previewUrl.value) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => generate(), 300)
  },
)
</script>

<template>
  <div class="min-h-screen bg-muted flex items-center justify-center p-4 lg:p-6">
    <Card class="w-full max-w-7xl shadow-lg rounded-xl relative">
      <!-- Dark Mode Toggle -->
      <Button
        variant="ghost"
        size="icon"
        class="absolute top-3 right-3 h-8 w-8 z-10"
        @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
      >
        <Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

        <!-- COLUMN 1: Type + content form -->
        <div class="p-5 lg:p-6 space-y-4 border-b md:border-b-0 md:border-r border-border flex flex-col">
          <div class="space-y-2">
            <Label for="qrType">QR-Typ</Label>
            <Select v-model="qrType">
              <SelectTrigger id="qrType">
                <SelectValue placeholder="Typ wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wifi">Wi‑Fi</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="vcard">Kontakt (vCard)</SelectItem>
                <SelectItem value="email">E-Mail</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="tel">Telefon</SelectItem>
                <SelectItem value="geo">Standort</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Wi‑Fi form -->
          <template v-if="qrType === 'wifi'">
            <h2 class="text-lg font-semibold tracking-tight">Netzwerk</h2>
            <div class="space-y-2">
              <Label for="ssid">SSID (Netzwerkname)</Label>
            <Input
              id="ssid"
              v-model="ssid"
              placeholder="z.B. MeinWLAN"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="encryption">Verschlüsselung</Label>
            <Select v-model="encryption">
              <SelectTrigger id="encryption">
                <SelectValue placeholder="Verschlüsselung wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA / WPA2 / WPA3</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">Keine (offen)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="encryption !== 'nopass'" class="space-y-2">
            <Label for="password">Passwort</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="WLAN-Passwort"
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
              Verstecktes Netzwerk
            </Label>
          </div>
          </template>

          <!-- URL form -->
          <template v-else-if="qrType === 'url'">
            <h2 class="text-lg font-semibold tracking-tight">URL</h2>
            <div class="space-y-2">
              <Label for="url">Adresse</Label>
              <Input
                id="url"
                v-model="urlContent"
                type="url"
                placeholder="https://beispiel.de"
              />
            </div>
          </template>

          <!-- Text form -->
          <template v-else-if="qrType === 'text'">
            <h2 class="text-lg font-semibold tracking-tight">Text</h2>
            <div class="space-y-2">
              <Label for="text">Inhalt</Label>
              <textarea
                id="text"
                v-model="textContent"
                placeholder="Beliebiger Text für den QR-Code …"
                rows="5"
                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
            </div>
          </template>

          <!-- vCard form -->
          <template v-else-if="qrType === 'vcard'">
            <h2 class="text-lg font-semibold tracking-tight">Kontakt</h2>
            <div class="space-y-2">
              <Label for="vcardName">Name</Label>
              <Input id="vcardName" v-model="vcardName" placeholder="Max Mustermann" />
            </div>
            <div class="space-y-2">
              <Label for="vcardPhone">Telefon</Label>
              <Input id="vcardPhone" v-model="vcardPhone" type="tel" placeholder="+49 123 456789" />
            </div>
            <div class="space-y-2">
              <Label for="vcardEmail">E-Mail</Label>
              <Input id="vcardEmail" v-model="vcardEmail" type="email" placeholder="max@beispiel.de" />
            </div>
            <div class="space-y-2">
              <Label for="vcardOrg">Organisation (optional)</Label>
              <Input id="vcardOrg" v-model="vcardOrg" placeholder="Firma GmbH" />
            </div>
          </template>

          <!-- E-Mail form -->
          <template v-else-if="qrType === 'email'">
            <h2 class="text-lg font-semibold tracking-tight">E-Mail</h2>
            <div class="space-y-2">
              <Label for="email">E-Mail-Adresse</Label>
              <Input id="email" v-model="emailAddress" type="email" placeholder="empfaenger@beispiel.de" />
            </div>
            <div class="space-y-2">
              <Label for="emailSubject">Betreff (optional)</Label>
              <Input id="emailSubject" v-model="emailSubject" placeholder="Betreffzeile" />
            </div>
            <div class="space-y-2">
              <Label for="emailBody">Nachricht (optional)</Label>
              <textarea
                id="emailBody"
                v-model="emailBody"
                placeholder="Vorausgefüllter Text …"
                rows="3"
                class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
            </div>
          </template>

          <!-- SMS form -->
          <template v-else-if="qrType === 'sms'">
            <h2 class="text-lg font-semibold tracking-tight">SMS</h2>
            <div class="space-y-2">
              <Label for="smsPhone">Telefonnummer</Label>
              <Input id="smsPhone" v-model="smsPhone" type="tel" placeholder="+49 123 456789" />
            </div>
            <div class="space-y-2">
              <Label for="smsBody">Nachricht (optional)</Label>
              <Input id="smsBody" v-model="smsBody" placeholder="Vorausgefüllter Text" />
            </div>
          </template>

          <!-- Telefon form -->
          <template v-else-if="qrType === 'tel'">
            <h2 class="text-lg font-semibold tracking-tight">Telefon</h2>
            <div class="space-y-2">
              <Label for="telPhone">Telefonnummer</Label>
              <Input id="telPhone" v-model="telPhone" type="tel" placeholder="+49 123 456789" />
            </div>
          </template>

          <!-- Standort form -->
          <template v-else-if="qrType === 'geo'">
            <h2 class="text-lg font-semibold tracking-tight">Standort</h2>
            <div class="space-y-2">
              <Label for="geoLat">Breitengrad</Label>
              <Input id="geoLat" v-model="geoLat" type="text" inputmode="decimal" placeholder="52.520008" />
            </div>
            <div class="space-y-2">
              <Label for="geoLng">Längengrad</Label>
              <Input id="geoLng" v-model="geoLng" type="text" inputmode="decimal" placeholder="13.404954" />
            </div>
          </template>

          <!-- Push button to bottom -->
          <div class="flex-1" />

          <!-- Error Message -->
          <p v-if="errorMessage" class="text-sm text-destructive">
            {{ errorMessage }}
          </p>

          <!-- Generate Button -->
          <Button
            class="w-full"
            size="lg"
            :disabled="!canGenerate || generating"
            @click="generate"
          >
            <Loader2 v-if="generating" class="mr-2 h-4 w-4 animate-spin" />
            <QrCode v-else class="mr-2 h-4 w-4" />
            {{ generating ? 'Generiere...' : 'QR-Code generieren' }}
          </Button>
        </div>

        <!-- COLUMN 2: Preview -->
        <div class="p-5 lg:p-6 flex flex-col items-center justify-center min-h-[350px] border-b md:border-b-0 md:border-r border-border gap-4">
          <template v-if="previewUrl">
            <img
              :src="previewUrl"
              alt="QR-Code Vorschau"
              class="w-full max-w-xs rounded-lg shadow-md"
            />
            <Button variant="outline" @click="downloadImage">
              <Download class="mr-2 h-4 w-4" />
              PNG herunterladen
            </Button>
          </template>
          <template v-else>
            <div class="flex flex-col items-center gap-3 text-muted-foreground">
              <QrCode class="h-16 w-16 opacity-20" />
              <p class="text-sm text-center">
                {{ emptyStateHint }} und klicke<br />
                auf <strong>„QR-Code generieren"</strong>.
              </p>
            </div>
          </template>
        </div>

        <!-- COLUMN 3: Style -->
        <div class="p-5 lg:p-6 space-y-4 md:col-span-2 lg:col-span-1">
          <h2 class="text-lg font-semibold tracking-tight">Stil</h2>

          <!-- Colors -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="text-sm text-muted-foreground">Farben</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button variant="ghost" size="icon" class="h-7 w-7" @click="randomizeColors">
                        <Shuffle class="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zufälliges Farbschema</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>
            <div class="grid grid-cols-5 gap-2">
              <div class="space-y-1">
                <label
                  for="colorBg"
                  class="block w-full aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
                  :style="{ backgroundColor: colorBackground }"
                >
                  <input id="colorBg" v-model="colorBackground" type="color" class="sr-only" />
                </label>
                <span class="text-[10px] text-muted-foreground text-center block">Hintergrund</span>
              </div>
              <div class="space-y-1">
                <label
                  for="colorDs"
                  class="block w-full aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
                  :style="{ backgroundColor: colorDotsStart }"
                >
                  <input id="colorDs" v-model="colorDotsStart" type="color" class="sr-only" />
                </label>
                <span class="text-[10px] text-muted-foreground text-center block">Punkte 1</span>
              </div>
              <div class="space-y-1">
                <label
                  for="colorDe"
                  class="block w-full aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
                  :style="{ backgroundColor: colorDotsEnd }"
                >
                  <input id="colorDe" v-model="colorDotsEnd" type="color" class="sr-only" />
                </label>
                <span class="text-[10px] text-muted-foreground text-center block">Punkte 2</span>
              </div>
              <div class="space-y-1">
                <label
                  for="colorCo"
                  class="block w-full aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
                  :style="{ backgroundColor: colorCorners }"
                >
                  <input id="colorCo" v-model="colorCorners" type="color" class="sr-only" />
                </label>
                <span class="text-[10px] text-muted-foreground text-center block">Ecken</span>
              </div>
              <div class="space-y-1">
                <label
                  for="colorTx"
                  class="block w-full aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
                  :style="{ backgroundColor: colorText }"
                >
                  <input id="colorTx" v-model="colorText" type="color" class="sr-only" />
                </label>
                <span class="text-[10px] text-muted-foreground text-center block">Text</span>
              </div>
            </div>
          </div>

          <!-- QR Style Dropdowns -->
          <div class="space-y-2">
            <Label for="dotsType">Punkt-Stil</Label>
            <Select v-model="dotsType">
              <SelectTrigger id="dotsType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                <SelectItem value="classy">Classy</SelectItem>
                <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="cornersSquare">Ecken außen</Label>
            <Select v-model="cornersSquareType">
              <SelectTrigger id="cornersSquare">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dot">Dot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="cornersDot">Ecken innen</Label>
            <Select v-model="cornersDotType">
              <SelectTrigger id="cornersDot">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dot">Dot</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Image Size & Padding -->
          <div class="space-y-2">
            <Label for="imageSize">Bildgröße</Label>
            <Select v-model="imageSize">
              <SelectTrigger id="imageSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="600">600 px</SelectItem>
                <SelectItem :value="900">900 px</SelectItem>
                <SelectItem :value="1200">1200 px</SelectItem>
                <SelectItem :value="1500">1500 px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Padding: {{ qrMargin }}</Label>
            <Slider
              v-model="qrMarginArr"
              :min="0"
              :max="80"
              :step="1"
              class="mt-2"
            />
          </div>

          <!-- Info text toggle -->
          <div class="flex items-center gap-2">
            <Checkbox id="showInfo" v-model="showInfoInImage" />
            <Label for="showInfo" class="text-sm font-normal cursor-pointer">
              Info-Text anzeigen
            </Label>
          </div>
        </div>

      </div>
    </Card>
  </div>
</template>
