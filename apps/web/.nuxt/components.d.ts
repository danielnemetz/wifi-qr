
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const NuxtWelcome: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const Button: typeof import("../app/components/ui/button/index")['Button']
export const Checkbox: typeof import("../app/components/ui/checkbox/index")['Checkbox']
export const Label: typeof import("../app/components/ui/label/index")['Label']
export const Card: typeof import("../app/components/ui/card/index")['Card']
export const CardAction: typeof import("../app/components/ui/card/index")['CardAction']
export const CardContent: typeof import("../app/components/ui/card/index")['CardContent']
export const CardDescription: typeof import("../app/components/ui/card/index")['CardDescription']
export const CardFooter: typeof import("../app/components/ui/card/index")['CardFooter']
export const CardHeader: typeof import("../app/components/ui/card/index")['CardHeader']
export const CardTitle: typeof import("../app/components/ui/card/index")['CardTitle']
export const Input: typeof import("../app/components/ui/input/index")['Input']
export const Separator: typeof import("../app/components/ui/separator/index")['Separator']
export const Select: typeof import("../app/components/ui/select/index")['Select']
export const SelectContent: typeof import("../app/components/ui/select/index")['SelectContent']
export const SelectGroup: typeof import("../app/components/ui/select/index")['SelectGroup']
export const SelectItem: typeof import("../app/components/ui/select/index")['SelectItem']
export const SelectItemText: typeof import("../app/components/ui/select/index")['SelectItemText']
export const SelectLabel: typeof import("../app/components/ui/select/index")['SelectLabel']
export const SelectScrollDownButton: typeof import("../app/components/ui/select/index")['SelectScrollDownButton']
export const SelectScrollUpButton: typeof import("../app/components/ui/select/index")['SelectScrollUpButton']
export const SelectSeparator: typeof import("../app/components/ui/select/index")['SelectSeparator']
export const SelectTrigger: typeof import("../app/components/ui/select/index")['SelectTrigger']
export const SelectValue: typeof import("../app/components/ui/select/index")['SelectValue']
export const Slider: typeof import("../app/components/ui/slider/index")['Slider']
export const Tooltip: typeof import("../app/components/ui/tooltip/index")['Tooltip']
export const TooltipContent: typeof import("../app/components/ui/tooltip/index")['TooltipContent']
export const TooltipProvider: typeof import("../app/components/ui/tooltip/index")['TooltipProvider']
export const TooltipTrigger: typeof import("../app/components/ui/tooltip/index")['TooltipTrigger']
export const ColorScheme: typeof import("../../../node_modules/.pnpm/@nuxtjs+color-mode@4.0.0_magicast@0.5.2/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']
export const NuxtPage: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyNuxtWelcome: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyButton: LazyComponent<typeof import("../app/components/ui/button/index")['Button']>
export const LazyCheckbox: LazyComponent<typeof import("../app/components/ui/checkbox/index")['Checkbox']>
export const LazyLabel: LazyComponent<typeof import("../app/components/ui/label/index")['Label']>
export const LazyCard: LazyComponent<typeof import("../app/components/ui/card/index")['Card']>
export const LazyCardAction: LazyComponent<typeof import("../app/components/ui/card/index")['CardAction']>
export const LazyCardContent: LazyComponent<typeof import("../app/components/ui/card/index")['CardContent']>
export const LazyCardDescription: LazyComponent<typeof import("../app/components/ui/card/index")['CardDescription']>
export const LazyCardFooter: LazyComponent<typeof import("../app/components/ui/card/index")['CardFooter']>
export const LazyCardHeader: LazyComponent<typeof import("../app/components/ui/card/index")['CardHeader']>
export const LazyCardTitle: LazyComponent<typeof import("../app/components/ui/card/index")['CardTitle']>
export const LazyInput: LazyComponent<typeof import("../app/components/ui/input/index")['Input']>
export const LazySeparator: LazyComponent<typeof import("../app/components/ui/separator/index")['Separator']>
export const LazySelect: LazyComponent<typeof import("../app/components/ui/select/index")['Select']>
export const LazySelectContent: LazyComponent<typeof import("../app/components/ui/select/index")['SelectContent']>
export const LazySelectGroup: LazyComponent<typeof import("../app/components/ui/select/index")['SelectGroup']>
export const LazySelectItem: LazyComponent<typeof import("../app/components/ui/select/index")['SelectItem']>
export const LazySelectItemText: LazyComponent<typeof import("../app/components/ui/select/index")['SelectItemText']>
export const LazySelectLabel: LazyComponent<typeof import("../app/components/ui/select/index")['SelectLabel']>
export const LazySelectScrollDownButton: LazyComponent<typeof import("../app/components/ui/select/index")['SelectScrollDownButton']>
export const LazySelectScrollUpButton: LazyComponent<typeof import("../app/components/ui/select/index")['SelectScrollUpButton']>
export const LazySelectSeparator: LazyComponent<typeof import("../app/components/ui/select/index")['SelectSeparator']>
export const LazySelectTrigger: LazyComponent<typeof import("../app/components/ui/select/index")['SelectTrigger']>
export const LazySelectValue: LazyComponent<typeof import("../app/components/ui/select/index")['SelectValue']>
export const LazySlider: LazyComponent<typeof import("../app/components/ui/slider/index")['Slider']>
export const LazyTooltip: LazyComponent<typeof import("../app/components/ui/tooltip/index")['Tooltip']>
export const LazyTooltipContent: LazyComponent<typeof import("../app/components/ui/tooltip/index")['TooltipContent']>
export const LazyTooltipProvider: LazyComponent<typeof import("../app/components/ui/tooltip/index")['TooltipProvider']>
export const LazyTooltipTrigger: LazyComponent<typeof import("../app/components/ui/tooltip/index")['TooltipTrigger']>
export const LazyColorScheme: LazyComponent<typeof import("../../../node_modules/.pnpm/@nuxtjs+color-mode@4.0.0_magicast@0.5.2/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@4.3.1_@parcel+watcher@2.5.6_@types+node@25.2.3_@vue+compiler-sfc@3.5.28_cac@6.7.14_c85b317623302b2c94f9e67d617f59ce/node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
