const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();

// ===== 配色方案 =====
const C = {
  navy: '2E3B4E', red: 'D4686A', gold: 'EECB80',
  blue: '6B8DB8', mint: 'BCC9C4', pink: 'D4A8B8',
  cream: 'F7F3ED', dark: '1E1E2E', white: 'FFFFFF',
  gray: '8B9DAD', lightGray: 'D5E0DB',
};

// ===== 通用样式 =====
const titleOpts = { fontSize: 28, fontFace: 'Microsoft YaHei', color: C.navy, bold: true };
const subtitleOpts = { fontSize: 14, fontFace: 'Microsoft YaHei', color: C.gray };
const bodyOpts = { fontSize: 13, fontFace: 'Microsoft YaHei', color: C.navy, lineSpacing: 24 };
const smallOpts = { fontSize: 11, fontFace: 'Microsoft YaHei', color: C.gray };
const highlightOpts = { fontSize: 13, fontFace: 'Microsoft YaHei', color: C.red, bold: true };

function addSlide(title, contentFn) {
  const slide = pptx.addSlide();
  slide.background = { fill: C.cream };
  // Header bar
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: C.navy } });
  slide.addText(title, { x: 0.5, y: 0.1, w: '90%', h: 0.7, fontSize: 20, fontFace: 'Microsoft YaHei', color: C.white, bold: true });
  // Accent line
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0.9, w: '100%', h: 0.04, fill: { color: C.gold } });
  contentFn(slide);
  return slide;
}

function card(slide, x, y, w, h, color, title, desc) {
  slide.addShape(pptx.ShapeType.roundRect, { x: x, y: y, w: w, h: h, fill: { color: C.white }, shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.08 }, rectRadius: 0.15 });
  slide.addShape(pptx.ShapeType.rect, { x: x, y: y, w: w, h: 0.06, fill: { color: color } });
  slide.addText(title, { x: x + 0.15, y: y + 0.15, w: w - 0.3, h: 0.4, fontSize: 12, fontFace: 'Microsoft YaHei', color: C.navy, bold: true });
  slide.addText(desc, { x: x + 0.15, y: y + 0.5, w: w - 0.3, h: h - 0.6, fontSize: 10, fontFace: 'Microsoft YaHei', color: C.gray });
}

// ==========================================
// SLIDE 1: 封面
// ==========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.navy };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: C.gold } });
  s.addText('ME·Assets', { x: 0.8, y: 0.5, w: '80%', h: 1.0, fontSize: 14, fontFace: 'Microsoft YaHei', color: C.gray, bold: false });
  s.addText('媒介体验结构单元化\n设计资产系统', { x: 0.8, y: 1.0, w: '80%', h: 2.0, fontSize: 36, fontFace: 'Microsoft YaHei', color: C.white, bold: true, lineSpacing: 56 });
  s.addText('系统逻辑架构与交互设计汇报', { x: 0.8, y: 3.2, w: '80%', h: 0.6, fontSize: 18, fontFace: 'Microsoft YaHei', color: C.gold });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 4.5, w: '100%', h: 0.04, fill: { color: C.gold } });
  s.addText('2026.06 · 课堂汇报', { x: 0.8, y: 4.7, w: '80%', h: 0.5, fontSize: 11, fontFace: 'Microsoft YaHei', color: C.gray });
}

// ==========================================
// SLIDE 2: 核心命题
// ==========================================
addSlide('核心命题：什么是媒介体验结构单元化？', (s) => {
  s.addText('任何媒介体验都可以被拆解为 5 个维度的标准化结构，\n形成可独立调用、自由组合、跨项目复用的「体验单元」。', { x: 0.8, y: 1.3, w: 8.5, h: 1.2, ...bodyOpts, fontSize: 16, bold: true, lineSpacing: 32 });
  
  // 5-dimension flow
  const dims = [
    { label: '🔴 触发点\nTrigger', desc: '什么抓住了\n注意力？', x: 0.8 },
    { label: '🟡 感知输入\nSensory', desc: '什么感官\n被激活？', x: 2.5 },
    { label: '🟢 认知理解\nCognitive', desc: '大脑如何\n解读？', x: 4.2 },
    { label: '🔵 情绪反应\nEmotion', desc: '产生了\n什么情绪？', x: 5.9 },
    { label: '🟣 行为输出\nBehavior', desc: '用户做了\n什么？', x: 7.6 },
  ];
  const colors = [C.red, C.gold, C.mint, C.blue, C.pink];
  dims.forEach((d, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: d.x, y: 2.8, w: 1.5, h: 1.5, fill: { color: colors[i] }, rectRadius: 0.15 });
    s.addText(d.label, { x: d.x + 0.1, y: 2.9, w: 1.3, h: 0.9, fontSize: 11, fontFace: 'Microsoft YaHei', color: C.white, bold: true, align: 'center' });
    s.addText(d.desc, { x: d.x + 0.1, y: 3.7, w: 1.3, h: 0.5, fontSize: 10, fontFace: 'Microsoft YaHei', color: 'D5D5D5', align: 'center' });
    if (i < 4) {
      s.addText('→', { x: d.x + 1.5, y: 3.2, w: 0.3, h: 0.5, fontSize: 18, fontFace: 'Microsoft YaHei', color: C.gray, align: 'center' });
    }
  });
  
  s.addText('这 5 个维度构成系统的 DNA。所有功能围绕「拆解→存储→关联→重组」四步闭环展开。', { x: 0.8, y: 4.5, w: 8.5, h: 0.5, ...smallOpts });
});

