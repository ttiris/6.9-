import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTagStore } from '../stores/tagStore';
import { useUnitStore } from '../stores/unitStore';
import type { Tag } from '../types';
import { TagCategoryLabels, MediaTypeLabels } from '../types';

export default function TagGraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { tags, loadTags } = useTagStore();
  const { units, loadUnits } = useUnitStore();
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  useEffect(() => { loadTags(); loadUnits(); }, [loadTags, loadUnits]);

  useEffect(() => {
    if (!svgRef.current || tags.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const width = svgRef.current.clientWidth;
    const height = 500;

    // Build nodes & links from tags
    const nodes = tags.map((t) => ({ id: t.id, name: t.name, category: t.category, color: t.color, usageCount: t.usageCount }));
    const links: { source: string; target: string }[] = [];
    tags.forEach((t) => {
      t.relatedTags.forEach((rt) => {
        if (nodes.find((n) => n.id === rt) && !links.find((l) => (l.source === t.id && l.target === rt) || (l.source === rt && l.target === t.id))) {
          links.push({ source: t.id, target: rt });
        }
      });
    });

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const g = svg.append('g');

    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', '#B8C9C1').attr('stroke-width', 1).attr('stroke-opacity', 0.4);

    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<any, any>().on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append('circle')
      .attr('r', (d) => 8 + d.usageCount * 0.8)
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.8)
      .attr('stroke', '#fff').attr('stroke-width', 1.5);

    node.append('text')
      .text((d) => d.name)
      .attr('x', 14).attr('y', 4)
      .attr('font-family', 'Space Mono, monospace')
      .attr('font-size', '10px')
      .attr('fill', '#2C3E50');

    node.on('click', (_, d) => {
      const tag = tags.find((t) => t.id === d.id);
      if (tag) setSelectedTag(tag);
    });

    simulation.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [tags]);

  const relatedUnits = selectedTag
    ? units.filter((u) => Array.isArray(u.tags) && u.tags.some((t) => t && t.id === selectedTag.id))
    : [];
  const relatedTags = selectedTag
    ? tags.filter((t) => selectedTag.relatedTags.includes(t.id))
    : [];

  const maxUsage = Math.max(...tags.map((t) => t.usageCount), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-y2k-navy mb-1">标签关系图谱</h1>
        <p className="font-mono text-sm text-y2k-navy/50">拖拽节点探索标签之间的关联，点击查看关联资产</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div className="lg:col-span-2 y2k-card p-4 overflow-hidden">
          <svg ref={svgRef} width="100%" height="500" />
        </div>

        {/* Detail Panel — Enhanced */}
        <div className="y2k-card p-5 flex flex-col">
          {selectedTag ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-y2k-navy/8 mb-4">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: selectedTag.color }}>
                  {selectedTag.name.charAt(0)}
                </span>
                <div>
                  <h3 className="font-display text-lg text-y2k-navy leading-tight">{selectedTag.name}</h3>
                  <p className="font-mono text-xs text-y2k-navy/40">
                    {TagCategoryLabels[selectedTag.category] || selectedTag.category}
                  </p>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-y2k-navy/50">使用热度</span>
                  <span className="text-y2k-navy/70 font-semibold">{selectedTag.usageCount} 次</span>
                </div>
                <div className="h-2 bg-y2k-mint/20 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(selectedTag.usageCount / maxUsage) * 100}%`, background: selectedTag.color }} />
                </div>
              </div>

              {/* Related Tags */}
              {relatedTags.length > 0 && (
                <div className="mb-4">
                  <p className="font-mono text-xs text-y2k-navy/50 mb-2">
                    关联标签 ({relatedTags.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {relatedTags.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTag(t)}
                        className="y2k-tag text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: t.color + '18', color: t.color, borderColor: t.color + '30' }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Assets */}
              <div className="flex-1 overflow-hidden">
                <p className="font-mono text-xs text-y2k-navy/50 mb-2">
                  关联资产 ({relatedUnits.length})
                </p>
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {relatedUnits.length > 0 ? relatedUnits.map((u) => (
                    <a
                      key={u.id}
                      href={`/assets/${u.id}`}
                      className="block p-2 rounded hover:bg-y2k-mint/10 no-underline transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-y2k-navy truncate group-hover:text-y2k-red transition-colors">
                          {u.title}
                        </span>
                        <span className="text-xs font-mono text-y2k-navy/30 whitespace-nowrap">
                          ★{u.popularity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-y2k-navy/30">{MediaTypeLabels[u.mediaType]}</span>
                        <span className="text-xs text-y2k-navy/20">·</span>
                        <span className="text-xs text-y2k-navy/30">{u.duration}</span>
                      </div>
                    </a>
                  )) : (
                    <p className="text-xs text-y2k-navy/30 font-mono py-3 text-center">
                      暂无关联资产
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-y2k-mint/20 flex items-center justify-center mb-4">
                <span className="text-3xl text-y2k-blue/40">⬡</span>
              </div>
              <p className="font-display text-base text-y2k-navy/50 mb-1">探索标签网络</p>
              <p className="font-body text-xs text-y2k-navy/30 leading-relaxed max-w-[180px]">
                拖拽节点自由探索<br />点击任意节点<br />查看详情与关联资产
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
