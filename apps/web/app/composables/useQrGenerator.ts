import { ref, computed, watch, type Ref } from 'vue'
import { useI18n } from '#imports'
import {
  type QrType,
  buildQrPayload,
  type WifiPayload,
  type UrlPayload,
  type TextPayload,
  type VcardPayload,
  type EmailPayload,
  type SmsPayload,
  type TelPayload,
  type GeoPayload,
} from '@qr/core'

export interface QrStylePayload {
  colorBackground: string
  colorDotsStart: string
  colorDotsEnd: string
  colorCorners: string
  colorText: string
  dotsType: string
  cornersSquareType: string
  cornersDotType: string
  imageSize: number
  qrMargin: number
  showInfoInImage: boolean
}

export function useQrGenerator(
  qrType: Ref<QrType>,
  getStylePayload: () => QrStylePayload,
) {
  const { t } = useI18n()
  // ── Wi-Fi ──
  const ssid = ref('')
  const encryption = ref('WPA')
  const password = ref('')
  const showPassword = ref(false)
  const isHidden = ref(false)

  // ── URL / Text ──
  const urlContent = ref('')
  const textContent = ref('')

  // ── vCard ──
  const vcardName = ref('')
  const vcardPhone = ref('')
  const vcardEmail = ref('')
  const vcardOrg = ref('')
  const vcardTitle = ref('')
  const vcardRole = ref('')
  const vcardUrl = ref('')
  const vcardNote = ref('')
  const vcardBirthday = ref('')
  const vcardStreet = ref('')
  const vcardCity = ref('')
  const vcardZip = ref('')
  const vcardCountry = ref('')
  const activeVcardFields = ref<string[]>([])

  const AVAILABLE_VCARD_FIELDS = [
    { id: 'title', label: 'Job Title', group: 'Job' },
    { id: 'role', label: 'Role', group: 'Job' },
    { id: 'url', label: 'Website', group: 'Other' },
    { id: 'note', label: 'Note', group: 'Other' },
    { id: 'birthday', label: 'Birthday', group: 'Other' },
    { id: 'address', label: 'Address', group: 'Location' },
  ] as const

  function addVcardField(fieldId: string) {
    if (!activeVcardFields.value.includes(fieldId)) {
      activeVcardFields.value.push(fieldId)
    }
  }

  function removeVcardField(fieldId: string) {
    activeVcardFields.value = activeVcardFields.value.filter((f) => f !== fieldId)
    if (fieldId === 'title') vcardTitle.value = ''
    if (fieldId === 'role') vcardRole.value = ''
    if (fieldId === 'url') vcardUrl.value = ''
    if (fieldId === 'note') vcardNote.value = ''
    if (fieldId === 'birthday') vcardBirthday.value = ''
    if (fieldId === 'address') {
      vcardStreet.value = ''
      vcardCity.value = ''
      vcardZip.value = ''
      vcardCountry.value = ''
    }
  }

  // ── Email ──
  const emailAddress = ref('')
  const emailSubject = ref('')
  const emailBody = ref('')

  // ── SMS / Tel ──
  const smsPhone = ref('')
  const smsBody = ref('')
  const telPhone = ref('')

  // ── Geo ──
  const geoLat = ref('')
  const geoLng = ref('')

  // ── Generation state ──
  const generating = ref(false)
  const previewUrl = ref<string | null>(null)
  const blobRef = ref<Blob | null>(null)
  const generatedFilename = ref('')
  const errorMessage = ref('')
  const downloadingPdf = ref(false)

  // ── Payload helpers ──

  function getCurrentPayload():
    | WifiPayload
    | UrlPayload
    | TextPayload
    | VcardPayload
    | EmailPayload
    | SmsPayload
    | TelPayload
    | GeoPayload {
    const t = qrType.value
    if (t === 'wifi') {
      return {
        ssid: ssid.value.trim(),
        password: encryption.value !== 'nopass' ? password.value : undefined,
        encryption: encryption.value as WifiPayload['encryption'],
        isHidden: isHidden.value,
      }
    }
    if (t === 'url') return { url: urlContent.value.trim() }
    if (t === 'text') return { text: textContent.value.trim() }
    if (t === 'vcard') {
      return {
        name: vcardName.value.trim() || 'Contact',
        phone: vcardPhone.value.trim() || undefined,
        email: vcardEmail.value.trim() || undefined,
        org: vcardOrg.value.trim() || undefined,
        title: activeVcardFields.value.includes('title') ? vcardTitle.value.trim() || undefined : undefined,
        role: activeVcardFields.value.includes('role') ? vcardRole.value.trim() || undefined : undefined,
        url: activeVcardFields.value.includes('url') ? vcardUrl.value.trim() || undefined : undefined,
        note: activeVcardFields.value.includes('note') ? vcardNote.value.trim() || undefined : undefined,
        birthday: activeVcardFields.value.includes('birthday') ? vcardBirthday.value.trim() || undefined : undefined,
        street: activeVcardFields.value.includes('address') ? vcardStreet.value.trim() || undefined : undefined,
        city: activeVcardFields.value.includes('address') ? vcardCity.value.trim() || undefined : undefined,
        zip: activeVcardFields.value.includes('address') ? vcardZip.value.trim() || undefined : undefined,
        country: activeVcardFields.value.includes('address') ? vcardCountry.value.trim() || undefined : undefined,
      }
    }
    if (t === 'email') {
      return {
        email: emailAddress.value.trim(),
        subject: emailSubject.value.trim() || undefined,
        body: emailBody.value.trim() || undefined,
      }
    }
    if (t === 'sms') return { phone: smsPhone.value.trim(), body: smsBody.value.trim() || undefined }
    if (t === 'tel') return { phone: telPhone.value.trim() }
    return { lat: Number(geoLat.value) || 0, lng: Number(geoLng.value) || 0 }
  }

  /** Build the flat body for /api/generate from getCurrentPayload() */
  function buildRequestBody(): Record<string, unknown> {
    const payload = getCurrentPayload()
    const body: Record<string, unknown> = {
      type: qrType.value,
      style: getStylePayload(),
    }

    const t = qrType.value
    if (t === 'wifi') {
      const p = payload as WifiPayload
      body.ssid = p.ssid
      body.encryption = p.encryption
      body.password = p.password
      body.isHidden = p.isHidden
    } else if (t === 'url') {
      body.url = (payload as UrlPayload).url
    } else if (t === 'text') {
      body.text = (payload as TextPayload).text
    } else if (t === 'vcard') {
      const p = payload as VcardPayload
      body.vcardName = p.name
      body.vcardPhone = p.phone
      body.vcardEmail = p.email
      body.vcardOrg = p.org
      if (p.title) body.vcardTitle = p.title
      if (p.role) body.vcardRole = p.role
      if (p.url) body.vcardUrl = p.url
      if (p.note) body.vcardNote = p.note
      if (p.birthday) body.vcardBirthday = p.birthday
      if (p.street) body.vcardStreet = p.street
      if (p.city) body.vcardCity = p.city
      if (p.zip) body.vcardZip = p.zip
      if (p.country) body.vcardCountry = p.country
    } else if (t === 'email') {
      const p = payload as EmailPayload
      body.email = p.email
      body.emailSubject = p.subject
      body.emailBody = p.body
    } else if (t === 'sms') {
      const p = payload as SmsPayload
      body.smsPhone = p.phone
      body.smsBody = p.body
    } else if (t === 'tel') {
      body.telPhone = (payload as TelPayload).phone
    } else {
      const p = payload as GeoPayload
      body.geoLat = p.lat
      body.geoLng = p.lng
    }

    return body
  }

  const hintKeyMap: Record<string, string> = {
    wifi: 'preview.hintWifi',
    url: 'preview.hintUrl',
    text: 'preview.hintText',
    vcard: 'preview.hintVcard',
    email: 'preview.hintEmail',
    sms: 'preview.hintSms',
    tel: 'preview.hintTel',
    geo: 'preview.hintGeo',
  }

  const emptyStateHint = computed(() => {
    const key = hintKeyMap[qrType.value]
    return key ? t(key) : ''
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
      return (
        !!vcardName.value.trim() ||
        !!vcardPhone.value.trim() ||
        !!vcardEmail.value.trim() ||
        activeVcardFields.value.length > 0
      )
    }
    if (qrType.value === 'email') return emailAddress.value.trim().length > 0
    if (qrType.value === 'sms' || qrType.value === 'tel')
      return (qrType.value === 'sms' ? smsPhone : telPhone).value.trim().length > 0
    if (qrType.value === 'geo')
      return geoLat.value.trim().length > 0 && geoLng.value.trim().length > 0
    return false
  })

  // ── API calls ──

  async function generate() {
    if (!canGenerate.value) return
    generating.value = true
    errorMessage.value = ''

    try {
      const body = buildRequestBody()

      const response = await $fetch<Blob>('/api/generate', {
        method: 'POST',
        body,
        responseType: 'blob',
      })

      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }

      blobRef.value = response
      previewUrl.value = URL.createObjectURL(response)
      const payload = getCurrentPayload()
      generatedFilename.value = buildQrPayload(qrType.value, payload).filename
    } catch (err: any) {
      errorMessage.value = err?.data?.statusMessage || err?.message || t('errors.generationFailed')
    } finally {
      generating.value = false
    }
  }

  function downloadImage() {
    if (!blobRef.value || !previewUrl.value) return
    const a = document.createElement('a')
    a.href = previewUrl.value
    a.download = `${generatedFilename.value || 'qr'}.png`
    a.click()
  }

  async function downloadPdf() {
    if (!blobRef.value) return
    downloadingPdf.value = true
    try {
      const arrayBuffer = await blobRef.value.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((s, b) => s + String.fromCharCode(b), ''),
      )

      const pdfBlob = await $fetch<Blob>('/api/generate-pdf', {
        method: 'POST',
        body: { png: base64 },
        responseType: 'blob',
      })

      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${generatedFilename.value || 'qr'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      errorMessage.value = err?.data?.statusMessage || err?.message || t('errors.pdfFailed')
    } finally {
      downloadingPdf.value = false
    }
  }

  // ── All reactive sources for auto-regeneration ──
  const allInputRefs = [
    qrType,
    ssid, encryption, password, isHidden,
    urlContent, textContent,
    vcardName, vcardPhone, vcardEmail, vcardOrg,
    emailAddress, emailSubject, emailBody,
    smsPhone, smsBody, telPhone,
    geoLat, geoLng,
    vcardTitle, vcardRole, vcardUrl, vcardNote, vcardBirthday,
    vcardStreet, vcardCity, vcardZip, vcardCountry,
    activeVcardFields,
  ]

  return {
    // Wi-Fi
    ssid, encryption, password, showPassword, isHidden,
    // URL / Text
    urlContent, textContent,
    // vCard
    vcardName, vcardPhone, vcardEmail, vcardOrg,
    vcardTitle, vcardRole, vcardUrl, vcardNote, vcardBirthday,
    vcardStreet, vcardCity, vcardZip, vcardCountry,
    activeVcardFields, AVAILABLE_VCARD_FIELDS,
    addVcardField, removeVcardField,
    // Email
    emailAddress, emailSubject, emailBody,
    // SMS / Tel
    smsPhone, smsBody, telPhone,
    // Geo
    geoLat, geoLng,
    // Generation state
    generating, previewUrl, blobRef, generatedFilename, errorMessage,
    downloadingPdf,
    // Computed
    canGenerate, emptyStateHint,
    // Actions
    generate, downloadImage, downloadPdf,
    // For auto-regeneration watcher
    allInputRefs,
  }
}
