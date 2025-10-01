// lib/template-configs.ts
import type { CoverLetterMeta } from "@/types/coverLetter";

export interface ElementConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  visible: boolean;
}

export interface TemplateConfig {
  name: string;
  elements: {
    name: Partial<ElementConfig>;
    title: Partial<ElementConfig>;
    contact: Partial<ElementConfig>;
    recipient: Partial<ElementConfig>;
    company: Partial<ElementConfig>;
    date: Partial<ElementConfig>;
    subject: Partial<ElementConfig>;
    greeting: Partial<ElementConfig>;
    content: Partial<ElementConfig>;
    closing: Partial<ElementConfig>;
    signature: Partial<ElementConfig>;
  };
  background?: {
    type: 'gradient' | 'solid' | 'shape';
    color?: string;
    gradient?: string;
    shape?: string;
    clipPath?: string;
  };
}

// Default element configuration
const defaultElementConfig: ElementConfig = {
  x: 50,
  y: 50,
  width: 400,
  height: 40,
  fontSize: 16,
  fontWeight: 'normal',
  color: '#1e293b',
  textAlign: 'left',
  visible: true,
};

// Template configurations
export const templateConfigs: Record<string, TemplateConfig> = {
  modernGradient: {
    name: 'Modern Gradient',
    elements: {
      name: {
        x: 50,
        y: 30,
        width: 400,
        height: 40,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'left',
        visible: true,
      },
      title: {
        x: 50,
        y: 75,
        width: 400,
        height: 30,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'left',
        visible: false,
      },
      contact: {
        x: 50,
        y: 120,
        width: 600,
        height: 60,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#ffffff',
        textAlign: 'left',
        visible: true,
      },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(90deg, #ec4899 0%, #f97316 100%)',
    },
  },

  professionalAccent: {
    name: 'Professional Accent',
    elements: {
      name: {
        x: 50,
        y: 30,
        width: 400,
        height: 40,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      title: {
        x: 50,
        y: 75,
        width: 400,
        height: 30,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'left',
        visible: false,
      },
      contact: {
        x: 500,
        y: 25,
        width: 250,
        height: 60,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'right',
        visible: true,
      },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
    background: {
      type: 'shape',
      color: '#ffffff',
      shape: 'polygon(0 0, 100% 0, 100% 100%, 23% 59%)',
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 23% 59%)',
    },
  },

  sidebarProfile: {
    name: 'Sidebar Profile',
    elements: {
      name: {
        x: 200,
        y: 30,
        width: 400,
        height: 40,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'left',
        visible: true,
      },
      title: {
        x: 200,
        y: 75,
        width: 400,
        height: 30,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#6b7280',
        textAlign: 'left',
        visible: true,
      },
      contact: {
        x: 50,
        y: 30,
        width: 120,
        height: 200,
        fontSize: 12,
        fontWeight: 'normal',
        color: '#1e293b',
        textAlign: 'left',
        visible: true,
      },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  minimalElegant: {
    name: 'Minimal Elegant',
    elements: {
      name: {
        x: 50,
        y: 50,
        width: 400,
        height: 50,
        fontSize: 32,
        fontWeight: '300',
        color: '#000000',
        textAlign: 'center',
        visible: true,
      },
      title: {
        x: 50,
        y: 110,
        width: 400,
        height: 30,
        fontSize: 16,
        fontWeight: '300',
        color: '#666666',
        textAlign: 'center',
        visible: true,
      },
      contact: {
        x: 50,
        y: 150,
        width: 400,
        height: 40,
        fontSize: 14,
        fontWeight: '300',
        color: '#666666',
        textAlign: 'center',
        visible: true,
      },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  // Add more templates with their specific configurations
  corporateClassic: {
    name: 'Corporate Classic',
    elements: {
      name: { ...defaultElementConfig, fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
      title: { ...defaultElementConfig, y: 80, fontSize: 14, fontWeight: 'normal', color: '#6b7280' },
      contact: { ...defaultElementConfig, y: 120, fontSize: 12, color: '#6b7280' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  executiveBold: {
    name: 'Executive Bold',
    elements: {
      name: { ...defaultElementConfig, fontSize: 36, fontWeight: 'bold', color: '#000000' },
      title: { ...defaultElementConfig, y: 90, fontSize: 18, fontWeight: 'bold', color: '#dc2626' },
      contact: { ...defaultElementConfig, y: 130, fontSize: 14, color: '#374151' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  // Add more templates as needed...
  bankingFormal: {
    name: 'Banking Formal',
    elements: {
      name: { ...defaultElementConfig, fontSize: 20, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' },
      title: { ...defaultElementConfig, y: 70, fontSize: 14, fontWeight: 'normal', color: '#374151', textAlign: 'center' },
      contact: { ...defaultElementConfig, y: 100, fontSize: 12, color: '#374151', textAlign: 'center' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  consultingSharp: {
    name: 'Consulting Sharp',
    elements: {
      name: { ...defaultElementConfig, fontSize: 26, fontWeight: 'bold', color: '#000000' },
      title: { ...defaultElementConfig, y: 80, fontSize: 16, fontWeight: 'bold', color: '#059669' },
      contact: { ...defaultElementConfig, y: 120, fontSize: 14, color: '#374151' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  designCreative: {
    name: 'Design Creative',
    elements: {
      name: { ...defaultElementConfig, fontSize: 30, fontWeight: 'bold', color: '#7c3aed' },
      title: { ...defaultElementConfig, y: 80, fontSize: 16, fontWeight: 'normal', color: '#a855f7' },
      contact: { ...defaultElementConfig, y: 120, fontSize: 14, color: '#6b7280' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  marketingDynamic: {
    name: 'Marketing Dynamic',
    elements: {
      name: { ...defaultElementConfig, fontSize: 28, fontWeight: 'bold', color: '#ea580c' },
      title: { ...defaultElementConfig, y: 80, fontSize: 16, fontWeight: 'bold', color: '#f97316' },
      contact: { ...defaultElementConfig, y: 120, fontSize: 14, color: '#374151' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  startupVibrant: {
    name: 'Startup Vibrant',
    elements: {
      name: { ...defaultElementConfig, fontSize: 32, fontWeight: 'bold', color: '#dc2626' },
      title: { ...defaultElementConfig, y: 85, fontSize: 18, fontWeight: 'bold', color: '#f59e0b' },
      contact: { ...defaultElementConfig, y: 125, fontSize: 14, color: '#374151' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  techModern: {
    name: 'Tech Modern',
    elements: {
      name: { ...defaultElementConfig, fontSize: 24, fontWeight: 'bold', color: '#000000' },
      title: { ...defaultElementConfig, y: 75, fontSize: 16, fontWeight: 'normal', color: '#0ea5e9' },
      contact: { ...defaultElementConfig, y: 110, fontSize: 14, color: '#374151' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  healthcareClean: {
    name: 'Healthcare Clean',
    elements: {
      name: { ...defaultElementConfig, fontSize: 26, fontWeight: 'bold', color: '#059669' },
      title: { ...defaultElementConfig, y: 80, fontSize: 16, fontWeight: 'normal', color: '#0d9488' },
      contact: { ...defaultElementConfig, y: 120, fontSize: 14, color: '#374151' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  educationWarm: {
    name: 'Education Warm',
    elements: {
      name: { ...defaultElementConfig, fontSize: 28, fontWeight: 'bold', color: '#b45309' },
      title: { ...defaultElementConfig, y: 80, fontSize: 16, fontWeight: 'normal', color: '#d97706' },
      contact: { ...defaultElementConfig, y: 120, fontSize: 14, color: '#374151' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  nonprofitHeart: {
    name: 'Nonprofit Heart',
    elements: {
      name: { ...defaultElementConfig, fontSize: 26, fontWeight: 'bold', color: '#dc2626' },
      title: { ...defaultElementConfig, y: 80, fontSize: 16, fontWeight: 'normal', color: '#ef4444' },
      contact: { ...defaultElementConfig, y: 120, fontSize: 14, color: '#374151' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },

  salesEnergetic: {
    name: 'Sales Energetic',
    elements: {
      name: { ...defaultElementConfig, fontSize: 30, fontWeight: 'bold', color: '#dc2626' },
      title: { ...defaultElementConfig, y: 85, fontSize: 18, fontWeight: 'bold', color: '#f59e0b' },
      contact: { ...defaultElementConfig, y: 125, fontSize: 14, color: '#374151' },
      recipient: { visible: false },
      company: { visible: false },
      date: { visible: false },
      subject: { visible: false },
      greeting: { visible: false },
      content: { visible: false },
      closing: { visible: false },
      signature: { visible: false },
    },
  },
};

// Helper function to get template configuration
export function getTemplateConfig(templateName: string): TemplateConfig {
  return templateConfigs[templateName] || templateConfigs.modernGradient;
}

// Helper function to get element configuration for a specific template
export function getElementConfig(templateName: string, elementId: string): ElementConfig {
  const config = getTemplateConfig(templateName);
  const elementConfig = config.elements[elementId as keyof typeof config.elements];
  
  // Merge with default config, prioritizing template-specific values
  return {
    ...defaultElementConfig,
    ...elementConfig,
  };
}