// ==========================================
// SLIDE 3: 数据模型
// ==========================================
addSlide('数据模型：三类核心实体', (s) => {
  // Case box
  card(s, 0.5, 1.3, 3.0, 1.8, C.blue, '📂 Case 案例', 'id / title / description\ncategory / source / tags[]\n→ 关联 units[]\n例：Sleep No More / Punchdrunk');
  // Arrow
  s.addText('AI 拆解 →', { x: 3.5, y: 1.8, w: 1.0, h: 0.5, fontSize: 12, fontFace: 'Microsoft YaHei', color: C.red, bold: true });
  // Unit box
  card(s, 4.5, 1.3, 3.0, 2.5, C.gold, '🧩 ExperienceUnit 体验单元', 'id / title / decomposition {\n  trigger / sensoryInput\n  cognitive / emotionalResponse\n  behavioralOutput }\ntags[] / mediaType / difficulty\n例：「面具感知过滤器」');
  // Tag box
  card(s, 8.0, 1.3, 2.5, 2.5, C.pink, '🏷️ Tag 标签', '53 个核心标签\n11 大类：\n情绪 · 行为 · 感知\n场景 · 媒介 · 认知\n机制 · 模板 · 数据\n脚本 · Prompt\nrelatedTags[] 关联网络');
  
  s.addText(`当前规模：23 个案例 → 28+ 个体验单元 → 53 个标签 → 5 种媒介类型`, { x: 0.5, y: 4.3, w: 9.5, h: 0.5, ...subtitleOpts, align: 'center' });
});

// ==========================================
// SLIDE 4: 页面架构总览
// ==========================================
addSlide('页面架构：8 个功能页面', (s) => {
  const pages = [
    { name: '首页', desc: '场景化任务入口', color: C.navy },
    { name: '案例库', desc: '23个案例浏览·提交', color: C.blue },
    { name: 'AI拆解工作台', desc: '5维可视化拆解', color: C.red },
    { name: '资产库', desc: '28+单元浏览·筛选', color: C.gold },
    { name: '灵感生成器', desc: '拖拽组合·生成方案', color: C.pink },
    { name: 'Brief生成器', desc: '模板匹配·策划案', color: C.blue },
    { name: '标签图谱', desc: 'D3力导向关联网络', color: C.mint },
    { name: '拆解挑战', desc: '选择题入门+消消乐', color: C.red },
  ];
  pages.forEach((p, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = 0.5 + col * 2.4;
    const y = 1.2 + row * 1.7;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.2, h: 1.4, fill: { color: C.white }, shadow: { type: 'outer', blur: 4, offset: 1, color: '000000', opacity: 0.06 }, rectRadius: 0.1 });
    s.addShape(pptx.ShapeType.rect, { x, y, w: 2.2, h: 0.05, fill: { color: p.color } });
    s.addText(p.name, { x: x + 0.15, y: y + 0.2, w: 1.9, h: 0.5, fontSize: 13, fontFace: 'Microsoft YaHei', color: C.navy, bold: true });
    s.addText(p.desc, { x: x + 0.15, y: y + 0.7, w: 1.9, h: 0.5, fontSize: 10, fontFace: 'Microsoft YaHei', color: C.gray });
  });
  s.addText('所有页面由 MainLayout（顶部导航 + 页脚）统一包裹，路由通过 React Router 管理', { x: 0.5, y: 4.7, w: 9.5, h: 0.4, ...smallOpts, align: 'center' });
});

