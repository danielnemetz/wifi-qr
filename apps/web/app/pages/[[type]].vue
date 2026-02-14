<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  Eye,
  EyeOff,
  Download,
  QrCode,
  Loader2,
  Shuffle,
  Sun,
  Moon,
} from "lucide-vue-next";
import { generateColorScheme } from "~/utils/colorScheme";
import {
  type QrType,
  QR_TYPE_LABELS,
  buildQrPayload,
  type WifiPayload,
  type UrlPayload,
  type TextPayload,
  type VcardPayload,
  type EmailPayload,
  type SmsPayload,
  type TelPayload,
  type GeoPayload,
} from "@qr/core";
import { QR_TYPE_CHOICES, QR_TYPES_ORDERED } from "~/utils/constants";
const route = useRoute();
const colorMode = useColorMode();

const DEFAULT_TYPE = QR_TYPES_ORDERED[0] as QrType;

const qrType = ref<QrType>(DEFAULT_TYPE);

// Sync URL when user changes type in the dropdown (every type has its path, e.g. /wifi)
watch(
  qrType,
  (t) => {
    const path = `/${t}`;
    if (route.path !== path) {
      navigateTo(path, { replace: true });
    }
  },
  { flush: "post" },
);

// Sync type when user navigates (back/forward or direct URL)
watch(
  () => route.path,
  () => {
    const tParam = route.params.type;
    const s =
      typeof tParam === "string"
        ? tParam
        : Array.isArray(tParam)
          ? tParam[0]
          : "";
    const t = s && QR_TYPES_ORDERED.includes(s) ? (s as QrType) : DEFAULT_TYPE;
    if (qrType.value !== t) qrType.value = t;
  },
  { immediate: true },
);

onMounted(() => {
  if (route.path === "/") {
    navigateTo(`/${DEFAULT_TYPE}`, { replace: true });
  }
});

const urlContent = ref("");
const textContent = ref("");
// vCard
const vcardName = ref("");
const vcardPhone = ref("");
const vcardEmail = ref("");
const vcardOrg = ref("");
// Email
const emailAddress = ref("");
const emailSubject = ref("");
const emailBody = ref("");
// SMS
const smsPhone = ref("");
const smsBody = ref("");
// Phone
const telPhone = ref("");
// Location
const geoLat = ref("");
const geoLng = ref("");

// --- Network settings (Wi‑Fi) ---
const ssid = ref("");
const encryption = ref("WPA");
const password = ref("");
const showPassword = ref(false);
const isHidden = ref(false);

// --- Style settings ---
const colorBackground = ref("#E4E4F4");
const colorDotsStart = ref("#2B5A8C");
const colorDotsEnd = ref("#1B6B4A");
const colorCorners = ref("#2B4C7E");
const colorText = ref("#3A3A50");
const dotsType = ref("rounded");
const cornersSquareType = ref("extra-rounded");
const cornersDotType = ref("dot");
const imageSize = ref(1200);
const qrMargin = ref(30);
const qrMarginArr = computed({
  get: () => [qrMargin.value],
  set: (v: number[]) => {
    qrMargin.value = v[0];
  },
});
const showInfoInImage = ref(true);

// --- Generation state ---
const generating = ref(false);
const previewUrl = ref<string | null>(null);
const blobRef = ref<Blob | null>(null);
const generatedFilename = ref("");
const errorMessage = ref("");

function getCurrentPayload():
  | WifiPayload
  | UrlPayload
  | TextPayload
  | VcardPayload
  | EmailPayload
  | SmsPayload
  | TelPayload
  | GeoPayload {
  const t = qrType.value;
  if (t === "wifi") {
    return {
      ssid: ssid.value.trim(),
      password: encryption.value !== "nopass" ? password.value : undefined,
      encryption: encryption.value as WifiPayload["encryption"],
      isHidden: isHidden.value,
    };
  }
  if (t === "url") return { url: urlContent.value.trim() };
  if (t === "text") return { text: textContent.value.trim() };
  if (t === "vcard") {
    return {
      name: vcardName.value.trim() || "Contact",
      phone: vcardPhone.value.trim() || undefined,
      email: vcardEmail.value.trim() || undefined,
      org: vcardOrg.value.trim() || undefined,
    };
  }
  if (t === "email") {
    return {
      email: emailAddress.value.trim(),
      subject: emailSubject.value.trim() || undefined,
      body: emailBody.value.trim() || undefined,
    };
  }
  if (t === "sms")
    return {
      phone: smsPhone.value.trim(),
      body: smsBody.value.trim() || undefined,
    };
  if (t === "tel") return { phone: telPhone.value.trim() };
  return {
    lat: Number(geoLat.value) || 0,
    lng: Number(geoLng.value) || 0,
  };
}

