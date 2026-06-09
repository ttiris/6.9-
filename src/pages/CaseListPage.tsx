import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import type { Case, MediaType } from '../types';
import { MediaTypeLabels } from '../types';

export default function CaseListPage() {
  const { cases, loading, loadCases } = useCaseStore();
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => { loadCases(); }, [loadCases]);

  const filtered = cases.filter((c) => {
    if (filterType !== 'all' && c.category !== filterType) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-y2k-navy mb-1">案例库</h1>
          <p className="font-mono text-sm text-y2k-navy/50">浏览和输入媒介体验案例</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="y2k-btn y2k-btn-primary text-sm"
        >
          + 新案例
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setFilterType('all')} className={`y2k-tag text-xs ${filterType === 'all' ? 'bg-y2k-blue text-y2k-cream' : 'bg-y2k-mint/30 text-y2k-navy'}`}>全部类型</button>
        {(Object.keys(MediaTypeLabels) as MediaType[]).map((mt) => (
          <button key={mt} onClick={() => setFilterType(mt)} className={`y2k-tag text-xs ${filterType === mt ? 'bg-y2k-blue text-y2k-cream' : 'bg-y2k-mint/30 text-y2k-navy'}`}>
            {MediaTypeLabels[mt]}
          </button>
        ))}
      </div>

      {/* Case Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-y2k-navy/30 font-mono cursor-blink">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-y2k-navy/40 font-mono">暂无匹配案例</p>
          </div>
        ) : (
          filtered.map((c) => <CaseCard key={c.id} caseItem={c} />)
        )}
      </div>

      {/* Add Case Modal */}
      {showAddForm && <AddCaseModal onClose={() => setShowAddForm(false)} />}
    </div>
  );
}

function CaseCard({ caseItem: c }: { caseItem: Case }) {
  const statusColors: Record<string, string> = {
    draft: 'bg-y2k-gold/30 text-y2k-navy',
    decomposing: 'bg-y2k-blue/30 text-y2k-cream',
    decomposed: 'bg-y2k-mint/40 text-y2k-navy',
    reviewed: 'bg-y2k-pink/30 text-y2k-navy',
  };
  const statusLabels: Record<string, string> = {
    draft: '待拆解', decomposing: '拆解中', decomposed: '已拆解', reviewed: '已审核',
  };

  return (
    <Link to={c.status === 'draft' ? `/cases/${c.id}/decompose` : `/cases/${c.id}/decompose`} className="no-underline">
      <div className="y2k-card p-5 h-full group">
        <div className="flex items-center justify-between mb-3">
          <span className="y2k-tag text-xs bg-y2k-mint/30 text-y2k-navy">{MediaTypeLabels[c.category]}</span>
          <span className={`y2k-tag text-xs ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
        </div>
        <h3 className="font-display text-lg text-y2k-navy mb-2 group-hover:text-y2k-red transition-colors">
          {c.title}
        </h3>
        <p className="text-sm text-y2k-navy/60 line-clamp-2 mb-3">{c.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-y2k-navy/40">{c.source}</span>
          <span className="font-mono text-xs text-y2k-blue">
            {c.units.length > 0 ? `${c.units.length} 个单元` : '待拆解 →'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function AddCaseModal({ onClose }: { onClose: () => void }) {
  const { addCase } = useCaseStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MediaType>('exhibition');
  const [source, setSource] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const newCase: Case = {
      id: 'c' + Date.now(),
      title, description, category, source,
      mediaUrls: [], units: [],
      tags: [], createdAt: new Date().toISOString().split('T')[0],
      authorId: 'u1', status: 'draft',
    };
    await addCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-y2k-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="y2k-window max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="window-title -mx-6 -mt-6 mb-4">NEW_CASE.INPUT</div>
        <h3 className="font-display text-xl text-y2k-navy mb-4">新增案例</h3>
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs text-y2k-navy/60 block mb-1">案例标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-y2k-navy/20 rounded px-3 py-2 text-sm bg-y2k-cream focus:outline-none focus:border-y2k-blue" placeholder="案例名称" />
          </div>
          <div>
            <label className="font-mono text-xs text-y2k-navy/60 block mb-1">类别</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as MediaType)} className="w-full border border-y2k-navy/20 rounded px-3 py-2 text-sm bg-y2k-cream">
              {(Object.keys(MediaTypeLabels) as MediaType[]).map((mt) => (
                <option key={mt} value={mt}>{MediaTypeLabels[mt]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono text-xs text-y2k-navy/60 block mb-1">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-y2k-navy/20 rounded px-3 py-2 text-sm bg-y2k-cream resize-none focus:outline-none focus:border-y2k-blue" placeholder="详细描述这个案例..." />
          </div>
          <div>
            <label className="font-mono text-xs text-y2k-navy/60 block mb-1">来源</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} className="w-full border border-y2k-navy/20 rounded px-3 py-2 text-sm bg-y2k-cream focus:outline-none focus:border-y2k-blue" placeholder="如：上海西岸美术馆 2025" />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="y2k-btn text-sm flex-1">取消</button>
          <button onClick={handleSubmit} className="y2k-btn y2k-btn-primary text-sm flex-1">提交案例</button>
        </div>
      </div>
    </div>
  );
}
