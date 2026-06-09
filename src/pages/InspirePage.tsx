import { useState, useEffect } from 'react';
import { useUnitStore } from '../stores/unitStore';
import type { ExperienceUnit } from '../types';
import { MediaTypeLabels } from '../types';
import jsPDF from 'jspdf';

export default function InspirePage() {
  const { units, loadUnits } = useUnitStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [canvasUnits, setCanvasUnits] = useState<ExperienceUnit[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { loadUnits(); }, [loadUnits]);

  const availableUnits = units.filter((u) => {
    if (searchTerm && !u.title.includes(searchTerm) && !u.description.includes(searchTerm)) return false;
    if (canvasUnits.find((c) => c.id === u.id)) return false;
    return true;
  });

  const addToCanvas = (unit: ExperienceUnit) => {
    setCanvasUnits((prev) => [...prev, unit]);
  };

  const removeFromCanvas = (id: string) => {
    setCanvasUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData('unitId');
    const unit = units.find((u) => u.id === id);
    if (unit && !canvasUnits.find((c) => c.id === id)) {
      addToCanvas(unit);
    }
  };

  const generateInspiration = async () => {
    if (canvasUnits.length === 0) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));

    const types = [...new Set(canvasUnits.map((u) => MediaTypeLabels[u.mediaType]))];
    const allTags = [...new Set(canvasUnits.flatMap((u) => u.tags.filter(Boolean).map((t) => t?.name)))].filter(Boolean);
    const emotions = canvasUnits.map((u) => u.decomposition.emotionalResponse);

    const plan = `━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ 灵感设计方案
━━━━━━━━━━━━━━━━━━━━━━━━━━

【创意概念】
本方案融合 ${canvasUnits.length} 个经过验证的体验单元，跨越 ${types.join('、')} 等多个领域，
构建一个以「${allTags.slice(0, 3).join(' · ')}」为核心体验关键词的多感官媒介空间。

核心理念：将不同媒介类型的体验结构进行创造性重组，
形成一条从「引入 → 沉浸 → 共鸣 → 行动」的完整体验弧线。

━━━━━━━━━━━━━━━━━━━━━━━━━━

【体验单元详解】
${canvasUnits.map((u, i) => `
${i + 1}. ${u.title}
   📍 类型：${MediaTypeLabels[u.mediaType]}
   🔴 触发点：${u.decomposition.trigger}
   🟡 感知输入：${u.decomposition.sensoryInput}
   🟢 认知理解：${u.decomposition.cognitive}
   🔵 情绪反应：${u.decomposition.emotionalResponse}
   🟣 行为输出：${u.decomposition.behavioralOutput}
   🏷 标签：${u.tags.filter(Boolean).slice(0, 3).map((t) => t?.name).join(' · ')}