const emptyStateHint = computed(() => {
  const hints: Record<string, string> = {
    wifi: "Fill in the network details",
    url: "Enter a URL",
    text: "Enter some text",
    vcard: "Enter contact details",
    email: "Enter an email address",
    sms: "Enter a phone number",
    tel: "Enter a phone number",
    geo: "Enter latitude and longitude",
  };
  return hints[qrType.value] || "";
});

const canGenerate = computed(() => {
  if (qrType.value === "wifi") {
    if (!ssid.value.trim()) return false;
    if (encryption.value !== "nopass" && !password.value) return false;
    return true;
  }
  if (qrType.value === "url") return urlContent.value.trim().length > 0;
  if (qrType.value === "text") return textContent.value.trim().length > 0;
  if (qrType.value === "vcard") {
    return (
      !!vcardName.value.trim() ||
      !!vcardPhone.value.trim() ||
      !!vcardEmail.value.trim()
    );
  }
  if (qrType.value === "email") return emailAddress.value.trim().length > 0;
  if (qrType.value === "sms" || qrType.value === "tel")
    return (
      (qrType.value === "sms" ? smsPhone : telPhone).value.trim().length > 0
    );
  if (qrType.value === "geo")
    return geoLat.value.trim().length > 0 && geoLng.value.trim().length > 0;
  return false;
});

async function generate() {
  if (!canGenerate.value) return;
  generating.value = true;
  errorMessage.value = "";

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
    };
    if (qrType.value === "wifi") {
      body.ssid = ssid.value.trim();
      body.encryption = encryption.value;
      body.password =
        encryption.value !== "nopass" ? password.value : undefined;
      body.isHidden = isHidden.value;
    } else if (qrType.value === "url") {
      body.url = urlContent.value.trim();
    } else if (qrType.value === "text") {
      body.text = textContent.value.trim();
    } else if (qrType.value === "vcard") {
      body.vcardName = vcardName.value.trim();
      body.vcardPhone = vcardPhone.value.trim();
      body.vcardEmail = vcardEmail.value.trim();
      body.vcardOrg = vcardOrg.value.trim();
    } else if (qrType.value === "email") {
      body.email = emailAddress.value.trim();
      body.emailSubject = emailSubject.value.trim();
      body.emailBody = emailBody.value.trim();
    } else if (qrType.value === "sms") {
      body.smsPhone = smsPhone.value.trim();
      body.smsBody = smsBody.value.trim();
    } else if (qrType.value === "tel") {
      body.telPhone = telPhone.value.trim();
    } else if (qrType.value === "geo") {
      body.geoLat = Number(geoLat.value);
      body.geoLng = Number(geoLng.value);
    }

    const response = await $fetch<Blob>("/api/generate", {
      method: "POST",
      body,
      responseType: "blob",
    });

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }

    blobRef.value = response;
    previewUrl.value = URL.createObjectURL(response);
    const payload = getCurrentPayload();
    generatedFilename.value = buildQrPayload(qrType.value, payload).filename;
  } catch (err: any) {
    errorMessage.value =
      err?.data?.statusMessage || err?.message || "Generation failed";
  } finally {
    generating.value = false;
  }
}

function downloadFilename(): string {
  return `${generatedFilename.value || "qr"}.png`;
}

function downloadImage() {
  if (!blobRef.value || !previewUrl.value) return;
  const a = document.createElement("a");
  a.href = previewUrl.value;
  a.download = downloadFilename();
  a.click();
}

function randomizeColors() {
  const scheme = generateColorScheme();
  colorBackground.value = scheme.background;
  colorDotsStart.value = scheme.dotsStart;
  colorDotsEnd.value = scheme.dotsEnd;
  colorCorners.value = scheme.corners;
  colorText.value = scheme.text;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
    if (!previewUrl.value) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => generate(), 300);
  },
);
</script>

