// lib/billing/config.ts

/**
 * Subscription Plans (monthly, auto-renew)
 */
export const PLANS = {
  free: {
    code: "free",
    name: "Free",
    quota: 3, // tokens/month
    stripePriceId: null, // no checkout needed
    lookupKey: null,
  },
  regular: {
    code: "regular",
    name: "Regular",
    quota: 30, // adjust as you want
    stripePriceId: "price_1S2BBJRVN4na7pk6gahYk8ej", // Stripe Regular plan (test)
    lookupKey: "regular-monthly", // Use this for live mode
  },
  pro: {
    code: "pro",
    name: "Pro",
    quota: 100, // adjust as you want
    stripePriceId: "price_1S2BBmRVN4na7pk6234I7LCd", // Stripe Pro plan (test)
    lookupKey: "pro-monthly", // Use this for live mode
  },
} as const;

/**
 * One-time token packs (top-ups, don’t reset monthly)
 */
export const TOKEN_PACKS = {
  pack20: {
    code: "pack20",
    name: "20 Tokens",
    amount: 20,
    stripePriceId: "price_1S2BCjRVN4na7pk6SM2Txp2m", // 20-token pack (test)
    lookupKey: "pack-20-tokens", // Use this for live mode
  },
  pack50: {
    code: "pack50",
    name: "50 Tokens",
    amount: 50,
    stripePriceId: "price_1S2BD5RVN4na7pk6MQBDg7QC", // 50-token pack (test)
    lookupKey: "pack-50-tokens", // Use this for live mode
  },
} as const;

/**
 * Type helpers for safety
 */
export type PlanCode = keyof typeof PLANS;
export type TokenPackCode = keyof typeof TOKEN_PACKS;

export function isPlanCode(code: string): code is PlanCode {
  return code in PLANS;
}

export function isTokenPackCode(code: string): code is TokenPackCode {
  return code in TOKEN_PACKS;
}
