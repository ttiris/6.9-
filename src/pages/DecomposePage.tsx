import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { useUnitStore } from '../stores/unitStore';
import { mockTags } from '../mock/data';
import type { Decomposition, ExperienceUnit, Tag } from '../types';

type DecomposeStep = 'idle' | 'trigger' | 'sensory' | 'cognitive' | 'emotion' | 'behavior' | 'done';

export default function DecomposePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, updateCase, loadCases } = useCaseStore();
  const { addUnit, loadUnits } = useUnitStore();
  const caseItem = cases.find((c) => c.id === id);

  const [step, setStep] = useState<DecomposeStep>('idle');
  const [decomposition, setDecomposition] = useState<Decomposition>({
    trigger: '', sensoryInput: '', cognitive: '', emotionalResponse: '', behavioralOutput: '',
  });
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { loadCases(); loadUnits(); }, [loadCases, loadUnits]);

  if (!caseItem) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-y2k-navy/40">案例未找到</p>
        <button onClick={() => navigate('/cases')} className="y2k-btn mt-4">返回案例库</button>
      </div>
    );
  }

  // Mock AI decompose: gradually fill fields
  const startDecompose = async () => {
    setIsGenerating(true);
    setStep('trigger');
    await typeText('trigger', '观众接近一个由半透明材质构成的空间界面，传感器或视觉线索引发初步好奇。');

    setStep('sensory');
    await typeText('sensoryInput', '多感官通道同时激活：视觉（光影变化）、听觉（环境音效）、触觉（材质肌理）、嗅觉（空间气味）。');

    setStep('cognitive');
    await typeText('cognitive', '观众开始理解空间规则，建立心理模型——这是一种"进入仪式"还是"游戏挑战"？');

    setStep('emotion');
    await typeText('emotionalResponse', '产生复合情绪：好奇 → 轻微不安 → 探索欲 → 成就感或沉浸感');

    setStep('behavior');
    await typeText('behavioralOutput', '观众放慢脚步、伸手触碰、环顾四周、拍照记录、与同行者交流');

    setStep('done');
    setTitle(caseItem.title + ' · 体验单元');
    setIsGenerating(false);
  };

  const typeText = (field: keyof Decomposition, text: string) => {
    return new Promise<void>((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        setDecomposition((prev) => ({ ...prev, [field]: text.slice(0, i + 1) }));
        i++;
        if (i >= text.length) { clearInterval(interval); resolve(); }
      }, 30);
    });
  };

  const saveUnit = async () => {
    const unit: ExperienceUnit = {
      id: 'u' + Date.now(),
      title: title || caseItem.title + ' · 体验单元',
      sourceCaseId: caseItem.id,
      decomposition,
      tags: selectedTags.length > 0 ? selectedTags : [mockTags[0], mockTags[2]],
      mediaType: caseItem.category,
      difficulty: 2,
      duration: '3-5 分钟',
      description: decomposition.trigger.slice(0, 50) + '...',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      authorId: 'u1',
      isPublic: true,
      popularity: 50 + Math.floor(Math.random() * 30),
      favorites: 0,
    };
    await addUnit(unit);
    await updateCase(caseItem.id, {
      status: 'decomposed',
      units: [...caseItem.units, unit.id],
    });
    navigate(`/assets/${unit.id}`);
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  return (
    <div>
      <div className="mb-8">
        <button onClick={() => navigate('/cases')} className="font-mono text-sm text-y2k-blue hover:text-y2k-red">
          ← 返回案例库
        </button>
        <h1 className="font-display text-3xl text-y2k-navy mt-2">AI 拆解工作台</h1>
        <p className="font-mono text-sm text-y2k-navy/50 mt-1">案例：{caseItem.title}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Case Info */}
        <div className="y2k-card p-6">
          <div className="window-title -mx-6 -mt-6 mb-4">CASE.VIEW</div>
          <span className="y2k-tag text-xs bg-y2k-mint/30 text-y2k-navy mb-3 inline-block">
            {caseItem.category}
          </span>
          <h2 className="font-display text-xl text-y2k-navy mb-3">{caseItem.title}</h2>
          <p className="text-sm text-y2k-navy/70 leading-relaxed">{caseItem.description}</p>
          <p className="font-mono text-xs text-y2k-navy/40 mt-4">来源：{caseItem.source}</p>
          {step === 'idle' && (
            <button onClick={startDecompose} className="y2k-btn y2k-btn-primary mt-6 w-full">
              🤖 开始 AI 拆解
            </button>
          )}
        </div>

        {/* Right: Decompose Panel */}
        <div className="y2k-card p-6 bg-y2k-dark text-y2k-cream">
          <div className="window-title -mx-6 -mt-6 mb-4" style={{ background: '#C44B4B' }}>AI.DECOMPOSE</div>

          <DecomposeField
            label="🔴 触发点 Trigger"
            active={step === 'trigger' || ['sensory', 'cognitive', 'emotion', 'behavior', 'done'].includes(step)}
            value={decomposition.trigger}
            onChange={(v) => setDecomposition((p) => ({ ...p, trigger: v }))}
            editable={step === 'done'}
          />
          <DecomposeField
            label="🟡 感知输入 Sensory"
            active={['sensory', 'cognitive', 'emotion', 'behavior', 'done'].includes(step)}
            value={decomposition.sensoryInput}
            onChange={(v) => setDecomposition((p) => ({ ...p, sensoryInput: v }))}
            editable={step === 'done'}
          />
          <DecomposeField
            label="🟢 认知理解 Cognitive"
            active={['cognitive', 'emotion', 'behavior', 'done'].includes(step)}
            value={decomposition.cognitive}
            onChange={(v) => setDecomposition((p) => ({ ...p, cognitive: v }))}
            editable={step === 'done'}
          />
          <DecomposeField
            label="🔵 情绪反应 Emotion"
            active={['emotion', 'behavior', 'done'].includes(step)}
            value={decomposition.emotionalResponse}
            onChange={(v) => setDecomposition((p) => ({ ...p, emotionalResponse: v }))}
            editable={step === 'done'}
          />
          <DecomposeField
            label="🟣 行为输出 Behavior"
            active={['behavior', 'done'].includes(step)}
            value={decomposition.behavioralOutput}
            onChange={(v) => setDecomposition((p) => ({ ...p, behavioralOutput: v }))}
            editable={step === 'done'}
          />

          {isGenerating && (
            <p className="font-mono text-xs text-y2k-gold mt-4 cursor-blink">AI 分析中...</p>
          )}
        </div>
      </div>

      {/* Tags & Save */}
      {step === 'done' && (
        <div className="y2k-card p-6 mt-6">
          <h3 className="font-display text-lg text-y2k-navy mb-3">选择标签</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {mockTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag)}
                className="y2k-tag text-xs cursor-pointer transition-all"
                style={{
                  background: selectedTags.find((t) => t.id === tag.id) ? tag.color : tag.color + '20',
                  color: selectedTags.find((t) => t.id === tag.id) ? '#fff' : tag.color,
                  border: selectedTags.find((t) => t.id === tag.id) ? `1px solid ${tag.color}` : '1px solid transparent',
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 border border-y2k-navy/20 rounded px-3 py-2 text-sm bg-y2k-cream"
              placeholder="体验单元标题"
            />
            <button onClick={saveUnit} className="y2k-btn y2k-btn-primary">
              存入资产库 ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DecomposeField({
  label, active, value, onChange, editable,
}: {
  label: string; active: boolean; value: string;
  onChange: (v: string) => void; editable: boolean;
}) {
  return (
    <div className={`mb-4 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-30'}`}>
      <p className="font-mono text-xs text-y2k-gold mb-1">{label}</p>
      {editable ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-y2k-cream resize-none focus:outline-none focus:border-y2k-gold"
        />
      ) : (
        <p className="text-sm text-y2k-cream/80 leading-relaxed min-h-[2rem]">
          {value || (active ? <span className="cursor-blink" /> : '等待 AI 生成...')}
        </p>
      )}
    </div>
  );
}
