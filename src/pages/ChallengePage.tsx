import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { useUnitStore } from '../stores/unitStore';
import type { Case, Decomposition } from '../types';

// ===== 类型 =====
type Difficulty = 'easy' | 'normal' | 'hard';
type ChallengePhase = 'idle' | 'countdown' | 'active' | 'submitted' | 'bonus';
type GemType = 0 | 1 | 2 | 3 | 4;

interface GemCell { type: GemType; id: number; isNew: boolean; isMatched: boolean; }
interface Achievement { id: string; name: string; icon: string; condition: (s: number, combo: number) => boolean; unlocked: boolean; }

// ===== 维度定义 =====
type DimKey = 'trigger' | 'sensoryInput' | 'cognitive' | 'emotionalResponse' | 'behavioralOutput';

const DIMENSIONS: { key: DimKey; label: string; emoji: string; color: string }[] = [
  { key: 'trigger', label: '触发点', emoji: '🔴', color: '#D4686A' },
  { key: 'sensoryInput', label: '感知输入', emoji: '🟡', color: '#EECB80' },
  { key: 'cognitive', label: '认知理解', emoji: '🟢', color: '#BCC9C4' },
  { key: 'emotionalResponse', label: '情绪反应', emoji: '🔵', color: '#6B8DB8' },
  { key: 'behavioralOutput', label: '行为输出', emoji: '🟣', color: '#D4A8B8' },
];

// ===== 选择题选项（每题6个·2个★高分答案） =====
const CHOICE_OPTIONS: Record<DimKey, { text: string; score: number; icon: string }[]> = {
  trigger: [
    { text: '视觉奇观 / 巨大尺度冲击', score: 5, icon: '👁️' },
    { text: '互动装置 / 传感器即时响应', score: 5, icon: '🤖' },
    { text: '空间转换 / 环境突变', score: 4, icon: '🚪' },
    { text: '声音引导 / 音频叙事开启', score: 3, icon: '🔊' },
    { text: '社交邀请 / 他人行为触发', score: 3, icon: '👥' },
    { text: '神秘暗示 / 好奇心驱动', score: 3, icon: '❓' },
  ],
  sensoryInput: [
    { text: '多感官融合 / 全感官沉浸', score: 5, icon: '🌀' },
    { text: '视觉投影 / 光影空间覆盖', score: 5, icon: '💡' },
    { text: '空间音频 / 环绕声场定位', score: 4, icon: '🎵' },
    { text: '触觉反馈 / 物理材质互动', score: 4, icon: '🖐️' },
    { text: '自然元素 / 环境氛围包裹', score: 3, icon: '🌿' },
    { text: '数字界面 / 屏幕交互反馈', score: 2, icon: '📱' },
  ],
  cognitive: [
    { text: '身份转换 / 角色深度代入', score: 5, icon: '🎭' },
    { text: '因果推理 / 逻辑关系发现', score: 5, icon: '🧩' },
    { text: '空间导航 / 自主路径探索', score: 4, icon: '🗺️' },
    { text: '记忆唤起 / 情感联想激活', score: 4, icon: '💭' },
    { text: '规则发现 / 模式识别顿悟', score: 3, icon: '💡' },
    { text: '文化解码 / 符号意义建构', score: 3, icon: '📖' },
  ],
  emotionalResponse: [
    { text: '敬畏 → 沉浸 → 情感共鸣', score: 5, icon: '😲' },
    { text: '好奇 → 探索 → 成就满足', score: 5, icon: '🔍' },
    { text: '紧张 → 释放 → 愉悦升华', score: 4, icon: '😌' },
    { text: '陌生 → 共鸣 → 归属连接', score: 4, icon: '🤝' },
    { text: '惊喜 → 分享 → 社交自豪', score: 3, icon: '🎉' },
    { text: '放松 → 专注 → 心流体验', score: 3, icon: '🧘' },
  ],
  behavioralOutput: [
    { text: '拍照记录 → 社交平台分享传播', score: 5, icon: '📸' },
    { text: '自由探索 → 深度停留沉浸', score: 5, icon: '🚶' },
    { text: '互动参与 → 协作共创产出', score: 4, icon: '🤲' },
    { text: '购买消费 → 品牌自发传播', score: 3, icon: '🛍️' },
    { text: '学习记录 → 知识二次传播', score: 3, icon: '📝' },
    { text: '身体参与 → 全身沉浸体验', score: 4, icon: '🏃' },
  ],
};

// ===== 难度 =====
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; icon: string; time: number; baseScore: number; desc: string }> = {
  easy:    { label: '新手上路', icon: '🌱', time: 180, baseScore: 2, desc: '充裕时间，适合热身' },
  normal:  { label: '进阶挑战', icon: '⚡', time: 120, baseScore: 3, desc: '标准难度，锻炼拆解思维' },
  hard:    { label: '大师试炼', icon: '🔥', time: 60,  baseScore: 5, desc: '极限时间，展现真正实力' },
};

// ===== 成就 =====
const ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'perfect', name: '完美选择', icon: '🎯', condition: (s) => s >= 95 },
  { id: 'full_combo', name: '全维洞察', icon: '⭐', condition: (_, c) => c >= 5 },
  { id: 'high_score', name: '高分达人', icon: '🏆', condition: (s) => s >= 80 },
  { id: 'first_blood', name: '初出茅庐', icon: '🌟', condition: () => true },
  { id: 'master', name: '拆解大师', icon: '👑', condition: (s) => s >= 90 },
];

