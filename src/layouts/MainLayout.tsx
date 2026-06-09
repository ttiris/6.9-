import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { seedDatabase } from '../mock/data';

const navItems = [
  { path: '/', label: '首页', icon: '◆' },
  { path: '/cases', label: '案例库', icon: '◇' },
  { path: '/assets', label: '资产库', icon: '◎' },
  { path: '/graph', label: '标签图谱', icon: '⬡' },
  { path: '/brief', label: 'Brief', icon: '▣' },
  { path: '/inspire', label: '灵感生成', icon: '✦' },
  { path: '/dashboard', label: '数据看板', icon: '◈' },
];

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      await seedDatabase();
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-y2k-bg scanlines">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-y2k-navy/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <span className="text-y2k-red text-2xl font-mono">◈</span>
            <span className="font-display text-lg text-y2k-navy tracking-wide">
              ME·Assets
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
              className={`px-3 py-2 text-sm font-body no-underline transition-all rounded-md ${
                location.pathname === item.path
                  ? 'bg-y2k-pink-soft/30 text-y2k-red font-medium'
                  : 'text-y2k-navy/55 hover:text-y2k-navy hover:bg-y2k-mint-soft/30'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/guide" className="y2k-tag bg-y2k-mint-soft/40 text-y2k-navy/60 text-xs hover:text-y2k-red transition-colors">
              新手指引
            </Link>
            <Link to="/challenge" className="y2k-btn y2k-btn-primary text-xs px-4 py-2">
              拆解挑战
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-y2k-navy/5 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-body text-xs text-y2k-navy/35 tracking-wide">
            Media Experience Structural Unit Assets © 2026
          </p>
          <p className="font-body text-xs text-y2k-navy/20 mt-1.5">
            Designed with Y2K Millennium Aesthetic
          </p>
        </div>
      </footer>
    </div>
  );
}
