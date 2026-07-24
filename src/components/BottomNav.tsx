import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const links = [
  {
    to: '/',
    key: 'nav.today',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 13.5C7.5 7 9.5 5 12 5s4.5 2 8 8.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="14" r="2.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/chart',
    key: 'nav.chart',
    end: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 16l4.2-4.2 3.2 3.2L20 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/methodology',
    key: 'nav.method',
    end: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 5h10a2 2 0 012 2v12l-3-1.5L13 19l-3-1.5L7 19V7a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/settings',
    key: 'nav.settings',
    end: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.8 6.8l1.4 1.4M15.8 15.8l1.4 1.4M17.2 6.8l-1.4 1.4M8.2 15.8l-1.4 1.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const

export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav className="bottom-nav" aria-label="Primary">
      <div className="bottom-nav-inner">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {link.icon}
            <span>{t(link.key)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
