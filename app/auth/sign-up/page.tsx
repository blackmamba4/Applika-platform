import { SignUpForm } from "@/components/sign-up-form";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/favicon.ico"
            alt="Applika logo"
            width={32}
            height={32}
            className="group-hover:opacity-80 transition-opacity duration-200"
          />
          <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            Applika
          </span>
        </Link>
      </div>

      {/* Sign Up Form */}
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© 2024 Applika. All rights reserved.</p>
      </div>
    </div>
  );
}
