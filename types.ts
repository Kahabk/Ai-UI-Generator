
export interface ThemeColors {
  primary: string;
  background: string;
  text: string;
}

export interface ThemeConfig {
  mode: 'dark' | 'light';
  colors: ThemeColors;
}

export interface Section {
  type: 'hero' | 'credibility' | 'services' | 'workflow' | 'case_studies' | 'cta';
  content?: Record<string, string>;
  image?: string;
  images?: string[];
  stats?: string[];
  items?: string[];
  steps?: string[];
  examples?: Record<string, string>;
}

export interface Intent {
  industry: string;
  tone: string;
  mode: 'dark' | 'light';
  wants_trust: boolean;
  wants_case_studies: boolean;
}

export interface LandingPageConfig {
  meta: {
    hash: string;
    engine: string;
    brand?: string;
  };
  intent: Intent;
  theme: ThemeConfig;
  sections: Section[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
