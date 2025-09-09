// lib/auth-utils.ts
/**
 * Get the correct redirect URL based on environment
 * Works for both localhost and production
 */
export function getRedirectUrl(path: string = "/Dashboard"): string {
  // In browser environment
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  
  // In server environment, use environment variable or fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000";
  
  return `${baseUrl}${path}`;
}

/**
 * Get auth callback URL
 */
export function getAuthCallbackUrl(): string {
  return getRedirectUrl("/auth/callback");
}

/**
 * Get email confirmation redirect URL
 */
export function getEmailConfirmUrl(): string {
  return getRedirectUrl("/Dashboard");
}

/**
 * Get password reset redirect URL
 */
export function getPasswordResetUrl(): string {
  return getRedirectUrl("/auth/update-password");
}
