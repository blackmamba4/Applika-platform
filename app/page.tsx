
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import Benefits from "@/components/benefits";
import UseCases from "@/components/usecases";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        {/* NAVBAR */}
        <nav className="w-full flex justify-center border-b border-gray-200/60 h-16">
          <div className="w-full max-w-6xl flex justify-between items-center p-3 px-6 text-sm">
            <div className="flex gap-5 items-center">
              {/* Logo */}
              <Link href={"/"} className="flex items-center gap-2 group">
                <Image
                  src="/favicon.ico"
                  alt="Applika logo"
                  width={28}
                  height={28}
                  className="group-hover:opacity-80 transition-opacity duration-200"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                  Applika
                </span>
              </Link>
              {/* Page links */}
              <div className="hidden md:flex gap-8 text-sm font-medium">
                <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Benefits
                </a>
                <a href="#usecases" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Use Cases
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Pricing
                </a>
                <a href="#cta" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Get Started
                </a>
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col gap-4 max-w-6xl px-6">
          <Hero />
          <section id="benefits" className="scroll-mt-4">
            <Benefits />
          </section>
          <section id="usecases" className="scroll-mt-4">
            <UseCases />
          </section>
          <section id="pricing" className="scroll-mt-4">
            <Pricing />
          </section>
          <section id="cta" className="scroll-mt-4">
            <FinalCTA />
          </section>
        </div>

        {/* FOOTER */}
        <footer className="w-full flex items-center justify-center border-t border-gray-200/50 mx-auto text-center text-xs gap-8 py-16">
          <div className="flex items-center gap-8">
            <p className="text-gray-600">
              Powered by{" "}
              <a
                href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                target="_blank"
                className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors duration-200"
                rel="noreferrer"
              >
                Supabase
              </a>
            </p>
            <div className="w-px h-4 bg-gray-300"></div>
            <ThemeSwitcher />
          </div>
        </footer>
      </div>
    </main>
  );
}
