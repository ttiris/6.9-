/* ===== 标签系统 ===== */
export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: string;
  relatedTags: string[];
  usageCount: number;
}

export type TagCategory =
  | 'emotion'
  | 'behavior'
  | 'sensory'
  | 'scenario'
  | 'media'
  | 'cognitive'
  | 'mechanism'    // 交互机制
  | 'template'     // 空间模板
  | 'datamodel'    // 数据模型
  | 'script'       // 情绪脚本
  | 'prompt';      // Prompt资产

export const TagCategoryLabels: Record<TagCategory, string> = {
  emotion: '情绪标签',
  behavior: '行为标签',
  sensory: '感知标签',
  scenario: '场景标签',
  media: '媒介标签',
  cognitive: '认知标签',
  mechanism: '交互机制',
  template: '空间模板',
  datamodel: '数据模型',
  script: '情绪脚本',
  prompt: 'Prompt资产',
};

/* ===== 体验单元 ===== */
export interface ExperienceUnit {
  id: string;
  title: string;
  sourceCaseId: string;
  decomposition: Decomposition;
  tags: Tag[];
  mediaType: MediaType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  isPublic: boolean;
  popularity: number;
  favorites: number;
}

export interface Decomposition {
  trigger: string;       // 触发点
  sensoryInput: string;  // 感知输入
  cognitive: string;     // 认知理解
  emotionalResponse: string; // 情绪反应
  behavioralOutput: string;  // 行为输出
}

export type MediaType =
  | 'exhibition'
  | 'culturalTourism'
  | 'cityRoam'
  | 'interactiveMedia'
  | 'commercialSpace';

export const MediaTypeLabels: Record<MediaType, string> = {
  exhibition: '展览空间',
  culturalTourism: '文旅体验',
  cityRoam: '城市漫游',
  interactiveMedia: '互动媒体',
  commercialSpace: '商业空间',
};

/* ===== 案例 ===== */
export interface Case {
  id: string;
  title: string;
  description: string;
  category: MediaType;
  source: string;
  mediaUrls: string[];
  units: string[];
  tags: Tag[];
  createdAt: string;
  authorId: string;
  status: CaseStatus;
}

export type CaseStatus = 'draft' | 'decomposing' | 'decomposed' | 'reviewed';

/* ===== 项目 Brief ===== */
export interface ProjectBrief {
  id: string;
  title: string;
  type: MediaType;
  requirements: string;
  selectedUnits: string[];
  generatedPlan: string;
  createdAt: string;
  templateId?: string;
}

/* ===== Brief 模板 ===== */
export interface BriefTemplate {
  id: string;
  name: string;
  type: MediaType;
  structure: string[];
}

/* ===== 用户 (预留) ===== */
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  favorites: string[];
  contributions: number;
  joinedAt: string;
}

/* ===== 挑战 ===== */
export interface DecomposeChallenge {
  id: string;
  caseId: string;
  title: string;
  description: string;
  timeLimit: number; // 秒
  difficulty: 1 | 2 | 3 | 4 | 5;
  participants: number;
}

/* ===== API 响应 ===== */
export interface AIDecomposeResponse {
  decomposition: Decomposition;
  tags: Tag[];
  title: string;
  confidence: number;
}