`).join('')}
━━━━━━━━━━━━━━━━━━━━━━━━━━

【视觉建议】
• 色彩基调：以低饱和度渐变为底色（蓝→粉→奶油色），重点区域使用
  ${canvasUnits[0]?.tags.filter(Boolean)[0]?.color || '#D4686A'} 作为强调色
• 空间材质：磨砂玻璃 + 柔光金属 + 暖色木质，营造柔和而精致的触感
• 光影策略：间接照明为主，关键体验节点使用聚光引导注意力
• 字体系统：标题用衬线体 (Playfair Display)，说明文字用等宽体 (Space Mono)
• 图形元素：抽象几何（圆、方、线）+ 有机形态（${allTags.slice(0, 2).join('、')}的视觉隐喻）

━━━━━━━━━━━━━━━━━━━━━━━━━━

【表现形式】
• 空间类型：${types.length > 1 ? '混合型' : types[0]}沉浸体验
• 媒介组合：${[...new Set(canvasUnits.map((u) => u.mediaType === 'exhibition' ? '实体空间 + 数字投影' : u.mediaType === 'interactiveMedia' ? '交互装置 + 实时生成' : u.mediaType === 'cityRoam' ? '城市空间 + 定位技术' : u.mediaType === 'culturalTourism' ? '文化遗产 + 数字导览' : '商业空间 + 品牌体验'))].join(' | ')}
• 互动模式：${emotions.some((e) => e.includes('协作') || e.includes('合作')) ? '单人探索 + 多人协作混合' : '以个人探索为主导，预留社交分享触点'}
• 时长设计：${canvasUnits.map((u) => u.duration).filter(Boolean).join(' + ')} 的整体节奏

━━━━━━━━━━━━━━━━━━━━━━━━━━

【空间布局建议】
入口 → 触发区(${canvasUnits[0]?.decomposition.trigger.slice(0, 15)}...) 
    → 沉浸区(多感官通道同步激活)
    → 共鸣区(情绪高峰体验)
    → 行动区(互动/创作/分享)
    → 出口(体验回响与社交传播)

━━━━━━━━━━━━━━━━━━━━━━━━━━

【情绪旅程设计】
${canvasUnits.map((u, i) => `阶段${i + 1}（${u.title.split('—')[0].trim()}）：${u.decomposition.emotionalResponse}`).join('\n')}

整体情绪曲线：好奇 → ${emotions.join(' → ')} → 满足与分享

━━━━━━━━━━━━━━━━━━━━━━━━━━

【技术建议】
• 核心设备：投影映射系统 + 空间音频阵列 + 人体追踪传感器
• 软件平台：实时渲染引擎 + 内容管理系统 + 数据分析后台
• 可复用资产：本方案全部体验单元已标准化入库，可直接迁移至新项目

━━━━━━━━━━━━━━━━━━━━━━━━━━

【创新亮点】
• 跨领域融合：${types.join(' × ')} 的边界打破
• 标签维度：${allTags.slice(0, 5).join('、')} 等 ${allTags.length} 个标签的多维交织
• 可复制性：所有单元均为已验证的标准化资产，降低试错成本
• 数据驱动：预留行为分析接口，可持续优化体验设计

━━━━━━━━━━━━━━━━━━━━━━━━━━
  © ME·Assets 灵感生成器
━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    setGeneratedPlan(plan);
    setIsGenerating(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Courier');
    doc.setFontSize(14);
    doc.text('灵感方案', 20, 20);
    doc.setFontSize(9);
    const lines = generatedPlan.split('\n');
    lines.forEach((line, i) => {
      if (i * 4 + 28 < 280) doc.text(line, 20, 28 + i * 4);
    });
    doc.save('inspiration-plan.pdf');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-y2k-navy mb-1">灵感生成器</h1>
        <p className="font-mono text-sm text-y2k-navy/50">拖拽体验单元到画布，AI 帮你重新组合生成设计方案</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Asset Picker */}
        <div className="y2k-card p-5 lg:col-span-1">
          <h3 className="font-mono text-xs text-y2k-navy/50 mb-3">体验资产池</h3>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索资产..."
            className="w-full border border-y2k-navy/20 rounded px-3 py-2 text-sm bg-y2k-cream font-mono mb-3"
          />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableUnits.map((unit) => (
              <div
                key={unit.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('unitId', unit.id)}
                onClick={() => addToCanvas(unit)}
                className="y2k-card p-3 cursor-grab hover:border-y2k-blue transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display truncate">{unit.title}</span>
                  <span className="y2k-tag text-xs bg-y2k-mint/30">{MediaTypeLabels[unit.mediaType]}</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {unit.tags.filter(Boolean).slice(0, 2).map((t) => (
                    <span key={t.id} className="text-xs" style={{ color: t.color || '#888' }}>#{t.name}</span>
                  ))}
                </div>
              </div>
            ))}
            {availableUnits.length === 0 && (
              <p className="text-center text-y2k-navy/30 font-mono text-xs py-4">所有资产已在画布中</p>
            )}
          </div>
        </div>

        {/* Center: Canvas */}
        <div
          className="y2k-card p-5 lg:col-span-2 min-h-[400px]"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{ borderColor: dragOver ? '#4A6FA5' : undefined, borderStyle: dragOver ? 'dashed' : undefined }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-xs text-y2k-navy/50">
              方案画布 ({canvasUnits.length} 个单元)
            </h3>
            <div className="flex gap-2">
              <button onClick={generateInspiration} disabled={canvasUnits.length === 0 || isGenerating} className="y2k-btn y2k-btn-primary text-xs">
                {isGenerating ? '生成中...' : '✦ 生成方案'}
              </button>
            </div>
          </div>

          {canvasUnits.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-center">
              <div>
                <span className="text-5xl text-y2k-mint/40 block mb-3">✦</span>
                <p className="font-mono text-sm text-y2k-navy/30">从左侧拖拽或点击资产<br />放入此画布</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              {canvasUnits.map((unit, idx) => (
                <div key={unit.id} className="y2k-card p-3 relative group">
                  <button onClick={() => removeFromCanvas(unit.id)} className="absolute top-2 right-2 text-y2k-navy/30 hover:text-y2k-red opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                  <span className="font-mono text-xs text-y2k-navy/30">#{idx + 1}</span>
                  <h4 className="font-display text-sm mt-1">{unit.title}</h4>
                  <p className="text-xs text-y2k-navy/50 mt-1 line-clamp-1">{unit.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Generated Plan */}
          {generatedPlan && (
            <div className="mt-4 p-5 bg-y2k-dark rounded-lg">
              <div className="window-title -mx-5 -mt-5 mb-3" style={{ background: '#D4686A' }}>✦ INSPIRE SCHEME</div>
              <pre className="text-xs font-mono text-y2k-cream/90 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
                {generatedPlan}
              </pre>
              <button onClick={exportPDF} className="y2k-btn y2k-btn-primary text-xs mt-3">
                📄 导出 PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