// ===== 消消乐常量 =====
const GRID_ROWS = 6, GRID_COLS = 6, MAX_MOVES = 10;
const GEM_COLORS = ['#D4686A', '#EECB80', '#BCC9C4', '#6B8DB8', '#D4A8B8'];
const GEM_EMOJIS = ['🔴', '🟡', '🟢', '🔵', '🟣'];
const GEM_LABELS = ['触发', '感知', '认知', '情绪', '行为'];

let gemIdCounter = 0;
function rGem(type?: GemType): GemCell {
  return { type: type ?? (Math.floor(Math.random() * 5) as GemType), id: ++gemIdCounter, isNew: true, isMatched: false };
}
function genGrid(): GemCell[][] {
  const g: GemCell[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    g[r] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      let t: GemType;
      do { t = Math.floor(Math.random() * 5) as GemType; } while (
        (c >= 2 && g[r][c - 1].type === t && g[r][c - 2].type === t) ||
        (r >= 2 && g[r - 1][c].type === t && g[r - 2][c].type === t));
      g[r][c] = { type: t, id: ++gemIdCounter, isNew: false, isMatched: false };
    }
  }
  return g;
}
function findMatches(g: GemCell[][]): [number, number][] {
  const matched = new Set<string>();
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS - 2; c++)
      if (g[r][c].type === g[r][c + 1].type && g[r][c].type === g[r][c + 2].type) {
        let end = c + 2; while (end + 1 < GRID_COLS && g[r][end + 1].type === g[r][c].type) end++;
        for (let k = c; k <= end; k++) matched.add(`${r},${k}`);
      }
  for (let c = 0; c < GRID_COLS; c++)
    for (let r = 0; r < GRID_ROWS - 2; r++)
      if (g[r][c].type === g[r + 1][c].type && g[r][c].type === g[r + 2][c].type) {
        let end = r + 2; while (end + 1 < GRID_ROWS && g[end + 1][c].type === g[r][c].type) end++;
        for (let k = r; k <= end; k++) matched.add(`${k},${c}`);
      }
  return Array.from(matched).map(s => s.split(',').map(Number) as [number, number]);
}
function clearAndDrop(g: GemCell[][]): GemCell[][] {
  const ng = g.map(row => row.map(c => ({ ...c })));
  for (let c = 0; c < GRID_COLS; c++) {
    const existing: GemCell[] = [], newOnes: GemCell[] = [];
    for (let r = GRID_ROWS - 1; r >= 0; r--)
      if (ng[r][c].isMatched) newOnes.push(rGem());
      else existing.push({ ...ng[r][c], isNew: false, isMatched: false });
    const filled = [...existing, ...newOnes];
    for (let r = 0; r < GRID_ROWS; r++)
      ng[GRID_ROWS - 1 - r][c] = r < filled.length ? filled[r] : rGem();
  }
  return ng;
}
function findHint(g: GemCell[][]): [number, number, number, number] | null {
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++)
      for (const [dr, dc] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) continue;
        const ng = g.map(row => row.map(cell => ({ ...cell, isMatched: false })));
        [ng[r][c], ng[nr][nc]] = [{ ...ng[nr][nc] }, { ...ng[r][c] }];
        if (findMatches(ng).length > 0) return [r, c, nr, nc];
      }
  return null;
}

function spawnConfetti() {
  const colors = ['#D4686A', '#EECB80', '#6B8DB8', '#D4A8B8', '#BCC9C4', '#4A6FA5', '#E8938E'];
  return Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: -10 - Math.random() * 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8, delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 2, rotation: Math.random() * 360,
  }));
}

