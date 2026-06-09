import { useState } from 'react';
import { useUnitStore } from '../stores/unitStore';
import { mockBriefTemplates } from '../mock/data';
import type { MediaType } from '../types';
import { MediaTypeLabels } from '../types';
import jsPDF from 'jspdf';

export default function BriefGeneratorPage() {
  const { units } = useUnitStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [recommendedUnits, setRecommendedUnits] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const template = mockBriefTemplates.find((t) => t.id === selectedTemplate);

  const generatePlan = async () => {
    if (!title.trim() || !template) return;
    setIsGenerating(true);

    // Mock AI recommendation: pick 2-3 matching units
    const matching = units
      .filter((u) => u.mediaType === template.type)
      .slice(0, 3);
    setRecommendedUnits(matching.map((u) => u.id));

    // Mock generated plan — comprehensive project brief
    await new Promise((r) => setTimeout(r, 2000));

    const typeName = MediaTypeLabels[template.type];
    const avgDifficulty = matching.length > 0
      ? Math.round(matching.reduce((s, u) => s + u.difficulty, 0) / matching.length)
      : 2;
    const allEmotions = [...new Set(matching.flatMap((u) => u.decomposition.emotionalResponse.split('→').map((e) => e.trim())))];
    const allTags = [...new Set(matching.flatMap((u) => u.tags.filter(Boolean).map((t) => t?.name).filter(Boolean)))];

    setGeneratedPlan(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 项目 Brief · ${title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【项目概述】
项目名称：${title}
项目类型：${typeName}
难度等级：${'★'.repeat(avgDifficulty)}${'☆'.repeat(5 - avgDifficulty)}
生成日期：${new Date().toLocaleDateString('zh-CN')}
基于资产：${matching.length} 个已验证体验单元

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【项目背景与目标】
${requirements ? requirements : `本${typeName}项目旨在通过媒介体验结构单元化方法论，构建一个多层次的感官体验空间/旅程。目标受众涵盖文化消费者、设计从业者及普通公众，期望在${typeName === 'exhibition' ? '展览期间吸引5万+参观者' : typeName === 'culturalTourism' ? '带动区域文旅消费增长15%' : typeName === 'cityRoam' ? '覆盖城市核心文化节点' : typeName === 'interactiveMedia' ? '实现线上线下联动传播' : '提升品牌体验价值与用户留存'}`}。

【核心理念】
基于媒介体验结构单元化方法论，从${matching.length}个已通过市场验证的体验单元中提取关键体验基因，
构建「${allTags.slice(0, 4).join(' · ')}」为核心关键词的多感官体验叙事。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【推荐体验单元详解】
${matching.map((u, i) => `
${i + 1}. ${u.title}
   📍 来源类型：${MediaTypeLabels[u.mediaType]}
   🎯 难度：${'★'.repeat(u.difficulty)}${'☆'.repeat(5 - u.difficulty)}
   ⏱ 参考时长：${u.duration}
   🔴 触发点：${u.decomposition.trigger}
   🟡 感知输入：${u.decomposition.sensoryInput}
   🟢 认知理解：${u.decomposition.cognitive}
   🔵 情绪反应：${u.decomposition.emotionalResponse}
   🟣 行为输出：${u.decomposition.behavioralOutput}
   🏷 标签：${u.tags.filter(Boolean).slice(0, 4).map((t) => t?.name).filter(Boolean).join(' · ')}
`).join('')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【体验流程设计】

第一阶段 · 引入（预计${typeName === 'exhibition' ? '3-5' : typeName === 'cityRoam' ? '5-8' : '2-4'}分钟）
├─ 空间氛围营造：利用光影、音效、材质建立第一印象
├─ 触发点激活：${matching[0]?.decomposition.trigger.slice(0, 40) || '通过空间设计激发初始好奇心'}...
└─ 预期情绪：好奇 → 期待

第二阶段 · 沉浸（预计${typeName === 'exhibition' ? '10-20' : typeName === 'cityRoam' ? '15-30' : '8-15'}分钟）
├─ 多感官通道同步激活：${allTags.filter((t) => t.includes('视觉') || t.includes('听觉') || t.includes('触觉') || t.includes('音频') || t.includes('投影')).slice(0, 3).join('、') || '视觉+听觉+触觉'}
├─ 认知框架建立：引导观众理解空间规则与叙事逻辑
├─ 核心互动展开：${matching.length > 1 ? matching[1]?.decomposition.behavioralOutput.slice(0, 40) : matching[0]?.decomposition.behavioralOutput.slice(0, 40)}...
└─ 预期情绪：${allEmotions.slice(0, 3).join(' → ')}

第三阶段 · 共鸣（预计${typeName === 'exhibition' ? '5-10' : typeName === 'cityRoam' ? '8-12' : '3-8'}分钟）
├─ 情绪高峰体验：${allEmotions.filter((e) => e.includes('敬畏') || e.includes('惊奇') || e.includes('共鸣') || e.includes('感动')).slice(0, 2).join('、') || '共鸣与情感连接'}
├─ 个人记忆激活：通过${allTags.filter((t) => t.includes('记忆') || t.includes('叙事') || t.includes('故事')).slice(0, 2).join('、') || '叙事线索'}建立情感锚点
├─ 社交连接触发：${allTags.includes('社交分享') ? '设计拍照与分享触点' : '创造与同伴交流的自然契机'}
└─ 预期情绪：${allEmotions.slice(-3).join(' → ')}

第四阶段 · 行动与回响（预计${typeName === 'exhibition' ? '5-10' : '不限定'}分钟）
├─ 主动参与引导：${matching[matching.length - 1]?.decomposition.behavioralOutput.slice(0, 40) || '鼓励观众主动探索'}...
├─ UGC 内容生成：设计拍照打卡点、社交分享激励
├─ 体验沉淀：提供数字纪念品或个性化内容
└─ 预期情绪：${allEmotions.includes('成就感') ? '成就感' : '满足'} → 分享冲动

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【目标受众画像】
• 核心受众：${template.type === 'exhibition' ? '艺术爱好者、设计师、文化消费者（25-45岁）' : template.type === 'culturalTourism' ? '文化旅游者、家庭游客、研学团体（全年龄段）' : template.type === 'cityRoam' ? '城市探索者、摄影爱好者、本地居民（20-40岁）' : template.type === 'interactiveMedia' ? '科技爱好者、新媒体从业者、Z世代（18-35岁）' : '品牌消费者、商业空间访客、社交活跃用户（22-40岁）'}
• 辐射受众：行业从业者、学生群体、媒体与KOL
• 预计覆盖：${template.type === 'exhibition' ? '50,000-100,000' : template.type === 'commercialSpace' ? '200,000-500,000' : '30,000-80,000'} 人次

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【技术配置建议】
• 核心硬件：${template.type === 'exhibition' || template.type === 'interactiveMedia' ? '投影映射系统 + 空间音频阵列 + 人体追踪传感器 + LED灯光矩阵' : template.type === 'cityRoam' ? 'GPS定位模块 + 移动端App + 蓝牙信标 + 云端内容管理' : template.type === 'culturalTourism' ? 'AR/VR设备 + 触摸交互屏 + 定向音响 + 香氛扩散系统' : 'LED屏幕 + 传感器网络 + 手机App + 社交媒体API'}
• 软件平台：${template.type === 'cityRoam' ? '位置触发引擎 + 内容管理后台 + 用户行为分析' : '实时渲染引擎 + 内容管理系统 + 数据分析平台'}
• 可复用资产：全方案体验单元已标准化入库，可直接迁移至后续项目

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【空间与动线规划】
• 空间需求：${template.type === 'exhibition' ? '500-2000㎡ 室内/半室外空间' : template.type === 'commercialSpace' ? '200-800㎡ 商业空间' : template.type === 'cityRoam' ? '城市街区 2-5km 路线' : template.type === 'culturalTourism' ? '1000-3000㎡ 文旅场所' : '300-1000㎡ 灵活空间'}
• 动线设计：自由探索式（非线性） + 引导节点（关键体验峰值）
• 停留时间：${matching.reduce((s, u) => s + (u.duration.includes('分钟') ? parseInt(u.duration) || 5 : u.duration.includes('小时') ? 120 : 10), 0) * 0.7} 分钟（预计平均）


【内容制作清单】
${matching.map((u, i) => `${i + 1}. ${u.title}
   - 视觉内容：${u.mediaType === 'exhibition' ? '高分辨率投影素材 + 动态粒子动画' : u.mediaType === 'interactiveMedia' ? '实时生成视觉 + 交互界面设计' : '定制化视觉内容'}
   - 音频内容：${u.tags.filter(Boolean).some((t) => t?.name?.includes('音频') || t?.name?.includes('声')) ? '空间音频素材 + 环境音景' : '背景音乐 + 触发音效'}
   - 交互逻辑：${u.decomposition.behavioralOutput.slice(0, 50)}...`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【预算框架（参考）】
• 硬件设备：30-40%
• 内容制作：25-35%
• 空间设计与搭建：15-25%
• 运营与人力：10-15%
• 应急储备：5-10%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【时间规划建议】
• 概念设计阶段：4-6 周
• 内容制作阶段：${matching.length * 2}-${matching.length * 3} 周
• 技术集成与测试：3-4 周
• 试运营与优化：2-3 周
• 正式运营：根据项目周期

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【成功指标 KPI】
• 核心指标：
  - 参观/体验人次：目标 ${template.type === 'commercialSpace' ? '200,000+' : template.type === 'exhibition' ? '50,000+' : '30,000+'}
  - 平均停留时间：目标 > ${Math.round(matching.reduce((s, u) => s + (u.duration.includes('分钟') ? parseInt(u.duration) || 5 : 10), 0) / matching.length * 0.6)} 分钟
  - 社交媒体曝光：目标 > 500,000 次
• 体验指标：
  - 用户满意度：目标 > 4.2/5
  - ${allTags.includes('社交分享') ? '社交分享率：目标 > 35%' : 'NPS 净推荐值：目标 > 50'}
  - 重复访问率：目标 > 15%
• 资产指标：
  - 新增可复用体验单元：${matching.length} 个
  - 数据采集完整度：目标 > 90%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【风险与应对】
• 技术风险：传感器/投影设备故障 → 模块化冗余设计 + 快速替换方案
• 内容风险：用户体验未达预期 → A/B测试 + 快速迭代机制
• 运营风险：人流管理失控 → 预约制 + 动态限流算法
• 市场风险：传播效果不足 → KOL合作 + 社交激励策略

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【创新亮点】
• 跨领域融合：${[...new Set(matching.map((u) => MediaTypeLabels[u.mediaType]))].join(' × ')} 的体验基因重组
• 资产化思维：全方案可拆解为 ${matching.length} 个标准化体验单元，可迁移复用
• 数据驱动：预留行为分析接口，支持持续优化
• 情感设计：基于五维拆解模型（触发→感知→认知→情绪→行为）的精准情绪旅程

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 Brief 由 ME·Assets 生成 · ${new Date().toLocaleDateString('zh-CN')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    setIsGenerating(false);
  };

  const selectedUnitsData = units.filter((u) => recommendedUnits.includes(u.id));

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Courier');
    doc.setFontSize(16);
    doc.text(title || '项目 Brief', 20, 20);
    doc.setFontSize(10);
    const lines = generatedPlan.split('\n');
    lines.forEach((line, i) => {
      if (i * 5 + 30 < 280) doc.text(line, 20, 30 + i * 5);
    });
    doc.save(`${title || 'brief'}.pdf`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-y2k-navy mb-1">项目 Brief 生成器</h1>
        <p className="font-mono text-sm text-y2k-navy/50">选择模板 → 填写需求 → AI 生成结构化 Brief</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div>
          {/* Template Selection */}
          <div className="y2k-card p-5 mb-4">
            <h3 className="font-mono text-xs text-y2k-navy/50 mb-3">1. 选择需求模板</h3>
            <div className="grid grid-cols-2 gap-2">
              {mockBriefTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); setGeneratedPlan(''); setRecommendedUnits([]); }}
                  className={`y2k-tag text-xs text-left cursor-pointer p-3 ${selectedTemplate === t.id ? 'bg-y2k-blue text-y2k-cream' : 'bg-y2k-mint/20 text-y2k-navy'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            {template && (
              <div className="mt-3">
                <p className="font-mono text-xs text-y2k-navy/40">
                  结构：{template.structure.join(' / ')}
                </p>
              </div>
            )}
          </div>

          {/* Input Form */}
          {template && (
            <div className="y2k-card p-5">
              <h3 className="font-mono text-xs text-y2k-navy/50 mb-3">2. 填写项目信息</h3>
              <div className="space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="项目名称"
                  className="w-full border border-y2k-navy/20 rounded px-3 py-2 text-sm bg-y2k-cream font-mono"
                />
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder="详细描述项目需求和目标..."
                  className="w-full border border-y2k-navy/20 rounded px-3 py-2 text-sm bg-y2k-cream resize-none font-mono"
                />
                <button
                  onClick={generatePlan}
                  disabled={isGenerating || !title.trim()}
                  className="y2k-btn y2k-btn-primary w-full text-sm"
                >
                  {isGenerating ? '生成中...' : '🤖 生成 Brief'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Result */}
        <div>
          {generatedPlan ? (
            <div className="y2k-card p-5 bg-y2k-cream-warm">
              <div className="window-title -mx-5 -mt-5 mb-4" style={{ background: '#6B8DB8' }}>📋 BRIEF OUTPUT</div>
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto pr-2" style={{ color: '#3E2723' }}>
                {generatedPlan}
              </pre>
              <div className="flex gap-2 mt-4">
                <button onClick={exportPDF} className="y2k-btn y2k-btn-primary text-xs">
                  📄 导出 PDF
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedPlan)}
                  className="y2k-btn text-xs"
                >
                  📋 复制全文
                </button>
              </div>
            </div>
          ) : (
            <div className="y2k-card p-5 text-center py-16">
              <span className="text-4xl text-y2k-mint block mb-3">▣</span>
              <p className="font-mono text-sm text-y2k-navy/40">选择模板并填写信息<br />AI 将生成结构化 Brief</p>
            </div>
          )}

          {/* Recommended Units */}
          {selectedUnitsData.length > 0 && (
            <div className="y2k-card p-5 mt-4">
              <h3 className="font-mono text-xs text-y2k-navy/50 mb-3">推荐体验资产</h3>
              <div className="space-y-2">
                {selectedUnitsData.map((u) => (
                  <a key={u.id} href={`/assets/${u.id}`} className="block text-sm text-y2k-blue hover:text-y2k-red no-underline">
                    ◆ {u.title} <span className="text-y2k-navy/40">— {MediaTypeLabels[u.mediaType]}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
