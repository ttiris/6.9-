import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnitStore } from '../stores/unitStore';
import { useCaseStore } from '../stores/caseStore';
import type { ExperienceUnit } from '../types';
import { MediaTypeLabels } from '../types';

export default function HomePage() {
  const { units, loadUnits } = useUnitStore();
  const { cases, loadCases } = useCaseStore();
  const [topUnits, setTopUnits] = useState<ExperienceUnit[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadUnits();
    loadCases();
  }, [loadUnits, loadCases]);

  useEffect(() => {
    if (units.length > 0) {
      setTopUnits([...units].sort((a, b) => b.popularity - a.popularity).slice(0, 4));
    }
    // First visit check
    if (!localStorage.getItem('mea_visited')) {
      setShowGuide(true);
      localStorage.setItem('mea_visited', '1');
    }
  }, [units]);

  return (
    <div>
      {/* Hero Section — Creative Editorial Layout */}
      <section className="bg-y2k-hero rounded-2xl p-0 mb-16 relative overflow-hidden" style={{ minHeight: 'clamp(380px, 60vh, 560px)' }}>

        {/* Background: giant watermark character */}
        <div className="hero-watermark" style={{ right: '-4%', bottom: '-12%' }}>体</div>
        <div className="hero-watermark" style={{ left: '-4%', top: '-10%', opacity: 0.025 }}>验</div>

        {/* Organic gradient orbs */}
        <div className="hero-orb" style={{ width: 280, height: 280, background: 'rgba(196,75,75,0.2)', right: '15%', top: '-15%' }} />
        <div className="hero-orb" style={{ width: 200, height: 200, background: 'rgba(240,199,94,0.15)', left: '30%', bottom: '-10%' }} />

        {/* Checkered accent strip at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 checkered-bg opacity-25" />

        {/* Diagonal accent line */}
        <div className="hero-diagonal-accent hidden md:block" style={{ right: '32%', top: '8%' }} />

        {/* Main Editorial Grid — fully centered */}
        <div className="hero-editorial px-8 md:px-14 py-12 md:py-16">
          {/* Background Visual Collage — absolute positioned decorations */}
          <div className="hero-editorial-visual hidden md:block">
            <div className="relative w-full h-full">
              <div className="absolute bottom-0 left-[5%] right-[5%] h-1/3 checkered-bg opacity-8 rounded-t-sm"
                style={{ backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0' }} />
              <div className="hero-abstract-chair" style={{ left: '8%', top: '35%', transform: 'rotate(-6deg) scale(0.8)', opacity: 0.08 }} />
              <div className="hero-abstract-chair" style={{ right: '10%', top: '30%', transform: 'rotate(10deg) scale(0.65)', opacity: 0.07 }} />
              <div className="hero-abstract-chair" style={{ left: '45%', top: '45%', transform: 'rotate(2deg) scale(0.55)', opacity: 0.06 }} />
              <div className="hero-cat-silhouette" style={{ right: '15%', bottom: '20%', opacity: 0.05 }}>
                <svg width="35" height="25" viewBox="0 0 45 35" fill="none"><ellipse cx="22" cy="20" rx="14" ry="12" fill="white"/><polygon points="10,12 4,2 14,10" fill="white"/><polygon points="34,12 40,2 30,10" fill="white"/></svg>
              </div>
              <div className="hero-spring" style={{ right: '6%', top: '10%', opacity: 0.08 }}>
                <svg viewBox="0 0 80 60" fill="none"><path d="M40 5 C20 5, 15 20, 40 20 C65 20, 60 35, 40 35 C20 35, 15 50, 40 50" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
              </div>
              <div className="hero-inset-frame" style={{ right: '12%', top: '12%', width: '50px', height: '40px', transform: 'rotate(5deg)', opacity: 0.6 }}>
                <div className="hero-inset-frame-inner"><div style={{width:'12px',height:'14px',border:'1.5px solid rgba(255,255,255,0.3)',borderRadius:'2px 2px 0 0',margin:'6px auto 0'}}/><div style={{width:'4px',height:'8px',borderLeft:'1.5px solid rgba(255,255,255,0.3)',borderRight:'1.5px solid rgba(255,255,255,0.3)',margin:'0 auto'}}/></div>
              </div>
            </div>
          </div>

          {/* Centered Text Block */}
          <div className="hero-editorial-text">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="hero-tag-pill">AI-Powered</span>
              <span className="hero-tag-pill">Design Assets</span>
            </div>
            <h1 className="font-display text-y2k-cream leading-[0.95] mb-3" style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}>
              <span className="block">媒介体验</span>
              <span className="block">
                <span className="text-y2k-cream/70 italic">结构</span>
                <span className="text-y2k-cream">单元化</span>
              </span>
              <span className="block text-y2k-gold">设计资产</span>
            </h1>
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-y2k-cream/20" />
              <p className="font-mono text-xs md:text-sm text-y2k-cream/45 tracking-wider">
                DECONSTRUCT <span className="text-y2k-cream/25 mx-1">·</span>
                TAG <span className="text-y2k-cream/25 mx-1">·</span>
                REMIX <span className="text-y2k-cream/25 mx-1">·</span>
                CREATE
              </p>
              <div className="h-px w-8 bg-y2k-cream/20" />
            </div>
            <p className="font-body text-y2k-cream/75 max-w-xl mx-auto mb-4 text-sm md:text-base leading-relaxed text-center">
              把展览、文旅、互动装置等媒介体验<span className="text-y2k-gold/80">拆解为标准单元</span>，
              像搭积木一样<span className="text-y2k-gold/80">组合创新方案</span>。
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/challenge" className="y2k-btn y2k-btn-primary text-sm px-7 py-3">⚡ 3分钟入门 →</Link>
              <Link to="/cases" className="y2k-btn y2k-btn-ghost text-sm">浏览案例库</Link>
              <Link to="/inspire" className="y2k-btn y2k-btn-ghost text-sm">灵感生成器</Link>
            </div>
          </div>
        </div>

        {/* Floating stat cards — positioned absolutely over the section edges */}
        <div className="hero-floating-stat hidden md:block" style={{ left: '8%', bottom: '-12px' }}>
          <div className="stat-number">{units.length}+</div>
          <div className="stat-label">体验资产</div>
        </div>
        <div className="hero-floating-stat hidden md:block" style={{ right: '38%', bottom: '-12px' }}>
          <div className="stat-number">{cases.filter(c => c.status === 'decomposed').length || 4}</div>
          <div className="stat-label">已拆解案例</div>
        </div>

        {/* Featured unit preview card — floating on the right */}
        {topUnits.length > 0 && (
          <div className="hero-featured-card hidden lg:block" style={{ right: '5%', top: '50%', transform: 'translateY(-50%) rotate(-1deg)', maxWidth: '160px' }}>
            <div className="fc-tag">✦ 热门资产</div>
            <div className="fc-title">{topUnits[0].title.split('—')[0].trim()}</div>
            <div className="fc-meta">★ {topUnits[0].popularity} · {MediaTypeLabels[topUnits[0].mediaType]}</div>
          </div>
        )}

        {/* Mobile decorations */}
        <div className="md:hidden absolute right-6 top-6 text-6xl text-y2k-cream/6 font-mono">◈</div>
        <div className="md:hidden absolute right-10 bottom-10 w-16 h-16 border border-y2k-cream/10 rounded-full" />
      </section>

      {/* Stats Section — with glass overlay and blob shapes */}
      <section className="relative mb-20 px-4">
        {/* Organic blob decorations */}
        <div className="shape-blob shape-blob-1 hidden md:block" style={{ left: '-5%', top: '-40px' }} />
        <div className="shape-blob shape-blob-2 hidden md:block" style={{ right: '-3%', bottom: '-30px' }} />
        <div className="shape-blob shape-blob-3 hidden md:block" style={{ left: '45%', top: '20px' }} />

        {/* Abstract ring decorations */}
        <div className="shape-ring hidden md:block" style={{ left: '12%', top: '-15px', width: 50, height: 50, borderColor: 'var(--y2k-blue)', opacity: 0.12 }} />
        <div className="shape-ring hidden md:block" style={{ right: '8%', bottom: '-20px', width: 36, height: 36, borderColor: 'var(--y2k-red)', opacity: 0.1 }} />

        {/* Glass overlay — overlaps hero and stats */}
        <div className="glass-overlay">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: '体验资产', value: units.length, unit: '个', accent: '#6B8DB8' },
              { label: '拆解案例', value: cases.filter(c => c.status === 'decomposed').length, unit: '个', accent: '#D4686A' },
              { label: '标签维度', value: '6', unit: '类', accent: '#BCC9C4' },
              { label: '方案模板', value: '5', unit: '套', accent: '#D4A8B8' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group cursor-default">
                <p className="font-display text-3xl md:text-4xl mb-1 transition-colors group-hover:text-y2k-red"
                  style={{ color: stat.accent }}>
                  {stat.value}
                </p>
                <p className="font-body text-xs text-y2k-navy/40 tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Assets — with glass heading */}
      <section className="relative mb-20 px-4">
        {/* Background blob */}
        <div className="shape-blob shape-blob-2 hidden md:block" style={{ left: '50%', top: '-60px', transform: 'translateX(-50%) scale(1.5)', opacity: 0.5 }} />

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="glass-pill">✦ Trending</span>
              <span className="font-mono text-xs text-y2k-navy/25 tracking-widest">HOT UNITS</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-y2k-navy">热门体验资产</h2>
          </div>
          <Link to="/assets" className="y2k-btn text-sm">
            查看全部 →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {topUnits.map((unit) => (
            <Link key={unit.id} to={`/assets/${unit.id}`} className="no-underline">
              <div className="y2k-card-framed p-5 h-full group">
                <div className="flex items-start justify-between mb-3">
                  <span className="y2k-tag bg-y2k-mint/30 text-y2k-navy/70 text-xs">
                    {MediaTypeLabels[unit.mediaType]}
                  </span>
                  <span className="font-mono text-xs text-y2k-navy/30">★ {unit.popularity}</span>
                </div>
                <h3 className="font-display text-lg text-y2k-navy mb-2 group-hover:text-y2k-red transition-colors leading-snug">
                  {unit.title}
                </h3>
                <p className="font-body text-sm text-y2k-navy/50 line-clamp-2 leading-relaxed">{unit.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {unit.tags.filter(Boolean).slice(0, 3).map((t) => (
                    <span key={t.id} className="y2k-tag text-xs" style={{ background: (t.color || '#888') + '15', color: t.color || '#888' }}>
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links — with glass panel */}
      <section className="relative mb-16 px-4">
        <div className="shape-ring hidden md:block" style={{ right: '5%', top: '-10px', width: 60, height: 60, borderColor: 'var(--y2k-gold)', opacity: 0.15 }} />

        <div className="glass-panel p-8 md:p-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="glass-pill">🎯 我想做……</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-y2k-navy mb-8">选一个任务开始</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { to: '/challenge', title: '快速理解方法论', desc: '5 道选择题 · 3 分钟理解体验拆解思维', icon: '⚡', accent: '#D4686A', tag: '推荐新手' },
              { to: '/cases', title: '查看案例拆解', desc: '23 个真实案例已拆解 · 看别人怎么做的', icon: '🔍', accent: '#6B8DB8', tag: '' },
              { to: '/brief', title: '策划新项目', desc: '输入项目约束 · 匹配可复用的体验单元', icon: '📋', accent: '#EECB80', tag: '' },
              { to: '/inspire', title: '组合创新方案', desc: '拖拽体验单元到画布 · 自动生成方案', icon: '💡', accent: '#D4A8B8', tag: '' },
              { to: '/assets', title: '按类型浏览资产', desc: '展览 · 文旅 · 互动 · 商业 · 城市漫游', icon: '📦', accent: '#BCC9C4', tag: '' },
              { to: '/graph', title: '探索标签关联', desc: '发现情绪·行为·认知之间的隐藏关系', icon: '⬡', accent: '#4A6FA5', tag: '' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="no-underline group">
                <div className="bg-y2k-cream-warm/60 backdrop-blur-sm border border-white/60 rounded-lg p-6 h-full hover:bg-white/80 transition-all duration-300 hover:shadow-lg relative">
                  {item.tag && (
                    <span className="absolute top-3 right-3 font-mono text-[0.6rem] bg-y2k-red/10 text-y2k-red px-2 py-0.5 rounded-full">{item.tag}</span>
                  )}
                  <span className="text-2xl block mb-4 transition-transform group-hover:scale-110" style={{ color: item.accent }}>
                    {item.icon}
                  </span>
                  <h3 className="font-display text-lg text-y2k-navy mb-1.5">{item.title}</h3>
                  <p className="font-body text-sm text-y2k-navy/40 leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* First Visit Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-y2k-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="y2k-window max-w-md w-full p-6">
            <div className="window-title -mx-6 -mt-6 mb-4">WELCOME.EXE</div>
            <h3 className="font-display text-xl text-y2k-navy mb-3">你想用这个工具做什么？</h3>
            <div className="space-y-2 mb-4 text-sm text-y2k-navy/60">
              <p>🎯 <b>快速上手</b>：玩一局「拆解挑战」（3分钟，像做选择题）</p>
              <p>🔍 <b>找灵感</b>：浏览 23 个案例的拆解结果</p>
              <p>💡 <b>拼方案</b>：拖拽体验单元到画布，自动生成策划案</p>
            </div>
            <div className="flex gap-2">
              <Link to="/challenge" className="y2k-btn y2k-btn-primary text-sm flex-1 text-center" onClick={() => setShowGuide(false)}>
                ⚡ 3分钟快速入门
              </Link>
              <button className="y2k-btn text-sm flex-1" onClick={() => setShowGuide(false)}>
                先自己逛逛
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
