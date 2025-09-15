// lib/color-system.ts
import type { CoverLetterMeta, ContentSection, TemplateColorSystem, ElementColorConfig, ColorInheritance } from "@/types/coverLetter";

// Template Color Mapping - defines how each template handles colors
export const TEMPLATE_COLOR_MAP: Record<string, Record<string, ElementColorConfig>> = {
  modernGradient: {
    name: { inheritFrom: 'default', color: '#ffffff' }, // Independent editable color
    contact: { inheritFrom: 'default', color: '#ffffff' }, // Independent editable color
    recipient: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    company: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    date: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    greeting: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    body: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    closing: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    signature: { inheritFrom: 'default', color: '#000000' } // Independent editable color
  },
  professionalAccent: {
    name: { inheritFrom: 'default', color: '#ffffff' }, // Independent editable color
    contact: { inheritFrom: 'default', color: '#ffffff' }, // Independent editable color
    recipient: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    company: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    date: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    greeting: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    body: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    closing: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    signature: { inheritFrom: 'default', color: '#000000' } // Independent editable color
  },
  sidebarProfile: {
    name: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    contact: { inheritFrom: 'default', color: '#ffffff' }, // Independent editable color
    recipient: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    company: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    date: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    greeting: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    body: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    closing: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    signature: { inheritFrom: 'default', color: '#000000' } // Independent editable color
  },
  corporateClassic: {
    name: { inheritFrom: 'default', color: '#ffffff' }, // Independent editable color
    contact: { inheritFrom: 'default', color: '#ffffff' }, // Independent editable color
    recipient: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    company: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    date: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    greeting: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    body: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    closing: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    signature: { inheritFrom: 'default', color: '#000000' } // Independent editable color
  },
  minimalElegant: {
    name: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    contact: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    recipient: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    company: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    date: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    greeting: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    body: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    closing: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    signature: { inheritFrom: 'default', color: '#000000' } // Independent editable color
  },
  default: {
    name: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    contact: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    recipient: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    company: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    date: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    greeting: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    body: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    closing: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    signature: { inheritFrom: 'default', color: '#000000' } // Independent editable color
  },
  creativeLayout: {
    name: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    contact: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    recipient: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    company: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    date: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    greeting: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    body: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    closing: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    signature: { inheritFrom: 'default', color: '#000000' } // Independent editable color
  },
  splitLayout: {
    name: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    contact: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    recipient: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    company: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    date: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    greeting: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    body: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    closing: { inheritFrom: 'default', color: '#000000' }, // Independent editable color
    signature: { inheritFrom: 'default', color: '#000000' } // Independent editable color
  }
};

// Template-specific default accent colors - complementary to each template's design
export const TEMPLATE_DEFAULT_ACCENT_COLORS: Record<string, string> = {
  modernGradient: '#4F46E5',      // Indigo - complements gradient backgrounds
  professionalAccent: '#DC2626',  // Red - professional and bold
  sidebarProfile: '#059669',      // Emerald - fresh and modern
  corporateClassic: '#1F2937',    // Dark gray - corporate and sophisticated
  minimalElegant: '#7C3AED',      // Purple - elegant and refined
  default: '#2563EB',             // Blue - classic and trustworthy
  creativeLayout: '#EA580C',      // Orange - creative and energetic
  splitLayout: '#0891B2'          // Cyan - modern and clean
};

// Extract template colors from meta
export const extractTemplateColors = (meta: CoverLetterMeta): TemplateColorSystem => {
  // Use template-specific default accent color if no accent is set
  const defaultAccent = TEMPLATE_DEFAULT_ACCENT_COLORS[meta.template] || '#000000';
  
  return {
    accent: meta.accent || defaultAccent,
    gradient1: meta.gradientColor1,
    gradient2: meta.gradientColor2,
    background: meta.template === 'modernGradient' ? meta.gradientColor1 : undefined
  };
};

// Smart color resolution engine
export const resolveElementColor = (
  elementId: string,
  templateType: string,
  templateColors: TemplateColorSystem,
  contentSections: ContentSection[]
): ColorInheritance => {
  // Get element configuration from template map
  const templateConfig = TEMPLATE_COLOR_MAP[templateType] || TEMPLATE_COLOR_MAP.default;
  const elementConfig = templateConfig[elementId] || { inheritFrom: 'default', color: '#000000' };
  
  // Check if there's a custom color from contentSections
  const customSection = contentSections.find(s => s.id === elementId);
  if (customSection?.fontColor) {
    return {
      source: 'custom',
      value: customSection.fontColor,
      canOverride: true
    };
  }
  
  // Resolve inherited color
  let resolvedColor = elementConfig.color || '#000000';
  let source: ColorInheritance['source'] = 'default';
  
  switch (elementConfig.inheritFrom) {
    case 'accent':
      resolvedColor = templateColors.accent;
      source = 'accent';
      break;
    case 'gradient':
      // For gradient elements, use the element's defined color (white) rather than the gradient color
      resolvedColor = elementConfig.color || '#ffffff';
      source = 'gradient';
      break;
    case 'template':
      resolvedColor = templateColors.accent;
      source = 'template';
      break;
    default:
      resolvedColor = elementConfig.color || '#000000';
      source = 'default';
  }
  
  return {
    source,
    value: resolvedColor,
    canOverride: true // All colors can be overridden by custom colors
  };
};

// Check if element uses accent colors (for UI indicators)
export const isAccentColorElement = (elementId: string, templateType: string): boolean => {
  // Since all text elements are now independent, accent color is only used for backgrounds
  // This function now returns false for all text elements since they're all editable
  return false;
};

// Get default color for element (when no custom color is set)
export const getDefaultElementColor = (elementId: string, templateType: string): string => {
  const templateConfig = TEMPLATE_COLOR_MAP[templateType] || TEMPLATE_COLOR_MAP.default;
  const elementConfig = templateConfig[elementId];
  
  return elementConfig?.color || '#000000';
};

// Get template-specific default accent color
export const getTemplateDefaultAccentColor = (templateType: string): string => {
  return TEMPLATE_DEFAULT_ACCENT_COLORS[templateType] || '#000000';
};
