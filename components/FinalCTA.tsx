"use client";
import Link from "next/link";
import { ArrowRight, Star, Users, Zap } from "lucide-react";

export default function FinalCTA() {
  return (
    <section id="cta" className="relative w-full py-16">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Stats */}
        <div className="text-center mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-gray-900">10,000+</div>
                <div className="text-xs text-gray-600">Cover letters generated</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-violet-600" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-gray-900">4.9/5</div>
                <div className="text-xs text-gray-600">User satisfaction</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-gray-900">60s</div>
                <div className="text-xs text-gray-600">Average generation time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed mb-4">
                "I landed 3 interviews in a week after switching to Applika's AI-tailored letters. 
                Recruiters told me my cover letter actually stood out — that's never happened before."
              </blockquote>
              
              <figcaption className="text-gray-600 font-medium text-sm">
                — Sarah W., Marketing Manager
              </figcaption>
            </div>
          </div>
        </div>

        {/* Main CTA */}
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-black leading-[0.9] tracking-tight mb-6">
            <span className="block text-gray-900">Ready to</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-violet-600 to-purple-600">
              Land Your Dream Job?
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Stop sending generic applications that get lost in the pile. 
            Let Applika craft a letter that actually gets read and gets you noticed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/Dashboard"
              className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Writing Better Letters
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-violet-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 font-medium text-lg transition-colors duration-200"
            >
              View pricing →
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
