import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GenerationStep = 'input' | 'questions' | 'generating' | 'result';

export interface Question {
  id: string;
  question: string;
  placeholder: string;
  example: string;
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

interface AppState {
  generationFlow: {
    step: GenerationStep;
    idea: string;
    questions: Question[];
    answers: Record<string, string>;
    result: PageContent | null;
    projectId: string | null;
    shareUrl: string | null;
    isLoading: boolean;
    error: string | null;
  };
  setGenerationStep: (step: GenerationStep) => void;
  setIdea: (idea: string) => void;
  setQuestions: (questions: Question[]) => void;
  setAnswer: (id: string, value: string) => void;
  setAnswers: (answers: Record<string, string>) => void;
  setResult: (result: PageContent, projectId: string, shareUrl: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFlow: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  generationCount: number;
  subscription: {
    status: 'FREE' | 'ACTIVE' | 'CANCELLED';
    plan: string;
  };
}

const initialFlowState = {
  step: 'input' as GenerationStep,
  idea: '',
  questions: [],
  answers: {},
  result: null,
  projectId: null,
  shareUrl: null,
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      generationFlow: initialFlowState,
      user: null,
      
      setGenerationStep: (step) => 
        set((state) => ({ 
          generationFlow: { ...state.generationFlow, step } 
        })),
      
      setIdea: (idea) => 
        set((state) => ({ 
          generationFlow: { ...state.generationFlow, idea } 
        })),
      
      setQuestions: (questions) => 
        set((state) => ({ 
          generationFlow: { ...state.generationFlow, questions } 
        })),
      
      setAnswer: (id, value) => 
        set((state) => ({ 
          generationFlow: { 
            ...state.generationFlow, 
            answers: { ...state.generationFlow.answers, [id]: value } 
          } 
        })),
      
      setAnswers: (answers) => 
        set((state) => ({ 
          generationFlow: { ...state.generationFlow, answers } 
        })),
      
      setResult: (result, projectId, shareUrl) => 
        set((state) => ({ 
          generationFlow: { 
            ...state.generationFlow, 
            result, 
            projectId, 
            shareUrl 
          } 
        })),
      
      setLoading: (loading) => 
        set((state) => ({ 
          generationFlow: { ...state.generationFlow, isLoading: loading } 
        })),
      
      setError: (error) => 
        set((state) => ({ 
          generationFlow: { ...state.generationFlow, error } 
        })),
      
      resetFlow: () => 
        set({ generationFlow: initialFlowState }),
      
      setUser: (user) => set({ user }),
    }),
    {
      name: 'ideaforge-storage',
      partialize: (state) => ({ 
        generationFlow: state.generationFlow,
        user: state.user,
      }),
    }
  )
);
