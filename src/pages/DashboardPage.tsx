import { useEffect } from 'react';
import { useUnitStore } from '../stores/unitStore';
import { useCaseStore } from '../stores/caseStore';
import { useTagStore } from '../stores/tagStore';
import { MediaTypeLabels } from '../types';
import type { MediaType } from '../types';

export default function DashboardPage() {
  const { units, loadUnits } = useUnitStore();
  const { cases, loadCases } = useCaseStore();
  const { tags, loadTags } = useTagStore();

  useEffect(() => { loadUnits(); loadCases(); loadTags(); }, [loadUnits, loadCases, loadTags]);

  const typeDistribution = (Object.keys(MediaTypeLabels) as MediaType[]).map((mt) => ({
    type: MediaTypeLabels[mt],
    count: units.filter((u) => u.mediaType === mt).length,
    color: mt === 'exhibition' ? '#6B8DB8' : mt === 'culturalTourism' ? '#D4686A' : mt === 'cityRoam' ? '#BCC9C4' : mt === 'interactiveMedia' ? '#D4A8B8' : '#EECB80',
  }));

  const topUnits = [...units].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
  const topTags = [...tags].sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);
  const decomposedCount = cases.filter((c) => c.status === 'decomposed').length;
  const maxTypeCount = Math.max(...typeDistribution.map((t) => t.count), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-y2k-navy mb-1">数据反馈看板</h1>
        <p className="font-mono text-sm text-y2k-navy/50">系统运行数据与资产使用洞察</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '体验资产总数', value: units.length, color: '#4A6FA5' },
          { label: '案例总数', value: cases.length, color: '#C44B4B' },
          { label: '已拆解案例', value: decomposedCount, color: '#B8C9C1' },
          { label: '标签维度', value: tags.length, color: '#D4A0B5' },
        ].map((card) => (
          <div key={card.label} className="y2k-card p-5 text-center">
            <p className="font-display text-3xl mb-1" style={{ color: card.color }}>{card.value}</p>
            <p className="font-mono text-xs text-y2k-navy/50">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <div className="y2k-card p-5">
          <h3 className="font-mono text-xs text-y2k-navy/50 mb-4">资产类型分布</h3>
          <div className="space-y-3">
            {typeDistribution.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>{item.type}</span>
                  <span className="text-y2k-navy/50">{item.count} 个</span>
                </div>
                <div className="h-2 bg-y2k-mint/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / maxTypeCount) * 100}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Assets */}
        <div className="y2k-card p-5">
          <h3 className="font-mono text-xs text-y2k-navy/50 mb-4">热门资产 TOP 8</h3>
          <div className="space-y-2">
            {topUnits.map((u, i) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-xs text-y2k-navy/30 w-5">{i + 1}</span>
                  <span className="truncate">{u.title}</span>
                </div>
                <span className="font-mono text-xs text-y2k-blue ml-2">★ {u.popularity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tag Usage */}
        <div className="y2k-card p-5 lg:col-span-2">
          <h3 className="font-mono text-xs text-y2k-navy/50 mb-4">标签热度云</h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <span
                key={tag.id}
                className="y2k-tag text-xs"
                style={{
                  background: tag.color + '20',
                  color: tag.color,
                  fontSize: `${0.65 + tag.usageCount * 0.04}rem`,
                  padding: `${2 + tag.usageCount * 0.5}px ${8 + tag.usageCount}px`,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
