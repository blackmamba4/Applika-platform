import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import ToastGlobal from "@/components/ToastGlobal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center relative">
      <ToastGlobal>
      <div className="flex-1 w-full flex flex-col gap-10 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-8 items-center">
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
              
                     {/* Navigation Links */}
                     <div className="hidden md:flex gap-6 text-sm font-medium">
                       <Link
                         href="/Dashboard"
                         className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200"
                       >
                         Home
                       </Link>
                       <Link
                         href="/Dashboard/Coverletters"
                         className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200"
                       >
                         Cover Letters
                       </Link>
                       <Link
                         href="/pricing"
                         className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200"
                       >
                         Pricing
                       </Link>
                     </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-6 max-w-5xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <div className="flex items-center gap-8">
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
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex gap-6 text-xs">
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
            <ThemeSwitcher />
          </div>
        </footer>
      </div>
      </ToastGlobal>
    </main>
  );
}
