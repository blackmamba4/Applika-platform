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
        visible: true,
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
      recipient: {
        x: 50,
        y: 220,
        width: 300,
        height: 80,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: false,  // Hidden - recipient info usually not shown
      },
      company: {
        x: 500,
        y: 50,
        width: 250,
        height: 40,
        fontSize: 16,
        fontWeight: 'medium',
        color: '#000000',
        textAlign: 'right',
        visible: false,    // Hidden - company info usually not shown
      },  
      date: {
        x: 50,
        y: 200,
        width: 400,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      subject: {
        x: 50,
        y: 240,
        width: 500,
        height: 30,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      greeting: {
        x: 50,
        y: 280,
        width: 500,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      content: {
        x: 50,
        y: 320,
        width: 500,
        height: 200,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      closing: {
        x: 50,
        y: 540,
        width: 500,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      signature: {
        x: 50,
        y: 580,
        width: 200,
        height: 40,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(90deg, #ff6b6b 0%, #feca57 100%)', // Original default colors
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
        visible: true,
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
      recipient: {
        x: 50,
        y: 220,
        width: 300,
        height: 80,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: false,  // Hidden - recipient info usually not shown
      },
      company: {
        x: 500,
        y: 50,
        width: 250,
        height: 40,
        fontSize: 16,
        fontWeight: 'medium',
        color: '#000000',
        textAlign: 'right',
        visible: false,    // Hidden - company info usually not shown
      },  
      date: {
        x: 50,
        y: 200,
        width: 400,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      subject: {
        x: 50,
        y: 240,
        width: 500,
        height: 30,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      greeting: {
        x: 50,
        y: 280,
        width: 500,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      content: {
        x: 50,
        y: 320,
        width: 500,
        height: 200,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      closing: {
        x: 50,
        y: 540,
        width: 500,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      signature: {
        x: 50,
        y: 580,
        width: 200,
        height: 40,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
    },
    background: {
      type: 'shape',
      color: '#DC2626', // Default red accent color - will be replaced with dynamic accent color
      shape: 'polygon(0 0, 100% 0, 100% 100%, 23% 59%)',
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 23% 59%)',
    },
  },

  defaultBasic: {
    name: 'Default Basic',
    elements: {
      name: {
        x: 50,
        y: 50,
        width: 500,
        height: 50,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        visible: true,
      },
      title: {
        x: 50,
        y: 100,
        width: 500,
        height: 30,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'center',
        visible: true,
      },
      contact: {
        x: 50,
        y: 150,
        width: 500,
        height: 40,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666666',
        textAlign: 'center',
        visible: true,
      },
      recipient: {
        x: 50,
        y: 220,
        width: 300,
        height: 80,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: false,  // Hidden - recipient info usually not shown
      },
      company: {
        x: 500,
        y: 50,
        width: 250,
        height: 40,
        fontSize: 16,
        fontWeight: 'medium',
        color: '#000000',
        textAlign: 'right',
        visible: false,    // Hidden - company info usually not shown
      },  
      date: {
        x: 50,
        y: 200,
        width: 500,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        visible: true,
      },
      subject: {
        x: 50,
        y: 240,
        width: 500,
        height: 30,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        visible: true,
      },
      greeting: {
        x: 50,
        y: 280,
        width: 500,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'center',
        visible: true,
      },
      content: {
        x: 50,
        y: 320,
        width: 500,
        height: 200,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'center',
        visible: true,
      },
      closing: {
        x: 50,
        y: 540,
        width: 500,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'center',
        visible: true,
      },
      signature: {
        x: 50,
        y: 580,
        width: 500,
        height: 40,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        visible: true,
      },
    },
    background: {
      type: 'solid',
      color: '#ffffff',
    },
  },
};

// Helper function to get template configuration
export function getTemplateConfig(templateName: string): TemplateConfig {
  return templateConfigs[templateName] || templateConfigs.defaultBasic;
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