<template>
  <div class="min-h-screen bg-muted flex items-center justify-center lg:p-6">
    <Card
      class="w-full lg:max-w-7xl shadow-lg rounded-none lg:rounded-xl relative"
    >
      <Button
        variant="ghost"
        size="icon"
        class="absolute top-3 right-3 h-8 w-8 z-10"
        @click="
          colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
        "
      >
        <Sun
          class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Moon
          class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
      </Button>

      <div class="grid grid-cols-1 lg:grid-cols-3">
        <div
          class="p-5 lg:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-border flex flex-col"
        >
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

          <template v-if="qrType === 'wifi'">
            <h2 class="text-lg font-semibold tracking-tight">Network</h2>
            <div class="space-y-2">
              <Label for="ssid">SSID (network name)</Label>
              <Input
                id="ssid"
                v-model="ssid"
                placeholder="e.g. MyNetwork"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="encryption">Encryption</Label>
              <Select v-model="encryption">
                <SelectTrigger id="encryption">
                  <SelectValue placeholder="Choose encryption" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA / WPA2 / WPA3</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">None (open)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-if="encryption !== 'nopass'" class="space-y-2">
              <Label for="password">Password</Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Wi‑Fi password"
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
                Hidden network
              </Label>
            </div>
          </template>

          <template v-else-if="qrType === 'url'">
            <h2 class="text-lg font-semibold tracking-tight">URL</h2>
            <div class="space-y-2">
              <Label for="url">Address</Label>
              <Input
                id="url"
                v-model="urlContent"
                type="url"
                placeholder="https://example.com"
              />
            </div>
          </template>

          <template v-else-if="qrType === 'text'">
            <h2 class="text-lg font-semibold tracking-tight">Text</h2>
            <div class="space-y-2">
              <Label for="text">Content</Label>
              <textarea
                id="text"
                v-model="textContent"
                placeholder="Any text for the QR code …"
                rows="5"
                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
            </div>
          </template>

          <template v-else-if="qrType === 'vcard'">
            <h2 class="text-lg font-semibold tracking-tight">Contact</h2>
            <div class="space-y-2">
              <Label for="vcardName">Name</Label>
              <Input
                id="vcardName"
                v-model="vcardName"
                placeholder="John Doe"
              />
            </div>
            <div class="space-y-2">
              <Label for="vcardPhone">Phone</Label>
              <Input
                id="vcardPhone"
                v-model="vcardPhone"
                type="tel"
                placeholder="+1 234 567890"
              />
            </div>
            <div class="space-y-2">
              <Label for="vcardEmail">Email</Label>
              <Input
                id="vcardEmail"
                v-model="vcardEmail"
                type="email"
                placeholder="john@example.com"
              />
            </div>
            <div class="space-y-2">
              <Label for="vcardOrg">Organization (optional)</Label>
              <Input id="vcardOrg" v-model="vcardOrg" placeholder="Acme Inc." />
            </div>
          </template>

          <template v-else-if="qrType === 'email'">
            <h2 class="text-lg font-semibold tracking-tight">Email</h2>
            <div class="space-y-2">
              <Label for="email">Email address</Label>
              <Input
                id="email"
                v-model="emailAddress"
                type="email"
                placeholder="recipient@example.com"
              />
            </div>
            <div class="space-y-2">
              <Label for="emailSubject">Subject (optional)</Label>
              <Input
                id="emailSubject"
                v-model="emailSubject"
                placeholder="Subject line"
              />
            </div>
            <div class="space-y-2">
              <Label for="emailBody">Message (optional)</Label>
              <textarea
                id="emailBody"
                v-model="emailBody"
                placeholder="Pre-filled message …"
                rows="3"
                class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
            </div>
          </template>

          <template v-else-if="qrType === 'sms'">
            <h2 class="text-lg font-semibold tracking-tight">SMS</h2>
            <div class="space-y-2">
              <Label for="smsPhone">Phone number</Label>
              <Input
                id="smsPhone"
                v-model="smsPhone"
                type="tel"
                placeholder="+1 234 567890"
              />
            </div>
            <div class="space-y-2">
              <Label for="smsBody">Message (optional)</Label>
              <Input
                id="smsBody"
                v-model="smsBody"
                placeholder="Pre-filled message"
              />
            </div>
          </template>

          <template v-else-if="qrType === 'tel'">
            <h2 class="text-lg font-semibold tracking-tight">Phone</h2>
            <div class="space-y-2">
              <Label for="telPhone">Phone number</Label>
              <Input
                id="telPhone"
                v-model="telPhone"
                type="tel"
                placeholder="+1 234 567890"
              />
            </div>
          </template>

          <template v-else-if="qrType === 'geo'">
            <h2 class="text-lg font-semibold tracking-tight">Location</h2>
            <div class="space-y-2">
              <Label for="geoLat">Latitude</Label>
              <Input
                id="geoLat"
                v-model="geoLat"
                type="text"
                inputmode="decimal"
                placeholder="52.520008"
              />
            </div>
            <div class="space-y-2">
              <Label for="geoLng">Longitude</Label>
              <Input
                id="geoLng"
                v-model="geoLng"
                type="text"
                inputmode="decimal"
                placeholder="13.404954"
              />
            </div>
          </template>

          <div class="flex-1" />
          <p v-if="errorMessage" class="text-sm text-destructive">
            {{ errorMessage }}
          </p>
          <Button
            class="w-full"
            size="lg"
            :disabled="!canGenerate || generating"
            @click="generate"
          >
            <Loader2 v-if="generating" class="mr-2 h-4 w-4 animate-spin" />
            <QrCode v-else class="mr-2 h-4 w-4" />
            {{ generating ? "Generating..." : "Generate QR code" }}
          </Button>
        </div>

        <div
          class="p-5 lg:p-6 flex flex-col items-center justify-center min-h-[350px] border-b lg:border-b-0 lg:border-r border-border gap-4"
        >
          <template v-if="previewUrl">
            <img
              :src="previewUrl"
              alt="QR code preview"
              class="w-full max-w-xs rounded-lg shadow-md"
            />
            <Button variant="outline" @click="downloadImage">
              <Download class="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </template>
          <template v-else>
            <div class="flex flex-col items-center gap-3 text-muted-foreground">
              <QrCode class="h-16 w-16 opacity-20" />
              <p class="text-sm text-center">
                {{ emptyStateHint }} and click<br />
                <strong>Generate QR code</strong>.
              </p>
            </div>
          </template>
        </div>

        <div class="p-5 lg:p-6 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Style</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="text-sm text-muted-foreground">Colors</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7"
                      @click="randomizeColors"
                    >
                      <Shuffle class="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Random color scheme</p></TooltipContent>
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
                  <input
                    id="colorBg"
                    v-model="colorBackground"
                    type="color"
                    class="sr-only"
                  />
                </label>
                <span
                  class="text-[10px] text-muted-foreground text-center block"
                  >Background</span
                >
              </div>
              <div class="space-y-1">
                <label
                  for="colorDs"
                  class="block w-full aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
                  :style="{ backgroundColor: colorDotsStart }"
                >
                  <input
                    id="colorDs"
                    v-model="colorDotsStart"
                    type="color"
                    class="sr-only"
                  />
                </label>
                <span
                  class="text-[10px] text-muted-foreground text-center block"
                  >Dots 1</span
                >
              </div>
              <div class="space-y-1">
                <label
                  for="colorDe"
                  class="block w-full aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
                  :style="{ backgroundColor: colorDotsEnd }"
                >
                  <input
                    id="colorDe"
                    v-model="colorDotsEnd"
                    type="color"
                    class="sr-only"
                  />
                </label>
                <span
                  class="text-[10px] text-muted-foreground text-center block"
                  >Dots 2</span
                >
              </div>
              <div class="space-y-1">
                <label
                  for="colorCo"
                  class="block w-full aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
                  :style="{ backgroundColor: colorCorners }"
                >
                  <input
                    id="colorCo"
                    v-model="colorCorners"
                    type="color"
                    class="sr-only"
                  />
                </label>
                <span
                  class="text-[10px] text-muted-foreground text-center block"
                  >Corners</span
                >
              </div>
              <div class="space-y-1">
                <label
                  for="colorTx"
                  class="block w-full aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
                  :style="{ backgroundColor: colorText }"
                >
                  <input
                    id="colorTx"
                    v-model="colorText"
                    type="color"
                    class="sr-only"
                  />
                </label>
                <span
                  class="text-[10px] text-muted-foreground text-center block"
                  >Text</span
                >
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="dotsType">Dot style</Label>
            <Select v-model="dotsType">
              <SelectTrigger id="dotsType"><SelectValue /></SelectTrigger>
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
            <Label for="cornersSquare">Outer corners</Label>
            <Select v-model="cornersSquareType">
              <SelectTrigger id="cornersSquare"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dot">Dot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="cornersDot">Inner corners</Label>
            <Select v-model="cornersDotType">
              <SelectTrigger id="cornersDot"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dot">Dot</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="imageSize">Image size</Label>
            <Select v-model="imageSize">
              <SelectTrigger id="imageSize"><SelectValue /></SelectTrigger>
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
          <div class="flex items-center gap-2">
            <Checkbox id="showInfo" v-model="showInfoInImage" />
            <Label for="showInfo" class="text-sm font-normal cursor-pointer"
              >Show info text</Label
            >
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
