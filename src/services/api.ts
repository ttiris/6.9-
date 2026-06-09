import type { Decomposition, Tag } from '../types';

// API 服务层 —— 预留国内大模型接口
// 当前使用 Mock 实现，后续替换为真实 API 调用

const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface DecomposeRequest {
  caseTitle: string;
  caseDescription: string;
  category: string;
}

export interface DecomposeResponse {
  decomposition: Decomposition;
  tags: Tag[];
  title: string;
  confidence: number;
}

// Mock AI decompose (后续替换为 fetch 调用)
export async function aiDecompose(request: DecomposeRequest): Promise<DecomposeResponse> {
  // TODO: 替换为真实 API 调用
  // const response = await fetch(`${API_BASE}/api/decompose`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();

  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        decomposition: {
          trigger: `观众接近${request.category === 'exhibition' ? '展览入口' : '体验空间'}，视觉线索引导注意力聚焦`,
          sensoryInput: `多感官通道激活：视觉主导 + 听觉氛围 + ${request.category === 'interactiveMedia' ? '触觉反馈' : '空间感知'}`,
          cognitive: '观众开始理解空间规则与叙事逻辑',
          emotionalResponse: '好奇心 → 沉浸感 → 共鸣',
          behavioralOutput: '主动探索、互动参与、社交分享',
        },
        tags: [],
        title: request.caseTitle + ' · 体验单元',
        confidence: 0.85,
      });
    }, 2000);
  });
}

// Brief 生成（预留）
export async function aiGenerateBrief(requirements: string, unitIds: string[]): Promise<string> {
  // TODO: 替换为真实 API 调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`基于 ${unitIds.length} 个体验单元生成的方案 Brief...`);
    }, 1500);
  });
}

// 灵感方案生成（预留）
export async function aiGenerateInspiration(unitIds: string[]): Promise<string> {
  // TODO: 替换为真实 API 调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`基于 ${unitIds.length} 个体验单元组合生成的灵感方案...`);
    }, 2000);
  });
}
