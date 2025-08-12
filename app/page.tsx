
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
      <div className="flex-1 w-full flex flex-col gap-10 items-center">
        {/* NAVBAR */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold text-xl">
              {/* Logo */}
              <Link href={"/"} className="flex items-center gap-2">
                <Image
                  src="/favicon.ico" // replace with your icon path
                  alt="Applika logo"
                  width={28}
                  height={28}
                />
                Applika
              </Link>
              {/* Page links */}
              <div className="hidden md:flex gap-6 text-sm font-normal">
                <a href="#benefits" className="hover:underline">Benefits</a>
                <a href="#usecases" className="hover:underline">Use Cases</a>
                <a href="#pricing" className="hover:underline">Pricing</a>
                <a href="#cta" className="hover:underline">Get Started</a>
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col gap-20 max-w-5xl">
          <Hero />
          <section id="benefits">
            <Benefits />
          </section>
          <section id="usecases">
            <UseCases />
          </section>
          <section id="pricing">
            <Pricing />
          </section>
          <section id="cta">
            <FinalCTA />
          </section>
        </div>

        {/* FOOTER */}
        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
