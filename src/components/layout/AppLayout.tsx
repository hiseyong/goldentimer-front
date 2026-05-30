import { NavLink, Outlet, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/patient', label: 'Patient', shortLabel: 'Patient', Icon: PatientIcon },
  { to: '/paramedic', label: 'Paramedic', shortLabel: 'Paramedic', Icon: ParamedicIcon },
  {
    to: '/medical-staff',
    label: 'Medical Staff',
    shortLabel: 'Staff',
    Icon: StaffIcon,
  },
] as const

const PAGE_TITLES: Record<string, string> = {
  '/patient': 'Patient',
  '/patient/register': 'Registration',
  '/paramedic': 'Paramedic',
  '/medical-staff': 'Medical Staff',
}

const HIDE_BOTTOM_NAV = ['/patient/register']

export function AppLayout() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Golden Timer'
  const showBottomNav = !HIDE_BOTTOM_NAV.includes(pathname)

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-slate-200 text-slate-900 sm:bg-slate-100">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col overflow-hidden bg-white sm:shadow-xl">
        <AppTopBar title={title} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <Outlet />
        </main>

        {showBottomNav && <BottomNav />}
      </div>
    </div>
  )
}

function AppTopBar({ title }: { title: string }) {
  return (
    <header className="shrink-0 border-b border-slate-800 bg-slate-950 pt-[env(safe-area-inset-top,0px)]">
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Golden Time
          </p>
        </div>

        <h1 className="max-w-[10rem] truncate text-center text-sm font-semibold text-white sm:max-w-none">
          {title}
        </h1>

        <div className="flex justify-end">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Notifications"
          >
            <BellIcon />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-950" />
          </button>
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  return (
    <nav
      className="shrink-0 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md"
      aria-label="Role navigation"
    >
      <div className="flex px-2 pt-1.5">
        {NAV_ITEMS.map(({ to, shortLabel, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="truncate">{shortLabel}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-14 0v5l-2 2v1h18v-1l-2-2Z" />
    </svg>
  )
}

function PatientIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-6 1.67-6 3.75V20h12v-2.25C18 15.67 15.33 14 12 14Z" />
    </svg>
  )
}

function ParamedicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 8h-2V6a3 3 0 0 0-6 0v2H9a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3Zm-4-2a1 1 0 0 1 2 0v2h-2V6ZM6 11v8H4v-8h2Zm14 0v8h2v-8h-2Zm-5 4h-2v-2h2v2Z" />
    </svg>
  )
}

function StaffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a5 5 0 0 0-5 5v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 7V7a3 3 0 0 1 6 0v2H9Zm3 4a2 2 0 1 1-2 2 2 2 0 0 1 2-2Z" />
    </svg>
  )
}
