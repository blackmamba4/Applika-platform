"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Hero() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: "📄", text: "Upload your CV" },
    { icon: "🔗", text: "Paste job posting" },
    { icon: "🤖", text: "AI analyzes & matches" },
    { icon: "✨", text: "Get personalized letter" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-12 md:py-16 flex items-center justify-center">
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
        <div className="text-center mb-8">
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            AI-powered cover letter generation
          </div>

          {/* Refined headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4">
            <span className="text-gray-900 dark:text-gray-100">Stop sending</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-violet-600">
              generic cover letters
            </span>
          </h1>

          {/* Refined subheading */}
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Create personalized, job-specific cover letters that actually get you noticed. 
            Upload your CV, paste the job posting, and let AI do the rest.
          </p>

          {/* Refined CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              href="/Dashboard"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              Start Writing Better Letters
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium transition-colors duration-200"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Refined process visualization */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative p-3 rounded-lg border transition-all duration-300 ${
                  currentStep === index
                    ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-lg mb-1">{step.icon}</div>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">{step.text}</p>
                {currentStep === index && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>

          {/* Refined demo card */}
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Live Demo</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">1</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">CV uploaded</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                    <span className="text-violet-600 dark:text-violet-400 font-bold text-xs">2</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full animate-pulse" style={{ width: '90%' }}></div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Job analyzed</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">3</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Letter generated</span>
                </div>
              </div>

              <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 italic">
                "I'm excited to apply for the Software Engineer role at TechCorp. With my 3 years of experience in React and Node.js, I can help scale your platform..."
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}