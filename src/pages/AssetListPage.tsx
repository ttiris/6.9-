import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnitStore } from '../stores/unitStore';
import type { ExperienceUnit, MediaType } from '../types';
import { MediaTypeLabels } from '../types';

export default function AssetListPage() {
  const { units, loadUnits, toggleFavorite } = useUnitStore();
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'newest'>('popularity');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadUnits(); }, [loadUnits]);

  const filtered = units
    .filter((u) => {
      if (filterType !== 'all' && u.mediaType !== filterType) return false;
      if (searchTerm && !u.title.includes(searchTerm) && !u.description.includes(searchTerm)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-y2k-navy mb-1">体验资产库</h1>
        <p className="font-mono text-sm text-y2k-navy/50">可理解、可调用、可复用的标准化体验单元</p>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索资产..."
          className="flex-1 border border-y2k-navy/20 rounded px-4 py-2 text-sm bg-y2k-cream focus:outline-none focus:border-y2k-blue font-mono"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'popularity' | 'newest')}
          className="border border-y2k-navy/20 rounded px-3 py-2 text-sm bg-y2k-cream font-mono"
        >
          <option value="popularity">按热度</option>
          <option value="newest">按最新</option>
        </select>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilterType('all')} className={`y2k-tag text-xs ${filterType === 'all' ? 'bg-y2k-blue text-y2k-cream' : 'bg-y2k-mint/30 text-y2k-navy'}`}>全部</button>
        {(Object.keys(MediaTypeLabels) as MediaType[]).map((mt) => (
          <button key={mt} onClick={() => setFilterType(mt)} className={`y2k-tag text-xs ${filterType === mt ? 'bg-y2k-blue text-y2k-cream' : 'bg-y2k-mint/30 text-y2k-navy'}`}>
            {MediaTypeLabels[mt]}
          </button>
        ))}
      </div>

      {/* Asset Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((unit) => (
          <AssetCard key={unit.id} unit={unit} onToggleFav={() => toggleFavorite(unit.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-y2k-navy/40 font-mono">暂无匹配资产</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCard({ unit, onToggleFav }: { unit: ExperienceUnit; onToggleFav: () => void }) {
  return (
    <div className="y2k-card p-5 group relative">
      <div className="flex items-start justify-between mb-3">
        <span className="y2k-tag text-xs bg-y2k-mint/40 text-y2k-navy">{MediaTypeLabels[unit.mediaType]}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-y2k-navy/40">★ {unit.popularity}</span>
          <button onClick={(e) => { e.preventDefault(); onToggleFav(); }} className="text-sm hover:text-y2k-red transition-colors">
            {unit.favorites > 0 ? '♥' : '♡'}
          </button>
        </div>
      </div>
      <Link to={`/assets/${unit.id}`} className="no-underline">
        <h3 className="font-display text-lg text-y2k-navy mb-2 group-hover:text-y2k-red transition-colors">
          {unit.title}
        </h3>
        <p className="text-sm text-y2k-navy/60 line-clamp-2 mb-3">{unit.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {unit.tags.filter(Boolean).slice(0, 4).map((t) => (
            <span key={t.id} className="y2k-tag text-xs" style={{ background: (t.color || '#888') + '20', color: t.color || '#888' }}>{t.name}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-y2k-navy/40">难度 {'★'.repeat(unit.difficulty)}{'☆'.repeat(5 - unit.difficulty)}</span>
          <span className="font-mono text-xs text-y2k-navy/30">{unit.duration}</span>
        </div>
      </Link>
    </div>
  );
}