// ==========================================
// SLIDE 5: 首页设计
// ==========================================
addSlide('首页：从方法论语言 → 用户任务语言', (s) => {
  card(s, 0.5, 1.2, 4.5, 1.6, C.red,
    'Hero 区改造前',
    '「AI 拆解为标准化体验单元，\n通过标签图谱和灵感生成器…」\n\n按钮：「输入案例」「灵感生成器」');
  card(s, 5.5, 1.2, 4.5, 1.6, C.blue,
    'Hero 区改造后',
    '「把体验拆解为标准单元，\n像搭积木一样组合创新方案」\n\n按钮：「⚡ 3分钟入门 →」');
  
  s.addText('「🎯 我想做……」6 个任务卡片 — 用用户的语言对应 6 种真实需求', { x: 0.5, y: 3.1, w: 9.5, h: 0.5, ...subtitleOpts });
  
  const tasks = [
    { name: '⚡ 快速理解方法论', tag: '推荐新手' },
    { name: '🔍 查看案例拆解', tag: '' },
    { name: '📋 策划新项目', tag: '' },
    { name: '💡 组合创新方案', tag: '' },
    { name: '📦 按类型浏览资产', tag: '' },
    { name: '⬡ 探索标签关联', tag: '' },
  ];
  tasks.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.3;
    const y = 3.6 + row * 1.2;
    card(s, x, y, 3.1, 0.9, C.blue, t.name, t.tag);
  });
});

// ==========================================
// SLIDE 6: 核心页面详解
// ==========================================
addSlide('核心功能：案例库 → AI拆解 → 资产库', (s) => {
  card(s, 0.5, 1.2, 3.0, 2.0, C.blue,
    '📂 案例库',
    '· 23 个案例列表\n· 5 种媒介类型筛选\n· 点击进入拆解工作台\n· 支持提交新案例');
  s.addText('→', { x: 3.5, y: 1.8, w: 0.5, h: 0.5, fontSize: 20, fontFace: 'Microsoft YaHei', color: C.red, bold: true, align: 'center' });
  card(s, 4.0, 1.2, 3.0, 2.0, C.red,
    '🔬 AI拆解工作台',
    '· 案例信息卡\n· 5维拆解可视化\n· 触发 → 感知 → 认知\n  → 情绪 → 行为\n· 已拆解单元列表');
  s.addText('→', { x: 7.0, y: 1.8, w: 0.5, h: 0.5, fontSize: 20, fontFace: 'Microsoft YaHei', color: C.red, bold: true, align: 'center' });
  card(s, 7.5, 1.2, 3.0, 2.0, C.gold,
    '📦 资产库',
    '· 28+ 体验单元\n· 类型/标签筛选\n· 热度/时间排序\n· 点击查看完整5维卡片');
  
  card(s, 0.5, 3.6, 4.5, 1.3, C.mint,
    '⬡ 标签图谱',
    '· D3.js 力导向图\n· 53个节点, 关联连线\n· 拖拽交互 / 点击查看相关单元');
  card(s, 5.5, 3.6, 5.0, 1.3, C.navy,
    '📊 数据看板',
    '· 资产/案例总数统计 / 类型分布柱状图\n· 热门资产 TOP 8 / 热门标签 TOP 10');
});

// ==========================================
// SLIDE 7: 创造工具
// ==========================================
addSlide('创造工具：Brief生成器 + 灵感生成器', (s) => {
  card(s, 0.5, 1.2, 4.5, 3.5, C.blue,
    '📋 Brief 生成器\n\n输入：项目名称 + 模板类型\n↓\n输出：结构化策划案\n\n├─ 项目概述（类型/难度）\n├─ 核心理念（匹配单元关键词）\n├─ 推荐体验单元详解（5维拆解）\n├─ 体验流程设计（3阶段）\n├─ 技术需求与时间线\n└─ 预期效果与评估指标');
  
  card(s, 5.5, 1.2, 5.0, 3.5, C.pink,
    '💡 灵感生成器\n\n输入：从单元池拖拽到画布\n↓\n输出：灵感方案 + PDF 导出\n\n├─ 左侧：可搜索单元池\n├─ 右侧：拖放画布\n├─ 自动组合标签/情绪/行为\n├─ 生成方案文案\n└─ 一键导出 PDF');
});

