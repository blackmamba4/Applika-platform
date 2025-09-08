"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { CoverLetterTemplate, TemplateData } from "@/lib/templates/coverLetterTemplates";

interface TemplateSelectorProps {
  onTemplateSelect: (template: CoverLetterTemplate) => void;
  onGenerate: (template: CoverLetterTemplate, data: TemplateData) => void;
  templateData: TemplateData;
  selectedTemplate?: CoverLetterTemplate;
  isGenerating: boolean;
}

function TemplateSelector({
  onTemplateSelect,
  onGenerate,
  templateData,
  selectedTemplate,
  isGenerating
}: TemplateSelectorProps) {
  const [templates] = useState<CoverLetterTemplate[]>([
    {
      id: "professional",
      name: "Professional",
      category: "standard",
      description: "Clean, professional tone suitable for most industries",
      generate: (data: TemplateData) => {
        return `Dear Hiring Manager,

I am writing to express my strong interest in the ${data.jobTitle} position at ${data.companyName}. With my background in ${data.userRole} and passion for ${data.companyAbout}, I am excited about the opportunity to contribute to your team.

In my previous roles, I have developed strong skills that align well with the requirements for this position. I am particularly drawn to ${data.companyName}'s commitment to ${data.companyAbout} and believe my experience would allow me to make meaningful contributions to your organization.

I would welcome the opportunity to discuss how my skills and enthusiasm can benefit ${data.companyName}. Thank you for considering my application.

Best regards,
${data.userName}`
      }
    },
    {
      id: "creative",
      name: "Creative",
      category: "creative",
      description: "More engaging and personality-driven approach",
      generate: (data: TemplateData) => {
        return `Dear ${data.companyName} Team,

I'm thrilled to apply for the ${data.jobTitle} role! What excites me most about this opportunity is ${data.companyName}'s innovative approach to ${data.companyAbout}.

As someone passionate about ${data.userRole}, I've been following ${data.companyName}'s work and am genuinely impressed by your impact in the industry. I believe my experience and enthusiasm would be a great fit for your dynamic team.

I'm particularly excited about the possibility of contributing to projects that align with ${data.companyName}'s mission of ${data.companyAbout}. I'd love to bring my creativity and dedication to help drive your continued success.

Looking forward to the possibility of joining your amazing team!

Warm regards,
${data.userName}`
      }
    },
    {
      id: "technical",
      name: "Technical",
      category: "technical",
      description: "Focused on technical skills and achievements",
      generate: (data: TemplateData) => {
        return `Dear Hiring Manager,

I am writing to apply for the ${data.jobTitle} position at ${data.companyName}. With my technical background in ${data.userRole} and understanding of ${data.companyAbout}, I am confident in my ability to contribute to your team's success.

My experience has equipped me with the technical skills and problem-solving abilities necessary for this role. I am particularly interested in ${data.companyName}'s approach to ${data.companyAbout} and believe my expertise would be valuable in advancing your technical objectives.

I am eager to discuss how my technical skills and passion for innovation can contribute to ${data.companyName}'s continued growth and success.

Thank you for your consideration.

Sincerely,
${data.userName}`
      }
    }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a template style for your cover letter
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <h4 className="font-medium mb-2">{template.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="text-xs text-gray-500 capitalize">
              {template.category} template
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Selected: {selectedTemplate.name}</h4>
          <p className="text-sm text-gray-600 mb-4">
            {selectedTemplate.description}
          </p>
          <button
            onClick={() => onGenerate(selectedTemplate, templateData)}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow hover:scale-[1.02] transition disabled:opacity-50 bg-gradient-to-r from-emerald-500 to-violet-500"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Cover Letter"}
          </button>
        </div>
      )}
    </div>
  );
}

export default TemplateSelector;

