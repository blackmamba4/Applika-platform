"use client";
import { useState, useEffect } from "react";
import { Wand2, Sparkles, Gauge, ShieldCheck, FileText, Download, ArrowRight } from "lucide-react";

const items = [
  {
    title: "Job-specific matching",
    desc: "We analyze the company's site and role requirements to create content that actually fits",
    Icon: Wand2,
    color: "from-emerald-500 to-teal-500",
    stat: "95% match rate"
  },
  {
    title: "Your authentic voice",
    desc: "Tone-matching keeps phrasing natural and consistent with your CV style",
    Icon: Sparkles,
    color: "from-violet-500 to-purple-500",
    stat: "3x more personal"
  },
  {
    title: "Lightning fast",
    desc: "From job URL to polished letter in under 60 seconds",
    Icon: Gauge,
    color: "from-blue-500 to-cyan-500",
    stat: "60s average"
  },
  {
    title: "Privacy first",
    desc: "Your data stays private. Delete anytime, no questions asked",
    Icon: ShieldCheck,
    color: "from-green-500 to-emerald-500",
    stat: "100% private"
  },
  {
    title: "ATS-optimized",
    desc: "Keywords and clean formatting that pass automated screening systems",
    Icon: FileText,
    color: "from-orange-500 to-red-500",
    stat: "ATS-friendly"
  },
  {
    title: "Export anywhere",
    desc: "Copy, PDF, or DOCX—ready to send immediately",
    Icon: Download,
    color: "from-pink-500 to-rose-500",
    stat: "3 formats"
  },
];

export default function Benefits() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="benefits" className="relative w-full py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-6">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            Why thousands trust us
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black leading-[0.9] tracking-tight mb-6">
            <span className="block text-gray-900 dark:text-gray-100">Built for</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-violet-600 to-purple-600">
              Real Results
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We don't just generate text—we create cover letters that actually get you noticed 
            by matching your experience to what employers are looking for.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="group relative p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${item.color}`}></div>
              
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <item.Icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {item.stat}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {item.desc}
                </p>
                
                {/* Hover arrow */}
                <div className={`flex items-center text-emerald-600 dark:text-emerald-400 font-medium transition-all duration-300 ${
                  hoveredIndex === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                }`}>
                  <span className="text-xs">Learn more</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <span>See it in action</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