// ===== 宝石 SVG 创意图案 =====
const GEM_SHAPES: { bg: string; fg: string; render: (size: number) => JSX.Element }[] = [
  {
    bg: '#D4686A', fg: '#F5A0A2',
    render: (s) => ( // 🔴 圆形+四角星（触发）
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <circle cx="24" cy="24" r="22" fill="#D4686A" />
        <circle cx="24" cy="24" r="18" fill="#E8938E" />
        <polygon points="24,8 27,17 36,17 29,23 31,32 24,27 17,32 19,23 12,17 21,17" fill="#F5A0A2" opacity="0.8"/>
      </svg>
    )
  },
  {
    bg: '#EECB80', fg: '#F5E0B5',
    render: (s) => ( // 🟡 六边形+六角星（感知）
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <polygon points="24,3 43,14 43,34 24,45 5,34 5,14" fill="#EECB80" />
        <polygon points="24,7 39,16 39,32 24,41 9,32 9,16" fill="#F5E0B5" />
        <polygon points="24,10 28,17 35,17 30,22 32,29 24,25 16,29 18,22 13,17 20,17" fill="#EECB80" opacity="0.7"/>
      </svg>
    )
  },
  {
    bg: '#BCC9C4', fg: '#D5E0DB',
    render: (s) => ( // 🟢 菱形+加号（认知）
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <rect x="2" y="2" width="44" height="44" rx="10" fill="#BCC9C4" />
        <rect x="6" y="6" width="36" height="36" rx="7" fill="#D5E0DB" />
        <rect x="20" y="10" width="8" height="28" rx="4" fill="#BCC9C4" opacity="0.7"/>
        <rect x="10" y="20" width="28" height="8" rx="4" fill="#BCC9C4" opacity="0.7"/>
      </svg>
    )
  },
  {
    bg: '#6B8DB8', fg: '#8DA5C8',
    render: (s) => ( // 🔵 圆环+同心圆（情绪）
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <circle cx="24" cy="24" r="22" fill="#6B8DB8" />
        <circle cx="24" cy="24" r="16" fill="#8DA5C8" />
        <circle cx="24" cy="24" r="10" fill="#6B8DB8" opacity="0.6"/>
        <circle cx="24" cy="24" r="5" fill="#A8C0D8" />
      </svg>
    )
  },
  {
    bg: '#D4A8B8', fg: '#E8CDD8',
    render: (s) => ( // 🟣 三角形+水滴（行为）
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <polygon points="24,3 44,40 4,40" fill="#D4A8B8" />
        <polygon points="24,8 40,37 8,37" fill="#E8CDD8" />
        <circle cx="24" cy="26" r="6" fill="#D4A8B8" opacity="0.6"/>
        <circle cx="20" cy="24" r="2.5" fill="#E8CDD8" opacity="0.8"/>
        <circle cx="28" cy="24" r="2.5" fill="#E8CDD8" opacity="0.8"/>
      </svg>
    )
  },
];

