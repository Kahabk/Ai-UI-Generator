
import { LandingPageConfig } from './types';

export const DEFAULT_CONFIG: LandingPageConfig = {
  meta: {
    hash: "initial",
    engine: "llama3b-ui-agent"
  },
  intent: {
    industry: "Consulting",
    tone: "Professional",
    mode: "dark",
    wants_trust: true,
    wants_case_studies: true
  },
  theme: {
    mode: "dark",
    colors: {
      primary: "#F5B301",
      background: "#0B1220",
      text: "#E5E7EB"
    }
  },
  sections: [
    {
      type: "hero",
      content: {
        headline: "Strategic Intelligence for Modern Enterprise",
        subtext: "Navigate complexity with data-driven decision making."
      },
      image: "https://picsum.photos/1400/900?random=1"
    },
    {
      type: "credibility",
      stats: ["15+ Years", "$500M+ Value Created"]
    },
    {
      type: "services",
      items: ["Market Strategy", "Digital Transformation", "Operational Excellence"]
    },
    {
      type: "cta",
      content: {
        text: "Schedule a Strategy Session",
        button: "Contact Us"
      }
    }
  ]
};

export const THEME_PRESETS = [
  { name: 'Enterprise Gold', primary: '#F5B301', background: '#0B1220' },
  { name: 'Modern Azure', primary: '#2563EB', background: '#0f172a' },
  { name: 'Clean Light', primary: '#2563EB', background: '#FFFFFF' },
  { name: 'Deep Emerald', primary: '#10B981', background: '#064e3b' }
];