// ==========================================
// SLIDE 8: 挑战模块
// ==========================================
addSlide('能力培养：拆解挑战（语言学校）', (s) => {
  card(s, 0.5, 1.2, 3.0, 1.5, C.red,
    '⚡ 挑战流程',
    '选难度 → 倒计时 →\n5维选择题(每题6选项)\n→ 提交 → 得分+成就');
  card(s, 4.0, 1.2, 3.0, 1.5, C.gold,
    '🔗 案例桥接（新）',
    '提交后显示：\n「你的拆解思路与\n这些真实案例相似」\n→ 点击进入拆解工作台');
  card(s, 7.5, 1.2, 3.0, 1.5, C.blue,
    '💎 消消乐加分',
    '6×6 SVG 宝石棋盘\n5种创意图案\n提示+连消倍率\n→ 赚取额外分');
  
  card(s, 0.5, 3.0, 10.0, 1.8, C.navy,
    '设计意图',
    '挑战不是目标，是「语言学校」——让用户通过游戏化方式内化5维拆解思维，\n然后带着理解去使用 Brief 生成器、灵感生成器、标签图谱等其他功能。\n\n三大价值：① 教育价值（学会拆解思维） ② 桥梁价值（连接用户与系统） ③ 留存价值（让学习变游戏）');
});

// ==========================================
// SLIDE 9: 三种用户路径
// ==========================================
addSlide('用户路径：三种典型使用场景', (s) => {
  card(s, 0.5, 1.2, 3.3, 3.5, C.red,
    '🅰️ 新手路径\n（3 分钟上手）\n\n首页 →「⚡ 3分钟入门」\n→ 拆解挑战（做一局）\n→ 提交看到得分\n→ 🔗 点击关联案例\n→ AI 拆解工作台\n→ 理解 5 维框架\n→ 回到首页选下一个任务');
  
  card(s, 4.2, 1.2, 3.3, 3.5, C.blue,
    '🅱️ 创作者路径\n（策划新项目）\n\n首页 →「📋 策划新项目」\n→ Brief 生成器\n→ 输入项目名+选类型\n→ 生成策划案\n→ 查看推荐单元详情\n→ 去灵感生成器组合\n→ 导出 PDF');
  
  card(s, 7.9, 1.2, 2.6, 3.5, C.mint,
    '🅲️ 研究者路径\n（方法论探索）\n\n首页 →「🔍 查看案例」\n→ 案例库浏览 23 个\n→ 点击进拆解工作台\n→ 查看 5 维拆解\n→ 点击标签跳图谱\n→ 去数据看板');
});

// ==========================================
// SLIDE 10: 三种用户路径
// ==========================================
addSlide('技术栈与当前能力边界', (s) => {
  card(s, 0.5, 1.2, 5.0, 2.5, C.navy,
    '🛠 技术栈',
    `框架：React 19 + TypeScript\n构建：Vite 8 · 路由：React Router 7\n样式：Tailwind CSS 4 + Y2K 设计系统\n状态管理：Zustand\n数据库：Dexie（IndexedDB）\n可视化：D3.js（标签图谱）\n导出：jsPDF · html2canvas\nWord解析：mammoth`);
  
  card(s, 6.0, 1.2, 4.5, 2.5, C.gold,
    '✅ 已完成',
    '· 案例 → 5维拆解描述\n· 53个标签关联网络\n· Brief生成（模板匹配）\n· 灵感生成（组合拼接）\n· 选择题式入门训练\n· 挑战→案例桥接\n· 首页场景化入口');
  
  card(s, 0.5, 4.0, 10.0, 1.0, C.red,
    '🔧 待建设（后续规划）',
    '每单元绑定空间/预算/技术参数 | 单元兼容性规则（哪些可相邻）| 单元适配规则（大→小空间缩放）| 情绪曲线编排规则 | 方案落地验证闭环 | 用户贡献案例众筹');
});

// ==========================================
// SLIDE 11: 总结
// ==========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.navy };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.06, fill: { color: C.gold } });
  s.addText('总结', { x: 0.8, y: 0.5, w: '80%', h: 0.8, fontSize: 28, fontFace: 'Microsoft YaHei', color: C.white, bold: true });
  
  s.addText('ME·Assets 是一个「体验设计的知识基础设施」\n\n它把散落在 23 个案例中的设计智慧，\n拆解为 28 个可调用、可比较、可组合的标准化单元，\n让策展人、设计师、文旅运营者能够\n像工程师调用零件库一样，\n系统性地创造新的媒介体验。', {
    x: 0.8, y: 1.8, w: 8, h: 3.5, fontSize: 18, fontFace: 'Microsoft YaHei', color: C.white, lineSpacing: 40,
  });
  
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 4.5, w: '100%', h: 0.04, fill: { color: C.gold } });
  s.addText('谢谢！欢迎提问 🙋', { x: 0.8, y: 4.7, w: '80%', h: 0.5, fontSize: 16, fontFace: 'Microsoft YaHei', color: C.gold, align: 'center' });
}

// ===== 保存 =====
const outPath = 'd:/研一工作任务/设计资产建构/6.7优化/ME-Assets系统逻辑汇报.pptx';
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('✅ PPT 已生成: ' + outPath);
}).catch(e => console.error(e));
