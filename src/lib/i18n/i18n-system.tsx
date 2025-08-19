/**
 * CoreFlow360 - Internationalization System
 * Multi-language support with RTL compatibility and accessibility features
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Supported languages configuration
export interface LanguageConfig {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  region: string
  currency: string
  dateFormat: string
  numberFormat: Intl.NumberFormatOptions
}

export const supportedLanguages: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    region: 'US',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    region: 'ES',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    region: 'FR',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    region: 'DE',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    region: 'CN',
    currency: 'CNY',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    region: 'SA',
    currency: 'SAR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
    region: 'IL',
    currency: 'ILS',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    region: 'JP',
    currency: 'JPY',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  },
]

// Translation key type for type safety
export type TranslationKey =
  // Navigation
  | 'nav.dashboard'
  | 'nav.customers'
  | 'nav.projects'
  | 'nav.reports'
  | 'nav.settings'
  | 'nav.logout'

  // Common actions
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.create'
  | 'common.update'
  | 'common.search'
  | 'common.filter'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.warning'
  | 'common.info'
  | 'common.close'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.submit'
  | 'common.reset'

  // Dashboard
  | 'dashboard.title'
  | 'dashboard.welcome'
  | 'dashboard.revenue'
  | 'dashboard.customers'
  | 'dashboard.projects'
  | 'dashboard.growth'

  // Forms
  | 'form.required'
  | 'form.invalid_email'
  | 'form.invalid_phone'
  | 'form.password_too_short'
  | 'form.passwords_dont_match'
  | 'form.field_required'

  // Accessibility
  | 'a11y.skip_to_content'
  | 'a11y.skip_to_navigation'
  | 'a11y.menu_button'
  | 'a11y.close_dialog'
  | 'a11y.loading'
  | 'a11y.search_results'
  | 'a11y.no_results'
  | 'a11y.page_of'
  | 'a11y.sort_by'
  | 'a11y.ascending'
  | 'a11y.descending'

// Translation dictionaries
export const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.customers': 'Customers',
    'nav.projects': 'Projects',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Common actions
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.reset': 'Reset',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.revenue': 'Revenue',
    'dashboard.customers': 'Customers',
    'dashboard.projects': 'Projects',
    'dashboard.growth': 'Growth',

    // Forms
    'form.required': 'This field is required',
    'form.invalid_email': 'Please enter a valid email address',
    'form.invalid_phone': 'Please enter a valid phone number',
    'form.password_too_short': 'Password must be at least 8 characters',
    'form.passwords_dont_match': 'Passwords do not match',
    'form.field_required': 'Field is required',

    // Accessibility
    'a11y.skip_to_content': 'Skip to main content',
    'a11y.skip_to_navigation': 'Skip to navigation',
    'a11y.menu_button': 'Menu',
    'a11y.close_dialog': 'Close dialog',
    'a11y.loading': 'Loading content',
    'a11y.search_results': 'Search results',
    'a11y.no_results': 'No results found',
    'a11y.page_of': 'Page {current} of {total}',
    'a11y.sort_by': 'Sort by',
    'a11y.ascending': 'Ascending',
    'a11y.descending': 'Descending',
  },

  es: {
    // Navigation
    'nav.dashboard': 'Panel de Control',
    'nav.customers': 'Clientes',
    'nav.projects': 'Proyectos',
    'nav.reports': 'Informes',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar Sesión',

    // Common actions
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.update': 'Actualizar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.warning': 'Advertencia',
    'common.info': 'Información',
    'common.close': 'Cerrar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.submit': 'Enviar',
    'common.reset': 'Restablecer',

    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.welcome': 'Bienvenido de nuevo',
    'dashboard.revenue': 'Ingresos',
    'dashboard.customers': 'Clientes',
    'dashboard.projects': 'Proyectos',
    'dashboard.growth': 'Crecimiento',

    // Forms
    'form.required': 'Este campo es obligatorio',
    'form.invalid_email': 'Por favor ingrese un email válido',
    'form.invalid_phone': 'Por favor ingrese un número de teléfono válido',
    'form.password_too_short': 'La contraseña debe tener al menos 8 caracteres',
    'form.passwords_dont_match': 'Las contraseñas no coinciden',
    'form.field_required': 'El campo es obligatorio',

    // Accessibility
    'a11y.skip_to_content': 'Saltar al contenido principal',
    'a11y.skip_to_navigation': 'Saltar a la navegación',
    'a11y.menu_button': 'Menú',
    'a11y.close_dialog': 'Cerrar diálogo',
    'a11y.loading': 'Cargando contenido',
    'a11y.search_results': 'Resultados de búsqueda',
    'a11y.no_results': 'No se encontraron resultados',
    'a11y.page_of': 'Página {current} de {total}',
    'a11y.sort_by': 'Ordenar por',
    'a11y.ascending': 'Ascendente',
    'a11y.descending': 'Descendente',
  },

  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.customers': 'العملاء',
    'nav.projects': 'المشاريع',
    'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',

    // Common actions
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.create': 'إنشاء',
    'common.update': 'تحديث',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.loading': 'جار التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.warning': 'تحذير',
    'common.info': 'معلومات',
    'common.close': 'إغلاق',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.submit': 'إرسال',
    'common.reset': 'إعادة تعيين',

    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'أهلاً بعودتك',
    'dashboard.revenue': 'الإيرادات',
    'dashboard.customers': 'العملاء',
    'dashboard.projects': 'المشاريع',
    'dashboard.growth': 'النمو',

    // Forms
    'form.required': 'هذا الحقل مطلوب',
    'form.invalid_email': 'يرجى إدخال بريد إلكتروني صالح',
    'form.invalid_phone': 'يرجى إدخال رقم هاتف صالح',
    'form.password_too_short': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    'form.passwords_dont_match': 'كلمات المرور غير متطابقة',
    'form.field_required': 'الحقل مطلوب',

    // Accessibility
    'a11y.skip_to_content': 'الانتقال إلى المحتوى الرئيسي',
    'a11y.skip_to_navigation': 'الانتقال إلى التنقل',
    'a11y.menu_button': 'القائمة',
    'a11y.close_dialog': 'إغلاق المربع الحواري',
    'a11y.loading': 'جار تحميل المحتوى',
    'a11y.search_results': 'نتائج البحث',
    'a11y.no_results': 'لم يتم العثور على نتائج',
    'a11y.page_of': 'الصفحة {current} من {total}',
    'a11y.sort_by': 'ترتيب حسب',
    'a11y.ascending': 'تصاعدي',
    'a11y.descending': 'تنازلي',
  },
}

// I18n Context
interface I18nContextType {
  language: string
  languageConfig: LanguageConfig
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  changeLanguage: (language: string) => void
  formatNumber: (value: number) => string
  formatCurrency: (value: number) => string
  formatDate: (date: Date) => string
  formatRelativeTime: (date: Date) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

// I18n Provider Component
interface I18nProviderProps {
  children: React.ReactNode
  defaultLanguage?: string
}

export function I18nProvider({ children, defaultLanguage = 'en' }: I18nProviderProps) {
  const [language, setLanguage] = useState<string>(defaultLanguage)
  const languageConfig =
    supportedLanguages.find((lang) => lang.code === language) || supportedLanguages[0]

  // Initialize language from localStorage or browser
  useEffect(() => {
    const storedLanguage = localStorage.getItem('coreflow360-language')
    if (storedLanguage && supportedLanguages.some((lang) => lang.code === storedLanguage)) {
      setLanguage(storedLanguage)
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split('-')[0]
      if (supportedLanguages.some((lang) => lang.code === browserLanguage)) {
        setLanguage(browserLanguage)
      }
    }
  }, [])

  // Update document attributes when language changes
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = languageConfig.direction
    document.title = t('dashboard.title') + ' - CoreFlow360'

    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        language === 'en'
          ? 'AI-powered business management platform'
          : language === 'es'
            ? 'Plataforma de gestión empresarial con IA'
            : language === 'ar'
              ? 'منصة إدارة الأعمال المدعومة بالذكاء الاصطناعي'
              : 'AI-powered business management platform'
      )
    }
  }, [language, languageConfig])

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation = translations[language]?.[key] || translations.en[key] || key

    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value))
      })
    }

    return translation
  }

  const changeLanguage = (newLanguage: string) => {
    if (supportedLanguages.some((lang) => lang.code === newLanguage)) {
      setLanguage(newLanguage)
      localStorage.setItem('coreflow360-language', newLanguage)
    }
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(
      `${language}-${languageConfig.region}`,
      languageConfig.numberFormat
    ).format(value)
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(`${language}-${languageConfig.region}`, {
      style: 'currency',
      currency: languageConfig.currency,
    }).format(value)
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(`${language}-${languageConfig.region}`, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }

  const formatRelativeTime = (date: Date): string => {
    const rtf = new Intl.RelativeTimeFormat(`${language}-${languageConfig.region}`, {
      numeric: 'auto',
    })
    const diffInSeconds = (date.getTime() - Date.now()) / 1000
    const diffInMinutes = diffInSeconds / 60
    const diffInHours = diffInMinutes / 60
    const diffInDays = diffInHours / 24

    if (Math.abs(diffInDays) >= 1) {
      return rtf.format(Math.round(diffInDays), 'day')
    } else if (Math.abs(diffInHours) >= 1) {
      return rtf.format(Math.round(diffInHours), 'hour')
    } else {
      return rtf.format(Math.round(diffInMinutes), 'minute')
    }
  }

  const contextValue: I18nContextType = {
    language,
    languageConfig,
    t,
    changeLanguage,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
  }

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}

// Hook to use i18n
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Language Switcher Component
interface LanguageSwitcherProps {
  className?: string
  showFlag?: boolean
  compact?: boolean
}

export function LanguageSwitcher({
  className = '',
  showFlag = true,
  compact = false,
}: LanguageSwitcherProps) {
  const { language, languageConfig, changeLanguage, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage)
    setIsOpen(false)

    // Announce language change to screen readers
    const announcement =
      t('common.info') +
      ': ' +
      supportedLanguages.find((lang) => lang.code === newLanguage)?.nativeName

    // Create announcement element
    const element = document.createElement('div')
    element.setAttribute('aria-live', 'polite')
    element.className = 'sr-only'
    element.textContent = announcement
    document.body.appendChild(element)

    setTimeout(() => {
      document.body.removeChild(element)
    }, 1000)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 transition-colors hover:border-gray-600"
        aria-label={`Current language: ${languageConfig.nativeName}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {showFlag && <span className="text-lg">🌐</span>}
        {!compact && <span className="text-white">{languageConfig.nativeName}</span>}
        <span className="text-sm text-gray-400">
          {languageConfig.direction === 'rtl' ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full z-50 mt-1 min-w-full rounded-lg border border-gray-800 bg-gray-900 shadow-2xl"
          role="listbox"
          aria-label="Language options"
        >
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-800 ${
                lang.code === language ? 'bg-violet-500/20 text-violet-400' : 'text-white'
              }`}
              role="option"
              aria-selected={lang.code === language}
            >
              <span className="text-lg">🌐</span>
              <div>
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-sm text-gray-400">{lang.name}</div>
              </div>
              {lang.code === language && <div className="ml-auto text-violet-400">✓</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// RTL Support Utilities
export function useRTLSupport() {
  const { languageConfig } = useI18n()
  const isRTL = languageConfig.direction === 'rtl'

  // RTL-aware positioning
  const getPosition = (position: 'left' | 'right') => {
    if (!isRTL) return position
    return position === 'left' ? 'right' : 'left'
  }

  // RTL-aware margins and paddings
  const getSpacing = (type: 'margin' | 'padding', side: 'left' | 'right', value: string) => {
    const actualSide = getPosition(side)
    return `${type}-${actualSide}: ${value}`
  }

  // RTL-aware border radius
  const getBorderRadius = (corners: string) => {
    if (!isRTL) return corners

    // Flip border radius for RTL
    const mapping: Record<string, string> = {
      'rounded-l': 'rounded-r',
      'rounded-r': 'rounded-l',
      'rounded-tl': 'rounded-tr',
      'rounded-tr': 'rounded-tl',
      'rounded-bl': 'rounded-br',
      'rounded-br': 'rounded-bl',
    }

    return mapping[corners] || corners
  }

  return {
    isRTL,
    getPosition,
    getSpacing,
    getBorderRadius,
  }
}

// Date/Time Utilities with i18n support
export function useLocalizedDateTime() {
  const { language, languageConfig } = useI18n()

  const formatDateTime = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(`${language}-${languageConfig.region}`, {
      ...options,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return formatDateTime(date, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (date: Date) => {
    return formatDateTime(date, {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateFull = (date: Date) => {
    return formatDateTime(date, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return {
    formatDateTime,
    formatTime,
    formatDateShort,
    formatDateFull,
  }
}
