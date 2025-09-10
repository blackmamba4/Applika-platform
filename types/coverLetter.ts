// types/coverLetter.ts
export interface CoverLetterMeta {
  font: "inter" | "poppins" | "montserrat" | "georgia" | "playfair" | "system";
  accent: string;
  company: string;
  density: "compact" | "normal" | "roomy";
  logoUrl?: string;
  dateLine: string;
  template: "modernGradient" | "professionalAccent" | "sidebarProfile" | "minimalElegant" | "corporateClassic" | "executiveBold" | "bankingFormal" | "consultingSharp" | "designCreative" | "marketingDynamic" | "startupVibrant" | "techModern" | "healthcareClean" | "educationWarm" | "nonprofitHeart" | "salesEnergetic";
  yourName: string;
  recipient: string;
  contactLine: string;
  footerStyle: "none" | "page" | "initials";
  headerStyle: "nameBlock" | "centered" | "compact";
  showDivider: boolean;
  signatureUrl?: string;
  yourInitials: string;
  showSignature: boolean;
  companyAddress: string;
  // Parsed content components
  greeting?: string; // "Dear Red Sift Hiring Team,"
  closing?: string; // "Warm regards,"
  signatureName?: string; // "James"
  gradientColor?: string; // Custom gradient color
  showRecipientBlock: boolean;
}

export interface CoverLetterEditorProps {
  letterId: string;
  initialTitle: string;
  initialBody: string;
  initialMeta?: CoverLetterMeta;
  onBackToStep1: () => void;
}

export interface ContentSection {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface HeaderElement {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}
