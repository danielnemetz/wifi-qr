<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Eye, EyeOff, Download, QrCode, Loader2, Shuffle, Sun, Moon } from 'lucide-vue-next'
import { generateColorScheme } from '~/utils/colorScheme'

const colorMode = useColorMode()

// --- QR type & content ---
type QrType = 'wifi' | 'url' | 'text'
const qrType = ref<QrType>('wifi')
const urlContent = ref('')
const textContent = ref('')

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

const canGenerate = computed(() => {
  if (qrType.value === 'wifi') {
    if (!ssid.value.trim()) return false
    if (encryption.value !== 'nopass' && !password.value) return false
    return true
  }
  if (qrType.value === 'url') return urlContent.value.trim().length > 0
  return textContent.value.trim().length > 0
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
          showInfoInImage: showInfoInImage.value,
        },
    }
    if (qrType.value === 'wifi') {
      body.ssid = ssid.value.trim()
      body.encryption = encryption.value
      body.password = encryption.value !== 'nopass' ? password.value : undefined
      body.isHidden = isHidden.value
    } else if (qrType.value === 'url') {
      body.url = urlContent.value.trim()
    } else {
      body.text = textContent.value.trim()
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
  const first = textContent.value.trim().split(/\r?\n/)[0]?.slice(0, 30) || 'text'
  return `${first.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`
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
            <Checkbox id="hidden" v-model:checked="isHidden" />
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
          <template v-else>
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
                {{ qrType === 'wifi' ? 'Fülle die Netzwerkdaten aus' : qrType === 'url' ? 'Gib eine URL ein' : 'Gib einen Text ein' }} und klicke<br />
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
            <Checkbox id="showInfo" v-model:checked="showInfoInImage" />
            <Label for="showInfo" class="text-sm font-normal cursor-pointer">
              Info-Text anzeigen
            </Label>
          </div>
        </div>

      </div>
    </Card>
  </div>
</template>