// ===== Match3Game 子组件（修复点击+创意图案） =====
function Match3Game({ grid, selectedCell, movesLeft, bonusScore, comboMultiplier, animCells, onGemClick, onSkip }: {
  grid: GemCell[][]; selectedCell: [number, number] | null; movesLeft: number;
  bonusScore: number; comboMultiplier: number; animCells: [number, number][];
  onGemClick: (r: number, c: number) => void; onSkip: () => void;
}) {
  const [showHint, setShowHint] = useState(false);
  const [popups, setPopups] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const popupId = useRef(0);
  const prevLen = useRef(0);
  const clickDisabled = movesLeft <= 0;

  useEffect(() => {
    if (animCells.length > prevLen.current && animCells.length > 0) {
      const id = ++popupId.current;
      const mid = animCells[Math.floor(animCells.length / 2)];
      setPopups(p => [...p.slice(-6), { id, x: mid[1] * 56 + 4, y: mid[0] * 56 + 4, text: `+${animCells.length * 2 * comboMultiplier}` }]);
      setTimeout(() => setPopups(p => p.filter(x => x.id !== id)), 1300);
    }
    prevLen.current = animCells.length;
  }, [animCells.length, comboMultiplier]);

  useEffect(() => { if (showHint) { const t = setTimeout(() => setShowHint(false), 2500); return () => clearTimeout(t); } }, [showHint]);

  const hint = findHint(grid);
  const isHintCell = (r: number, c: number) => showHint && hint && ((hint[0] === r && hint[1] === c) || (hint[2] === r && hint[3] === c));

  const handleClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (clickDisabled) return;
    onGemClick(r, c);
  };

  return (
    <div className="y2k-card p-6 text-center relative">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-lg text-y2k-navy flex items-center gap-2">
            <span className="text-2xl">💎</span>消消乐加分回合
          </h3>
          <p className="font-mono text-xs text-y2k-navy/40 mt-0.5">交换相邻宝石 · 3连以上消除得分 · 连消倍率递增</p>
        </div>
        <div className="flex items-center gap-3">
          {comboMultiplier > 1 && (
            <span className="font-mono text-xs bg-y2k-gold/20 text-y2k-gold px-2 py-1 rounded-full animate-pulse">
              🔥 x{comboMultiplier} 连消
            </span>
          )}
          <div className="bg-y2k-cream rounded-lg px-3 py-1.5 text-center min-w-[60px]">
            <p className="font-display text-lg text-y2k-blue">{bonusScore}</p>
            <p className="font-mono text-[0.5rem] text-y2k-navy/40">额外分</p>
          </div>
          <div className="bg-y2k-cream rounded-lg px-3 py-1.5 text-center min-w-[60px]">
            <p className={`font-display text-lg ${movesLeft <= 3 ? 'text-y2k-red' : 'text-y2k-navy'}`}>{movesLeft}</p>
            <p className="font-mono text-[0.5rem] text-y2k-navy/40">剩余步</p>
          </div>
        </div>
      </div>

      {/* 棋盘 */}
      <div className="relative inline-block" style={{ touchAction: 'manipulation' }}>
        <div className="grid gap-1.5 p-3 bg-y2k-navy/5 rounded-xl" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 52px)` }}>
          {grid.map((row, r) => row.map((cell, c) => {
            const sel = selectedCell?.[0] === r && selectedCell?.[1] === c;
            const anim = animCells.some(([ar, ac]) => ar === r && ac === c);
            const hinted = isHintCell(r, c);
            const shape = GEM_SHAPES[cell.type];
            return (
              <div
                key={cell.id}
                onMouseDown={(e) => handleClick(e, r, c)}
                className={`
                  w-[52px] h-[52px] rounded-xl flex items-center justify-center select-none
                  transition-all duration-200 relative
                  ${!clickDisabled ? 'cursor-pointer active:scale-90' : 'cursor-default opacity-55'}
                  ${sel ? 'scale-110 z-10' : 'hover:scale-105'}
                  ${anim ? 'scale-75 opacity-30' : ''}
                  ${hinted ? 'z-10' : ''}
                `}
                style={{
                  boxShadow: sel
                    ? `0 0 0 3px white, 0 0 0 5px ${GEM_COLORS[cell.type]}, 0 0 16px ${GEM_COLORS[cell.type]}60`
                    : hinted
                      ? `0 0 0 3px #EECB80, 0 0 14px #EECB8080`
                      : '0 2px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                  background: sel ? `linear-gradient(135deg, ${shape.bg}, ${shape.fg})` : 'linear-gradient(135deg, #fafaf9, #f0efea)',
                }}
              >
                <div style={{ opacity: sel ? 1 : 0.92, transform: sel ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s' }}>
                  {shape.render(40)}
                </div>
                {hinted && (
                  <div className="absolute inset-0 rounded-xl" style={{
                    animation: 'hintPulse 0.8s ease-in-out infinite',
                    boxShadow: 'inset 0 0 12px rgba(238,203,128,0.4)',
                  }} />
                )}
              </div>
            );
          }))}
        </div>
        {/* 分数弹出 */}
        {popups.map(p => (
          <div key={p.id} className="absolute pointer-events-none font-bold text-sm z-20"
            style={{
              left: p.x, top: p.y,
              color: '#EECB80',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              animation: 'popUp 1.3s ease-out forwards',
            }}>{p.text}</div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex justify-center gap-3 mt-4 mb-3 flex-wrap">
        {GEM_LABELS.map((l, i) => {
          const s = GEM_SHAPES[i];
          return (
            <span key={i} className="font-mono text-[0.6rem] text-y2k-navy/50 flex items-center gap-1.5">
              <span className="inline-flex rounded-full" style={{ width: 16, height: 16, background: s.bg }}>
                {s.render(16)}
              </span>
              {l}
            </span>
          );
        })}
      </div>

      {/* 底部操作 */}
      <div className="flex justify-center items-center gap-3 flex-wrap min-h-[36px]">
        {movesLeft > 0 ? (<>
          {hint && (
            <button onClick={() => setShowHint(v => !v)}
              className="font-mono text-xs text-y2k-navy/50 hover:text-y2k-gold transition-colors px-2 py-1 rounded hover:bg-y2k-gold/5">
              💡 {showHint ? '提示中...' : '提示一步'}
            </button>
          )}
          <span className="font-mono text-xs text-y2k-navy/30">
            {selectedCell ? '已选中宝石，点击相邻宝石交换' : '点击宝石选中，再点击相邻宝石交换'}
          </span>
        </>) : (
          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-base text-y2k-gold">🎉 额外获得 <b className="text-xl">+{bonusScore}</b> 分!</p>
            <button onClick={onSkip} className="y2k-btn y2k-btn-primary">返回查看总分 ✓</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 主组件 =====
export default function ChallengePage() {
  const { cases, loadCases } = useCaseStore();
  const { addUnit } = useUnitStore();

  const [phase, setPhase] = useState<ChallengePhase>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<Partial<Record<DimKey, number>>>({});
  const [countdownNum, setCountdownNum] = useState(3);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('challenge_best') || '0'));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('challenge_streak') || '0'));
  const [confettiParticles, setConfettiParticles] = useState<ReturnType<typeof spawnConfetti>>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [shakeTimer, setShakeTimer] = useState(false);
  const [matchGrid, setMatchGrid] = useState<GemCell[][]>(() => genGrid());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [movesLeft, setMovesLeft] = useState(MAX_MOVES);
  const [bonusScore, setBonusScore] = useState(0);
  const [matchAnimCells, setMatchAnimCells] = useState<[number, number][]>([]);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const processingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { loadCases(); }, [loadCases]);
  useEffect(() => { if (confettiParticles.length > 0) { const t = setTimeout(() => setConfettiParticles([]), 3500); return () => clearTimeout(t); } }, [confettiParticles.length]);
  useEffect(() => { if (phase !== 'countdown') return; if (countdownNum <= 0) { setPhase('active'); return; } const t = setTimeout(() => setCountdownNum(n => n - 1), 700); return () => clearTimeout(t); }, [phase, countdownNum]);
  useEffect(() => { if (phase !== 'active') return; timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; }), 1000); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [phase]);
  useEffect(() => { if (timeLeft <= 0 && phase === 'active') handleSubmit(); }, [timeLeft]);
  useEffect(() => { if (timeLeft === 30 && phase === 'active') setShakeTimer(true); if (timeLeft > 30) setShakeTimer(false); }, [timeLeft, phase]);

  const completedDims = Object.keys(selectedChoices).length;

  const startChallenge = useCallback(() => {
    setPhase('countdown'); setCountdownNum(3);
    setCurrentCase(cases[Math.floor(Math.random() * Math.max(cases.length, 1))]);
    setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    setScore(0); setCombo(0); setSelectedChoices({});
    setUnlockedAchievements([]); setConfettiParticles([]);
    setBonusScore(0); setMovesLeft(MAX_MOVES); setMatchGrid(genGrid());
    setSelectedCell(null); setComboMultiplier(1);
  }, [cases, difficulty]);

  const handleChoiceSelect = (dim: DimKey, idx: number) => setSelectedChoices(p => ({ ...p, [dim]: idx }));

  const handleSubmit = useCallback(() => {
    if (phase !== 'active') return;
    if (timerRef.current) clearInterval(timerRef.current);
    let s = 0, c = 0;
    const bp = DIFFICULTY_CONFIG[difficulty].baseScore;
    DIMENSIONS.forEach(({ key }) => {
      const idx = selectedChoices[key];
      if (idx !== undefined) { const opt = CHOICE_OPTIONS[key][idx]; s += opt.score * bp; if (opt.score >= 4) c++; }
    });
    s = Math.min(s + completedDims * 2, 100);
    setScore(s); setCombo(c); setPhase('submitted');
    const unlocked = ACHIEVEMENTS.filter(a => a.condition(s, c)).map(a => ({ ...a, unlocked: true }));
    setUnlockedAchievements(unlocked);
    if (s > bestScore) { setBestScore(s); localStorage.setItem('challenge_best', String(s)); }
    const ns = c >= 4 ? streak + 1 : 0; setStreak(ns); localStorage.setItem('challenge_streak', String(ns));
    if (s >= 70) setConfettiParticles(spawnConfetti());
    const dec: Decomposition = { trigger: '', sensoryInput: '', cognitive: '', emotionalResponse: '', behavioralOutput: '' };
    DIMENSIONS.forEach(({ key }) => { const idx = selectedChoices[key]; if (idx !== undefined) (dec as Record<string, string>)[key] = CHOICE_OPTIONS[key][idx].text; });
    if (currentCase && s >= 10) {
      addUnit({ id: 'u-challenge-' + Date.now(), title: currentCase.title + ' · 挑战拆解', sourceCaseId: currentCase.id,
        decomposition: dec, tags: [], mediaType: currentCase.category,
        difficulty: difficulty === 'hard' ? 5 : difficulty === 'normal' ? 3 : 1,
        duration: '挑战模式', description: `挑战模式(${DIFFICULTY_CONFIG[difficulty].label}) · 得分${s}`,
        createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0],
        authorId: 'u1', isPublic: true, popularity: s, favorites: 0 });
    }
  }, [phase, selectedChoices, currentCase, difficulty, bestScore, streak, completedDims, addUnit]);

  // ===== 消消乐逻辑 =====
  const startBonusGame = useCallback(() => {
    setPhase('bonus'); setMatchGrid(genGrid()); setSelectedCell(null);
    setMovesLeft(MAX_MOVES); setBonusScore(0); setComboMultiplier(1); processingRef.current = false;
  }, []);

  const processMatches = useCallback((g: GemCell[][]) => {
    const matches = findMatches(g); if (matches.length === 0) return g;
    const ng = g.map(row => row.map(cell => ({ ...cell, isMatched: false })));
    matches.forEach(([r, c]) => { ng[r][c].isMatched = true; });
    setMatchAnimCells(matches); setBonusScore(s => s + matches.length * 2 * comboMultiplier);
    setComboMultiplier(m => Math.min(m + 1, 5));
    setTimeout(() => setMatchGrid(prev => {
      const cleared = clearAndDrop(prev.map(row => row.map(cell => ({ ...cell, isMatched: cell.isMatched }))));
      const next = findMatches(cleared.map(row => row.map(c => ({ ...c, isNew: false }))));
      if (next.length > 0) setTimeout(() => setMatchGrid(cur => {
        const m2 = cur.map(row => row.map(cell => ({ ...cell, isMatched: false })));
        next.forEach(([r, c]) => { m2[r][c].isMatched = true; });
        setBonusScore(s => s + next.length * 2 * comboMultiplier); setComboMultiplier(m => Math.min(m + 1, 5));
        setMatchAnimCells(next);
        setTimeout(() => setMatchGrid(p2 => {
          const f = clearAndDrop(p2.map(row => row.map(cell => ({ ...cell, isMatched: cell.isMatched }))));
          setMatchAnimCells([]); setComboMultiplier(1); processingRef.current = false;
          return f.map(row => row.map(c => ({ ...c, isNew: false })));
        }), 350);
        return m2;
      }), 350);
      return cleared;
    }), 350);
    return ng;
  }, [comboMultiplier]);

  const handleGemClick = useCallback((r: number, c: number) => {
    if (phase !== 'bonus' || movesLeft <= 0 || processingRef.current) return;
    if (!selectedCell) { setSelectedCell([r, c]); return; }
    const [sr, sc] = selectedCell; if (r === sr && c === sc) { setSelectedCell(null); return; }
    if (Math.abs(r - sr) + Math.abs(c - sc) !== 1) { setSelectedCell([r, c]); return; }
    processingRef.current = true; setSelectedCell(null); setMovesLeft(m => m - 1);
    const ng = matchGrid.map(row => row.map(cell => ({ ...cell, isNew: false, isMatched: false })));
    [ng[sr][sc], ng[r][c]] = [ng[r][c], ng[sr][sc]];
    if (findMatches(ng).length > 0) { setMatchGrid(ng); processMatches(ng); }
    else setTimeout(() => setMatchGrid(prev => { const rv = prev.map(row => row.map(c => ({ ...c }))); [rv[sr][sc], rv[r][c]] = [rv[r][c], rv[sr][sc]]; processingRef.current = false; setMovesLeft(m => m + 1); return rv; }), 250);
  }, [phase, movesLeft, selectedCell, matchGrid, processMatches]);

  const handleBonusDone = useCallback(() => setPhase('submitted'), []);

  // ===== 计算与用户选择相关的真实案例 =====
  const matchingCases = (() => {
    if (phase !== 'submitted') return [];
    return cases
      .filter(c => c.status === 'decomposed' && c.id !== currentCase?.id)
      .map(c => {
        let match = 0;
        // 比较用户选择的类别与案例类别
        if (c.category === currentCase?.category) match += 1;
        // 计算标签重叠
        const caseTagIds = new Set(c.tags.map(t => t.id));
        const currentTagIds = new Set(currentCase?.tags.map(t => t.id) || []);
        const overlap = [...caseTagIds].filter(id => currentTagIds.has(id)).length;
        match += overlap;
        return { ...c, match };
      })
      .filter(c => c.match >= 1)
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  })();

  // ===== 渲染辅助 =====
  const totalScore = score + bonusScore;
  const timerPercent = (timeLeft / DIFFICULTY_CONFIG[difficulty].time) * 100;
  const timerColor = timeLeft > 60 ? '#6B8DB8' : timeLeft > 30 ? '#EECB80' : '#D4686A';
  const circ = 2 * Math.PI * 54;
  const getGrade = (s: number) => {
    if (s >= 90) return { label: 'S+ 传奇', emoji: '👑', color: 'text-y2k-gold' };
    if (s >= 75) return { label: 'A 卓越', emoji: '🌟', color: 'text-y2k-blue' };
    if (s >= 55) return { label: 'B 优秀', emoji: '✨', color: 'text-y2k-mint' };
    if (s >= 35) return { label: 'C 良好', emoji: '💪', color: 'text-y2k-navy/70' };
    return { label: 'D 继续努力', emoji: '📝', color: 'text-y2k-navy/40' };
  };

  return (
    <div className={`${shakeTimer ? 'animate-shake' : ''}`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-3xl text-y2k-navy">案例拆解挑战</h1>
          {streak >= 3 && <span className="font-mono text-xs bg-y2k-gold/20 text-y2k-gold px-3 py-1 rounded-full">🔥 {streak} 连胜</span>}
        </div>
        <p className="font-mono text-sm text-y2k-navy/50">3分钟理解体验拆解思维 · 提交后查看相关真实案例 · {bestScore > 0 ? `🏆 最高 ${bestScore} 分` : '等待首次挑战'}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {phase === 'idle' && (
            <div className="y2k-card p-10 text-center space-y-6">
              <div className="text-7xl">⚡</div>
              <div><h2 className="font-display text-2xl text-y2k-navy mb-2">3 分钟理解体验拆解</h2>
                <p className="text-y2k-navy/60 text-sm leading-relaxed max-w-md mx-auto">
                  系统随机分配案例，为 5 个维度<span className="text-y2k-red font-semibold">选择</span>最匹配的选项<br />
                  提交后查看<span className="text-y2k-blue font-semibold">真实案例拆解</span>，对比你的思路
                </p></div>
              <div><p className="font-mono text-xs text-y2k-navy/40 mb-3 uppercase tracking-widest">选择难度</p>
                <div className="flex justify-center gap-3">{(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => {
                  const cfg = DIFFICULTY_CONFIG[d]; const act = difficulty === d;
                  return (<button key={d} onClick={() => setDifficulty(d)} className={`relative flex-1 max-w-[140px] p-4 rounded-xl border-2 transition-all duration-300 ${act ? 'border-y2k-red bg-y2k-red/5 shadow-lg scale-105' : 'border-y2k-navy/10 bg-y2k-cream hover:border-y2k-navy/20'}`}>
                    <span className="text-2xl block mb-1">{cfg.icon}</span><span className={`font-semibold text-sm block ${act ? 'text-y2k-red' : 'text-y2k-navy'}`}>{cfg.label}</span>
                    <span className="font-mono text-xs text-y2k-navy/40 block mt-0.5">{cfg.time}秒</span></button>);
                })}</div></div>
              <button onClick={startChallenge} className="y2k-btn y2k-btn-primary text-lg px-10 py-3">🚀 开始挑战</button>
            </div>)}

          {phase === 'countdown' && (
            <div className="y2k-card p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-8xl font-bold text-y2k-red animate-pulse">{countdownNum}</div>
              <p className="font-mono text-sm text-y2k-navy/40 mt-4">准备...</p>
            </div>)}

          {(phase === 'active' || phase === 'submitted' || phase === 'bonus') && currentCase && (<div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(46,59,78,0.08)" strokeWidth="8" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke={timerColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - timerPercent / 100)} style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }} /></svg>
                  <div className="absolute inset-0 flex items-center justify-center"><span className={`font-mono text-sm font-bold ${timeLeft <= 30 ? 'text-y2k-red' : timeLeft <= 60 ? 'text-y2k-gold' : 'text-y2k-blue'}`}>{timeLeft}</span></div>
                </div>
                <div><div className="flex items-center gap-2"><span className="font-mono text-xs text-y2k-navy/40">{DIFFICULTY_CONFIG[difficulty].icon} {DIFFICULTY_CONFIG[difficulty].label}</span>
                  {phase === 'submitted' && (<span className={`font-display text-xl ${getGrade(totalScore).color}`}>{getGrade(totalScore).emoji} {totalScore} 分{bonusScore > 0 && <span className="font-mono text-xs text-y2k-navy/40 ml-1">(+{bonusScore}💎)</span>}</span>)}</div>
                  <div className="flex gap-1 mt-1">{DIMENSIONS.map((d) => (<div key={d.key} className={`w-4 h-1 rounded-full transition-all duration-300 ${selectedChoices[d.key] !== undefined ? 'opacity-100' : 'opacity-20'}`} style={{ backgroundColor: d.color }} />))}
                    <span className="font-mono text-[0.6rem] text-y2k-navy/30 ml-1">{completedDims}/5</span></div></div></div>
              {phase === 'active' && <button onClick={handleSubmit} disabled={completedDims < 1} className="y2k-btn y2k-btn-primary text-sm">提交 ✓</button>}
            </div>

            <div className="y2k-card p-4 mb-4 border-l-4" style={{ borderLeftColor: difficulty === 'hard' ? '#D4686A' : difficulty === 'normal' ? '#EECB80' : '#BCC9C4' }}>
              <div className="flex items-center gap-2 mb-1"><span className="font-mono text-[0.6rem] uppercase tracking-widest text-y2k-navy/30">挑战案例</span>
                <span className="font-mono text-[0.6rem] bg-y2k-navy/10 text-y2k-navy/50 px-2 py-0.5 rounded">{currentCase.category === 'exhibition' ? '展览空间' : currentCase.category === 'culturalTourism' ? '文旅体验' : currentCase.category === 'cityRoam' ? '城市漫游' : currentCase.category === 'interactiveMedia' ? '互动媒体' : '商业空间'}</span></div>
              <h3 className="font-display text-lg text-y2k-navy">{currentCase.title}</h3>
              <p className="text-sm text-y2k-navy/60 mt-1 leading-relaxed">{currentCase.description}</p>
            </div>

            {/* ===== 选择题区 ===== */}
            <div className="space-y-3">
              {DIMENSIONS.map(({ key, label, emoji, color }) => {
                const sel = selectedChoices[key]; const opts = CHOICE_OPTIONS[key];
                return (<div key={key} className="y2k-card p-3">
                  <div className="flex items-center justify-between mb-2"><label className="font-mono text-xs text-y2k-navy/50 flex items-center gap-1.5"><span className="text-sm">{emoji}</span> {label}</label>
                    {phase === 'submitted' && sel !== undefined && (<span className={`font-mono text-[0.6rem] ${opts[sel].score >= 5 ? 'text-y2k-gold' : opts[sel].score >= 4 ? 'text-y2k-blue' : 'text-y2k-navy/40'}`}>{opts[sel].score >= 5 ? '⭐ 最佳' : opts[sel].score >= 4 ? '✓ 精准' : '· 可行'}</span>)}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {opts.map((opt, i) => { const isSel = sel === i; const showS = phase === 'submitted';
                      return (<button key={i} onClick={() => phase === 'active' && handleChoiceSelect(key, i)} disabled={phase !== 'active'}
                        className={`text-left p-2.5 rounded-lg text-xs leading-relaxed transition-all duration-200 border
                          ${isSel ? 'border-y2k-red shadow-md scale-[1.02]' : 'border-y2k-navy/10 hover:border-y2k-navy/20 hover:bg-y2k-cream'}
                          ${showS && opt.score >= 5 ? 'bg-y2k-gold/10' : showS && opt.score >= 4 ? 'bg-y2k-mint/10' : isSel ? 'bg-y2k-red/5' : 'bg-white/50'}
                          ${phase !== 'active' ? 'cursor-default' : 'cursor-pointer'}`}
                        style={isSel ? { borderColor: color } : {}}>
                        <span className="mr-1">{opt.icon}</span>{opt.text}
                        {showS && (<span className={`ml-1 font-mono text-[0.6rem] ${opt.score >= 5 ? 'text-y2k-gold' : opt.score >= 4 ? 'text-y2k-blue' : 'text-y2k-navy/30'}`}>{opt.score >= 5 ? '★' : opt.score >= 4 ? '☆' : ''}</span>)}
                      </button>);})}
                  </div></div>);
              })}</div>

            {phase === 'submitted' && (<div className="mt-6 space-y-4">
              {unlockedAchievements.length > 0 && (<div className="y2k-card p-4"><p className="font-mono text-xs text-y2k-navy/40 mb-3">🏅 解锁成就</p>
                <div className="flex flex-wrap gap-2">{unlockedAchievements.map(a => (<span key={a.id} className="inline-flex items-center gap-1 bg-y2k-gold/10 border border-y2k-gold/30 rounded-full px-3 py-1 font-mono text-xs text-y2k-navy">{a.icon} {a.name}</span>))}</div></div>)}

              {/* 桥接：关联真实案例 */}
              {matchingCases.length > 0 && (
                <div className="y2k-card p-4 border-l-4" style={{ borderLeftColor: '#6B8DB8' }}>
                  <p className="font-mono text-xs text-y2k-navy/40 mb-3">🔗 你的拆解思路与这些真实案例相似</p>
                  <div className="space-y-2">
                    {matchingCases.map(mc => (
                      <Link key={mc.id} to={`/cases/${mc.id}/decompose`} className="no-underline block">
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-y2k-blue/5 transition-colors group">
                          <div>
                            <span className="font-display text-sm text-y2k-navy group-hover:text-y2k-blue transition-colors">{mc.title}</span>
                            <span className="font-mono text-[0.6rem] text-y2k-navy/30 ml-2">
                              {mc.category === 'exhibition' ? '展览' : mc.category === 'culturalTourism' ? '文旅' : mc.category === 'cityRoam' ? '漫游' : mc.category === 'interactiveMedia' ? '互动' : '商业'}
                            </span>
                          </div>
                          <span className="font-mono text-[0.6rem] text-y2k-blue/60 opacity-0 group-hover:opacity-100 transition-opacity">查看拆解 →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <p className="font-mono text-[0.55rem] text-y2k-navy/25 mt-3">
                    💡 点击案例查看真实项目的 5 维拆解，对比你的分析思路
                  </p>
                </div>
              )}
              <div className="flex gap-3 flex-wrap"><button onClick={startChallenge} className="y2k-btn y2k-btn-primary flex-1 min-w-[120px]">🎮 再来一局</button>
                <button onClick={startBonusGame} className="y2k-btn flex-1 min-w-[120px] bg-y2k-gold/10 border-y2k-gold/40 hover:bg-y2k-gold/20 text-y2k-navy">💎 消消乐加分</button>
                <button onClick={() => { setPhase('idle'); setCurrentCase(null); }} className="y2k-btn flex-1 min-w-[120px]">← 返回</button></div></div>)}
          </div>)}

          {phase === 'bonus' && (<div className="mt-6"><Match3Game grid={matchGrid} selectedCell={selectedCell} movesLeft={movesLeft} bonusScore={bonusScore} comboMultiplier={comboMultiplier} animCells={matchAnimCells} onGemClick={handleGemClick} onSkip={handleBonusDone} /></div>)}
        </div>

        <div className="space-y-4">
          <div className="y2k-card p-5"><h3 className="font-mono text-xs text-y2k-navy/40 mb-4 uppercase tracking-widest">📊 你的数据</h3>
            <div className="grid grid-cols-2 gap-3"><div className="bg-y2k-cream rounded-lg p-3 text-center"><p className="font-display text-2xl text-y2k-blue">{bestScore}</p><p className="font-mono text-[0.6rem] text-y2k-navy/40 mt-1">最高分</p></div>
              <div className="bg-y2k-cream rounded-lg p-3 text-center"><p className="font-display text-2xl text-y2k-red">{streak}</p><p className="font-mono text-[0.6rem] text-y2k-navy/40 mt-1">连胜</p></div>
              <div className="col-span-2 bg-y2k-cream rounded-lg p-3"><div className="flex gap-1 mt-1">
                {[{ label: 'S+', min: 90, color: '#EECB80' }, { label: 'A', min: 75, color: '#6B8DB8' }, { label: 'B', min: 55, color: '#BCC9C4' }, { label: 'C', min: 35, color: '#4A5568' }, { label: 'D', min: 0, color: '#8B9DAD' }].map(g => (
                  <div key={g.label} className="flex-1 text-center"><span className="font-mono text-[0.6rem] font-bold" style={{ color: g.color }}>{g.label}</span><span className="font-mono text-[0.5rem] text-y2k-navy/25 block">{g.min}</span></div>))}
              </div></div></div></div>
          <div className="y2k-card p-5"><h3 className="font-mono text-xs text-y2k-navy/40 mb-4 uppercase tracking-widest">💡 如何使用</h3>
            <div className="space-y-2.5">
              {[
                { icon: '🎯', tip: '为每个维度选最匹配的选项' },
                { icon: '🔗', tip: '提交后查看关联的真实案例拆解' },
                { icon: '💎', tip: '消消乐加分，答题后放松一下' },
                { icon: '🔥', tip: '积累连胜，挑战更高难度' },
                { icon: '📖', tip: '对比你的选择和真实案例，理解方法论' },
              ].map((t, i) => (<div key={i} className="flex items-start gap-2"><span className="text-sm flex-shrink-0">{t.icon}</span><span className="text-xs text-y2k-navy/60 leading-relaxed">{t.tip}</span></div>))}
            </div></div></div></div>

      {confettiParticles.length > 0 && (<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" onAnimationEnd={() => setConfettiParticles([])} style={{ animation: 'fadeOut 3s forwards' }}>
        {confettiParticles.map(p => (<div key={p.id} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px', animation: `confettiFall ${p.duration}s ${p.delay}s ease-out forwards`, transform: `rotate(${p.rotation}deg)` }} />))}
      </div>)}

      <style>{`
        @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes fadeOut{0%,70%{opacity:1}100%{opacity:0}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
        @keyframes popUp{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-60px) scale(1.6);opacity:0}}
        @keyframes hintPulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .animate-shake{animation:shake .6s ease-in-out 3}
      `}</style>
    </div>);
}
