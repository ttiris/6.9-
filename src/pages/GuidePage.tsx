import { useState } from 'react';
import { Link } from 'react-router-dom';

const steps = [
  {
    step: 1,
    title: '了解系统',
    desc: 'ME·Assets 是面向 AI 设计协作时代的媒介体验结构单元化系统。它将媒介体验案例拆解为可复用的「体验单元」。',
    icon: '◈',
  },
  {
    step: 2,
    title: '输入案例',
    desc: '在「案例库」中提交你的媒介体验案例——可以是一个展览、一条文旅路线、一个互动装置或一个商业空间。',
    icon: '◇',
    link: '/cases',
  },
  {
    step: 3,
    title: 'AI 拆解',
    desc: 'AI 会将案例拆解为 5 个维度：触发点 → 感知输入 → 认知理解 → 情绪反应 → 行为输出，生成标准化的体验单元卡片。',
    icon: '🤖',
    link: '/cases',
  },
  {
    step: 4,
    title: '浏览资产库',
    desc: '所有拆解完成的体验单元会进入资产库。你可以按类型、标签、热度筛选和搜索。',
    icon: '◎',
    link: '/assets',
  },
  {
    step: 5,
    title: '探索标签图谱',
    desc: '在交互式标签图谱中探索案例、单元、情绪和行为之间的关联，发现隐藏的创意连接。',
    icon: '⬡',
    link: '/graph',
  },
  {
    step: 6,
    title: '生成灵感方案',
    desc: '在「灵感生成器」中将多个体验单元拖拽组合，AI 会帮你生成全新的设计方案。',
    icon: '✦',
    link: '/inspire',
  },
];

export default function GuidePage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-y2k-navy mb-1">新手引导</h1>
        <p className="font-mono text-sm text-y2k-navy/50">跟随 6 个步骤快速上手 ME·Assets</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-mono whitespace-nowrap transition-colors ${
              i === currentStep
                ? 'bg-y2k-blue text-y2k-cream'
                : i < currentStep
                ? 'bg-y2k-mint/30 text-y2k-navy/60'
                : 'bg-y2k-mint/10 text-y2k-navy/30'
            }`}
          >
            <span>{s.icon}</span>
            {s.step}. {s.title}
          </button>
        ))}
      </div>

      {/* Current Step Detail */}
      <div className="y2k-card p-8 text-center max-w-2xl mx-auto">
        <span className="text-5xl block mb-4">{steps[currentStep].icon}</span>
        <h2 className="font-display text-2xl text-y2k-navy mb-3">
          {steps[currentStep].step}. {steps[currentStep].title}
        </h2>
        <p className="text-y2k-navy/70 leading-relaxed mb-6">
          {steps[currentStep].desc}
        </p>
        <div className="flex items-center justify-center gap-3">
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(currentStep - 1)} className="y2k-btn text-sm">
              ← 上一步
            </button>
          )}
          {steps[currentStep].link && (
            <Link to={steps[currentStep].link!} className="y2k-btn y2k-btn-primary text-sm no-underline">
              去体验 →
            </Link>
          )}
          {currentStep < steps.length - 1 && (
            <button onClick={() => setCurrentStep(currentStep + 1)} className="y2k-btn text-sm">
              下一步 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
