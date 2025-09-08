export interface TemplateData {
  userName: string;
  userRole: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  companyAbout: string;
  letterLength: "short" | "medium" | "long";
}

export interface CoverLetterTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  generate: (data: TemplateData) => string;
}

