// lib/error-handler.ts
import { NextResponse } from "next/server";

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Common error types
export const errors = {
  UNAUTHORIZED: new AppError("Unauthorized", 401, "UNAUTHORIZED"),
  FORBIDDEN: new AppError("Forbidden", 403, "FORBIDDEN"),
  NOT_FOUND: new AppError("Not found", 404, "NOT_FOUND"),
  VALIDATION_ERROR: new AppError("Validation failed", 400, "VALIDATION_ERROR"),
  RATE_LIMITED: new AppError("Rate limit exceeded", 429, "RATE_LIMITED"),
  INTERNAL_ERROR: new AppError("Internal server error", 500, "INTERNAL_ERROR"),
  SERVICE_UNAVAILABLE: new AppError("Service unavailable", 503, "SERVICE_UNAVAILABLE"),
};

// Error handler for API routes
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle validation errors from our validation system
  if (error && typeof error === "object" && "isValid" in error && !error.isValid) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Handle Supabase errors
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as any).message;
    
    // Common Supabase error patterns
    if (message.includes("JWT")) {
      return NextResponse.json(
        { error: "Invalid or expired token", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }
    
    if (message.includes("permission denied")) {
      return NextResponse.json(
        { error: "Permission denied", code: "PERMISSION_DENIED" },
        { status: 403 }
      );
    }
    
    if (message.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Resource already exists", code: "DUPLICATE_RESOURCE" },
        { status: 409 }
      );
    }
  }

  // Handle network/timeout errors
  if (error instanceof Error) {
    if (error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Request timeout", code: "TIMEOUT" },
        { status: 408 }
      );
    }
    
    if (error.message.includes("fetch")) {
      return NextResponse.json(
        { error: "External service unavailable", code: "EXTERNAL_SERVICE_ERROR" },
        { status: 502 }
      );
    }
  }

  // Default fallback
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

// Wrapper for API route handlers
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Rate limiting helper
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return this.maxRequests;
    
    const now = Date.now();
    if (now > record.resetTime) return this.maxRequests;
    
    return Math.max(0, this.maxRequests - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record?.resetTime || Date.now() + this.windowMs;
  }
}
