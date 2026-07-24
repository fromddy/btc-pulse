import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { BottomNav } from '../components/BottomNav'
import { PwaUpdateBanner } from '../components/PwaUpdateBanner'
import { ChartPage } from '../pages/ChartPage'
import { MethodologyPage } from '../pages/MethodologyPage'
import { SettingsPage } from '../pages/SettingsPage'
import { TodayPage } from '../pages/TodayPage'
import { PulseProvider } from '../state/PulseContext'

function DocumentTitle() {
  const { t, i18n } = useTranslation()
  useEffect(() => {
    document.title = `${t('brand.name')} · ${t('brand.tagline')}`
    document.documentElement.lang = i18n.language.startsWith('zh') ? 'zh' : 'en'
  }, [t, i18n.language])
  return null
}

export default function App() {
  return (
    <PulseProvider>
      <BrowserRouter>
        <DocumentTitle />
        <PwaUpdateBanner />
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/chart" element={<ChartPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <BottomNav />
      </BrowserRouter>
    </PulseProvider>
  )
}
