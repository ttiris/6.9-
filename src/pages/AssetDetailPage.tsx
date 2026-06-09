import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUnitStore } from '../stores/unitStore';
import { MediaTypeLabels } from '../types';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { units, loadUnits } = useUnitStore();

  useEffect(() => { loadUnits(); }, [loadUnits]);

  const unit = units.find((u) => u.id === id);
  if (!unit) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-y2k-navy/40">资产未找到</p>
        <button onClick={() => navigate('/assets')} className="y2k-btn mt-4">返回资产库</button>
      </div>
    );
  }

  const dims = [
    { key: 'trigger', label: '触发点', icon: '🔴', content: unit.decomposition.trigger },
    { key: 'sensoryInput', label: '感知输入', icon: '🟡', content: unit.decomposition.sensoryInput },
    { key: 'cognitive', label: '认知理解', icon: '🟢', content: unit.decomposition.cognitive },
    { key: 'emotionalResponse', label: '情绪反应', icon: '🔵', content: unit.decomposition.emotionalResponse },
    { key: 'behavioralOutput', label: '行为输出', icon: '🟣', content: unit.decomposition.behavioralOutput },
  ];

  return (
    <div>
      <button onClick={() => navigate('/assets')} className="font-mono text-sm text-y2k-blue hover:text-y2k-red mb-4 inline-block">
        ← 返回资产库
      </button>

      {/* Header */}
      <div className="y2k-card p-8 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <span className="y2k-tag text-xs bg-y2k-mint/40 text-y2k-navy mb-2 inline-block">
              {MediaTypeLabels[unit.mediaType]}
            </span>
            <h1 className="font-display text-3xl text-y2k-navy">{unit.title}</h1>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl text-y2k-blue">★ {unit.popularity}</p>
            <p className="font-mono text-xs text-y2k-navy/40">热度指数</p>
          </div>
        </div>
        <p className="text-y2k-navy/70 mb-4">{unit.description}</p>
        <div className="flex flex-wrap gap-4 font-mono text-xs text-y2k-navy/50">
          <span>难度：{'★'.repeat(unit.difficulty)}{'☆'.repeat(5 - unit.difficulty)}</span>
          <span>时长：{unit.duration}</span>
          <span>创建：{unit.createdAt}</span>
          <Link to={`/cases/${unit.sourceCaseId}/decompose`} className="text-y2k-blue hover:text-y2k-red">查看来源案例 →</Link>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {unit.tags.filter(Boolean).map((t) => (
            <span key={t.id} className="y2k-tag text-xs" style={{ background: (t.color || '#888') + '20', color: t.color || '#888' }}>{t.name}</span>
          ))}
        </div>
      </div>

      {/* Decomposition Dimensions */}
      <h2 className="font-display text-xl text-y2k-navy mb-4">体验结构拆解</h2>
      <div className="space-y-3 mb-8">
        {dims.map((dim) => (
          <div key={dim.key} className="y2k-card p-5 flex gap-4">
            <span className="text-2xl flex-shrink-0">{dim.icon}</span>
            <div>
              <h3 className="font-mono text-xs text-y2k-navy/50 mb-1">{dim.label}</h3>
              <p className="text-sm text-y2k-navy leading-relaxed">{dim.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="y2k-btn y2k-btn-primary text-sm">♥ 收藏</button>
        <button className="y2k-btn text-sm">🔗 分享</button>
        <Link to="/inspire" className="y2k-btn text-sm no-underline">✦ 加入灵感生成器</Link>
      </div>
    </div>
  );
}
