"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BarChart2, Plus, History, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_TABS = [
  { href: '/dashboard', label: 'Home',    Icon: Home },
  { href: '/stats',     label: 'Stats',   Icon: BarChart2 },
  null, // center Log slot
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
      {/* Profile menu backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Profile menu */}
      {menuOpen && (
        <div
          className="fixed z-50"
          style={{ right: 14, bottom: 88, width: 210 }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{
            borderRadius: 18,
            background: 'var(--sheet)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            padding: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 10px 12px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 13,
                background: 'linear-gradient(140deg, var(--surface-2), #0c0f15)',
                border: '1px solid var(--border-strong)',
                color: 'var(--brand)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {initial}
              </div>
              <div>
                <div style={{
                  color: 'var(--t1)', fontWeight: 700, fontSize: 15,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: 'var(--display-ls)', textTransform: 'uppercase',
                }}>
                  {currentProfile?.name}
                </div>
                <div style={{ color: 'var(--t3)', fontSize: 11.5 }}>Local profile</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 12px', borderRadius: 12, cursor: 'pointer',
                border: 'none', background: 'transparent',
                color: 'var(--red)', fontSize: 14, fontWeight: 600,
              }}
            >
              <LogOut size={17} />
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Nav bar */}
      <div
        className="fixed left-0 right-0 bottom-0 z-30"
        style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}
      >
        <div
          className="gt-nav"
          style={{
            margin: '0 12px',
            height: 66,
            display: 'flex',
            alignItems: 'center',
            padding: '0 6px',
          }}
        >
          {NAV_TABS.map((tab, i) => {
            /* Center Log button */
            if (tab === null) {
              return (
                <div key="log" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={onLogOpen}
                    style={{
                      width: 52, height: 52, borderRadius: 17,
                      background: 'var(--brand)', color: 'var(--on-brand)',
                      marginTop: -22, border: 'none', cursor: 'pointer',
                      boxShadow: '0 10px 26px var(--brand-glow), 0 0 0 5px var(--bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Plus size={26} strokeWidth={2.6} />
                  </button>
                </div>
              );
            }

            /* Me tab */
            if (tab.key === 'me') {
              return (
                <button
                  key="me"
                  onClick={() => setMenuOpen(v => !v)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 3, padding: '8px 0',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 8,
                    background: menuOpen ? 'var(--brand)' : 'var(--surface-2)',
                    border: '1px solid var(--border-strong)',
                    color: menuOpen ? 'var(--on-brand)' : 'var(--t3)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700, fontSize: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}>
                    {initial}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: menuOpen ? 700 : 500,
                    color: menuOpen ? 'var(--brand)' : 'var(--t3)',
                    letterSpacing: '0.02em', transition: 'color .15s',
                  }}>
                    ME
                  </span>
                </button>
              );
            }

            /* Regular route tab */
            const active = pathname === tab.href;
            const { Icon } = tab;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3, padding: '8px 0',
                  color: active ? 'var(--brand)' : 'var(--t3)',
                  textDecoration: 'none', transition: 'color .15s',
                }}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                <span style={{
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  letterSpacing: '0.02em',
                }}>
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
