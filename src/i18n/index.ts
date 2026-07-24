import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import zh from './zh.json'

const LANG_KEY = 'pulse:lang'

function detectLang(): string {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'zh' || saved === 'en') return saved
  } catch {
    // ignore
  }
  const nav = navigator.language?.toLowerCase() ?? 'en'
  return nav.startsWith('zh') ? 'zh' : 'en'
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: detectLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export function setAppLanguage(lng: 'zh' | 'en') {
  void i18n.changeLanguage(lng)
  try {
    localStorage.setItem(LANG_KEY, lng)
  } catch {
    // ignore
  }
}

export default i18n
