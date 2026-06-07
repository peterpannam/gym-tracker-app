"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BarChart2, Plus, History, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_TABS = [
  { href: '/dashboard', label: 'Home',    Icon: Home },
  { href: '/stats',     label: 'Stats',   Icon: BarChart2 },
  null,
  { href: '/history',  label: 'History', Icon: History },
  { key: 'me',         label: 'Me',      Icon: User },
];

export default function Navigation({ onLogOpen }) {
  const pathname = usePathname();
  const { currentProfile, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = currentProfile?.name?.[0]?.toUpperCase() ?? '?';

  function handleLogout() {
    setMenuOpen(false);
    logout();
    router.push('/login');
  }

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}

      {menuOpen && (
        <div
          className="fixed z-50 right-[14px] bottom-[88px] w-[210px]"
          onClick={e => e.stopPropagation()}
        >
          <div className="rounded-[18px] bg-sheet border border-border-strong overflow-hidden p-[6px]"
            style={{ boxShadow: '0 18px 50px rgba(0,0,0,0.6)' }}>
            <div className="flex items-center gap-[11px] px-[10px] pt-[10px] pb-3">
              <div className="size-10 rounded-[13px] border border-border-strong text-brand font-display font-bold text-[18px] flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(140deg, var(--surface-2), #0c0f15)' }}>
                {initial}
              </div>
              <div>
                <div className="text-t1 font-bold text-[15px] font-display tracking-[var(--display-ls)] uppercase">
                  {currentProfile?.name}
                </div>
                <div className="text-t3 text-[11.5px]">Local profile</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-[10px] p-3 rounded-[12px] cursor-pointer border-0 bg-transparent text-red text-[14px] font-semibold"
            >
              <LogOut size={17} />
              Log out
            </button>
          </div>
        </div>
      )}

      <div
        className="fixed left-0 right-0 bottom-0 z-30"
        style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}
      >
        <div className="gt-nav mx-3 h-[66px] flex items-center px-[6px]">
          {NAV_TABS.map((tab) => {
            if (tab === null) {
              return (
                <div key="log" className="flex-1 flex justify-center">
                  <button
                    onClick={onLogOpen}
                    className="size-[52px] rounded-[17px] bg-brand text-on-brand -mt-[22px] border-0 cursor-pointer flex items-center justify-center"
                    style={{ boxShadow: '0 10px 26px var(--brand-glow), 0 0 0 5px var(--bg)' }}
                  >
                    <Plus size={26} strokeWidth={2.6} />
                  </button>
                </div>
              );
            }

            if (tab.key === 'me') {
              return (
                <button
                  key="me"
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex-1 flex flex-col items-center gap-[3px] py-2 bg-transparent border-0 cursor-pointer"
                >
                  <div className={`size-[26px] rounded-[8px] border border-border-strong font-display font-bold text-[12px] flex items-center justify-center transition-all duration-150 ${menuOpen ? 'bg-brand text-on-brand' : 'bg-surface-2 text-t3'}`}>
                    {initial}
                  </div>
                  <span className={`text-[10px] tracking-[0.02em] transition-colors duration-150 ${menuOpen ? 'font-bold text-brand' : 'font-medium text-t3'}`}>
                    ME
                  </span>
                </button>
              );
            }

            const active = pathname === tab.href;
            const { Icon } = tab;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center gap-[3px] py-2 no-underline transition-colors duration-150 ${active ? 'text-brand' : 'text-t3'}`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[10px] tracking-[0.02em] ${active ? 'font-bold' : 'font-medium'}`}>
                  {tab.label.toUpperCase()}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
