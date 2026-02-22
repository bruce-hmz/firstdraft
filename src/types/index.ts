export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    action?: {
      type: 'retry' | 'upgrade' | 'login' | 'refresh';
      url?: string;
    };
  };
}

export interface GenerateQuestionsRequest {
  idea: string;
}

export interface GenerateQuestionsResponse {
  questions: Array<{
    id: string;
    question: string;
    placeholder: string;
    example: string;
  }>;
}

export interface GeneratePageRequest {
  idea: string;
  answers: Record<string, string>;
  anonymousId?: string;
  language?: 'zh-CN' | 'en';
}

export interface GeneratePageResponse {
  projectId: string;
  page: PageContent;
  shareUrl: string;
  isPro: boolean;
}

export interface PageContent {
  productName: string;
  tagline: string;
  description: string;
  problemSection: {
    headline: string;
    description: string;
    painPoints: string[];
  };
  solutionSection: {
    headline: string;
    description: string;
    features: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  ctaSection: {
    text: string;
    subtext?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  currentVersion: {
    version: number;
    content: PageContent;
  };
}

export interface ShareLink {
  slug: string;
  viewCount: number;
  createdAt: string;
}

export interface Subscription {
  status: 'FREE' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  plan: string;
  features: {
    canSave: boolean;
    canRegenerate: boolean;
    hasWatermark: boolean;
    maxGenerations: number;
  };
  currentPeriodEnd?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  generationCount: number;
  subscription: Subscription;
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  UPGRADE_REQUIRED: 'UPGRADE_REQUIRED',
  GENERATION_LIMIT_REACHED: 'GENERATION_LIMIT_REACHED',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PAGE_NOT_FOUND: 'PAGE_NOT_FOUND',
  AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ==========================================
// Database Types (for Supabase)
// ==========================================

export interface PageDbModel {
  id: string;
  slug: string;
  title: string;
  content: PageContent;
  metadata: PageMetadata;
  status: PageStatus;
  view_count: number;
  user_id?: string;
  anonymous_id?: string;
  created_at: string;
  updated_at: string;
}

export type PageStatus = 'active' | 'deleted' | 'archived';

export interface PageMetadata {
  template?: string;
  version?: string;
  ai_model?: string;
  [key: string]: unknown;
}

export interface CreatePageInput {
  title: string;
  content: PageContent;
  metadata?: PageMetadata;
  userId?: string;
  anonymousId?: string;
}

export interface SharePageResponse {
  slug: string;
  shareUrl: string;
  viewCount: number;
  createdAt: string;
}
