"use client";
import { useState } from "react";
import {
  GraduationCap,
  Repeat,
  Clock,
  Globe2,
  Target,
  Briefcase,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

const CASES = [
  {
    key: "students",
    title: "Students & Recent Grads",
    desc: "Turn your projects and coursework into compelling achievements that feel real, not fluffy.",
    points: [
      "Translate coursework to impact statements",
      "Frame internships & clubs as quantifiable wins", 
      "Confident, concise, friendly tone"
    ],
    Icon: GraduationCap,
    accent: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    example: "As a Computer Science student, I developed a mobile app that helped 200+ students track their study habits, resulting in a 30% improvement in exam scores."
  },
  {
    key: "switchers", 
    title: "Career Switchers",
    desc: "Bridge your past experience to a new domain with crisp, job-aligned language.",
    points: [
      "Map transferable skills to the role",
      "Mirror keywords without buzzword stuffing",
      "Credible, focused, optimistic tone"
    ],
    Icon: Repeat,
    accent: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    example: "My 5 years in marketing taught me data-driven decision making—skills I'm excited to apply to your product management role."
  },
  {
    key: "busy",
    title: "Busy Professionals", 
    desc: "Generate tailored letters for multiple roles in minutes, not hours.",
    points: [
      "Reusable intros & closers",
      "Company hooks pulled from URLs",
      "Direct, senior, succinct tone"
    ],
    Icon: Clock,
    accent: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    example: "I've led teams that delivered 40% faster project completion. I'd bring that same efficiency to your engineering organization."
  },
  {
    key: "international",
    title: "International Applicants",
    desc: "Clear English with the right cultural tone for each market and industry.",
    points: [
      "Cultural tone presets",
      "Clear, idiomatic phrasing", 
      "Polite, confident, natural tone"
    ],
    Icon: Globe2,
    accent: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    example: "Having worked across three continents, I understand diverse business cultures and can adapt quickly to your team's dynamics."
  },
  {
    key: "technical",
    title: "Technical & Niche Roles",
    desc: "Use domain-specific language without sounding like a jargon bot.",
    points: [
      "Context-aware terminology",
      "ATS-friendly structure",
      "Expert, human, precise tone"
    ],
    Icon: Target,
    accent: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    example: "My experience with microservices architecture and Kubernetes would directly contribute to your platform's scalability goals."
  },
  {
    key: "top",
    title: "Top-Tier Applications",
    desc: "Stand out with company-specific insights from their site and recent news.",
    points: [
      "Pull initiatives, values, and products",
      "Personalized openers that land",
      "Sharp, bespoke, memorable tone"
    ],
    Icon: Briefcase,
    accent: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    example: "Your recent expansion into AI-powered analytics aligns perfectly with my machine learning background and passion for data-driven innovation."
  },
];

export default function UseCases() {
  const [active, setActive] = useState(0);
  const A = CASES[active];

  return (
    <section id="usecases" className="relative w-full py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-sm font-medium text-violet-700 dark:text-violet-300 mb-6">
            <div className="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
            Perfect for every situation
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black leading-[0.9] tracking-tight mb-6">
            <span className="block text-gray-900 dark:text-gray-100">Built for</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-violet-600 to-purple-600">
              Your Situation
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Pick your situation to see how Applika adapts tone, structure, and keywords 
            to match exactly what employers in your field are looking for.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Use case selector */}
          <div className="space-y-3">
            {CASES.map((case_, index) => (
              <button
                key={case_.key}
                onClick={() => setActive(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                  active === index
                    ? `${case_.bgColor} ${case_.borderColor} shadow-md scale-105`
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${case_.accent} flex items-center justify-center`}>
                    <case_.Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{case_.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{case_.desc}</p>
                  </div>
                  {active === index && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Right: Active case details */}
          <div className={`relative p-6 rounded-2xl border-2 ${A.bgColor} ${A.borderColor} shadow-lg`}>
            {/* Gradient accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${A.accent}`}></div>
            
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${A.accent} flex items-center justify-center`}>
                  <A.Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{A.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{A.desc}</p>
                </div>
              </div>

              {/* Points */}
              <div className="space-y-2">
                {A.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${A.accent} flex items-center justify-center mt-0.5`}>
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>

              {/* Example */}
              <div className="p-3 bg-white/80 dark:bg-gray-700/80 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Example output:</p>
                <p className="text-xs text-gray-800 dark:text-gray-200 italic">"{A.example}"</p>
              </div>

              {/* CTA */}
              <Link
                href="/Dashboard"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${A.accent} text-white font-semibold rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-105`}
              >
                <span className="text-sm">Try this approach</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
