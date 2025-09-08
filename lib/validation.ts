// lib/validation.ts
import { NextRequest } from "next/server";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

// Common validation functions
export const validators = {
  required: (value: any, fieldName: string): ValidationError | null => {
    if (value === null || value === undefined || value === "") {
      return { field: fieldName, message: `${fieldName} is required` };
    }
    return null;
  },

  string: (value: any, fieldName: string, minLength = 0, maxLength = Infinity): ValidationError | null => {
    if (typeof value !== "string") {
      return { field: fieldName, message: `${fieldName} must be a string` };
    }
    if (value.length < minLength) {
      return { field: fieldName, message: `${fieldName} must be at least ${minLength} characters` };
    }
    if (value.length > maxLength) {
      return { field: fieldName, message: `${fieldName} must be no more than ${maxLength} characters` };
    }
    return null;
  },

  email: (value: any, fieldName: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value !== "string" || !emailRegex.test(value)) {
      return { field: fieldName, message: `${fieldName} must be a valid email address` };
    }
    return null;
  },

  url: (value: any, fieldName: string): ValidationError | null => {
    try {
      new URL(value);
      return null;
    } catch {
      return { field: fieldName, message: `${fieldName} must be a valid URL` };
    }
  },

  oneOf: (value: any, fieldName: string, options: string[]): ValidationError | null => {
    if (!options.includes(value)) {
      return { field: fieldName, message: `${fieldName} must be one of: ${options.join(", ")}` };
    }
    return null;
  },

  number: (value: any, fieldName: string, min = -Infinity, max = Infinity): ValidationError | null => {
    const num = Number(value);
    if (isNaN(num)) {
      return { field: fieldName, message: `${fieldName} must be a number` };
    }
    if (num < min) {
      return { field: fieldName, message: `${fieldName} must be at least ${min}` };
    }
    if (num > max) {
      return { field: fieldName, message: `${fieldName} must be no more than ${max}` };
    }
    return null;
  },

  boolean: (value: any, fieldName: string): ValidationError | null => {
    if (typeof value !== "boolean") {
      return { field: fieldName, message: `${fieldName} must be a boolean` };
    }
    return null;
  }
};

// Validation schemas for different API endpoints
export const schemas = {
  generateLetter: {
    jobTitle: (value: any) => validators.string(value, "jobTitle", 1, 200),
    companyName: (value: any) => validators.string(value, "companyName", 1, 200),
    companyHomepage: (value: any) => value ? validators.url(value, "companyHomepage") : null,
    companyAbout: (value: any) => value ? validators.string(value, "companyAbout", 0, 10000) : null,
    jobDescHtml: (value: any) => value ? validators.string(value, "jobDescHtml", 0, 50000) : null,
    cvText: (value: any) => value ? validators.string(value, "cvText", 0, 50000) : null,
    userName: (value: any) => value ? validators.string(value, "userName", 1, 100) : null,
    contactPhone: (value: any) => value ? validators.string(value, "contactPhone", 0, 50) : null,
    contactCity: (value: any) => value ? validators.string(value, "contactCity", 0, 100) : null,
    length: (value: any) => value ? validators.oneOf(value, "length", ["short", "medium", "long"]) : null,
    tone: (value: any) => value ? validators.oneOf(value, "tone", ["professional", "modern", "creative", "direct"]) : null,
  },

  ingestJob: {
    mode: (value: any) => validators.oneOf(value, "mode", ["url", "manual"]),
    jobUrl: (value: any, data: any) => {
      if (data.mode === "url") {
        return validators.url(value, "jobUrl");
      }
      return null;
    },
    jobTitle: (value: any, data: any) => {
      if (data.mode === "manual") {
        return validators.string(value, "jobTitle", 1, 200);
      }
      return null;
    },
    jobDesc: (value: any, data: any) => {
      if (data.mode === "manual" && value) {
        return validators.string(value, "jobDesc", 0, 50000);
      }
      return null;
    },
    jobDescHtml: (value: any, data: any) => {
      if (data.mode === "manual" && value) {
        return validators.string(value, "jobDescHtml", 0, 50000);
      }
      return null;
    },
    cvMode: (value: any) => validators.oneOf(value, "cvMode", ["auto", "manual"]),
    cvText: (value: any, data: any) => {
      if (data.cvMode === "manual" && value) {
        return validators.string(value, "cvText", 0, 50000);
      }
      return null;
    },
  },

  profileUpdate: {
    first_name: (value: any) => value ? validators.string(value, "first_name", 1, 100) : null,
    last_name: (value: any) => value ? validators.string(value, "last_name", 1, 100) : null,
    desired_role: (value: any) => value ? validators.string(value, "desired_role", 1, 200) : null,
    tone_default: (value: any) => value ? validators.oneOf(value, "tone_default", ["Professional", "Modern", "Creative", "Direct"]) : null,
    locale: (value: any) => value ? validators.oneOf(value, "locale", ["UK", "US", "EU"]) : null,
  }
};

// Main validation function
export function validateRequest<T>(
  request: NextRequest,
  schema: Record<string, (value: any, data?: any) => ValidationError | null>
): Promise<ValidationResult> {
  return new Promise(async (resolve) => {
    try {
      const body = await request.json();
      const errors: ValidationError[] = [];

      // Validate each field in the schema
      for (const [field, validator] of Object.entries(schema)) {
        const error = validator(body[field], body);
        if (error) {
          errors.push(error);
        }
      }

      resolve({
        isValid: errors.length === 0,
        errors,
        data: errors.length === 0 ? body : undefined
      });
    } catch (error) {
      resolve({
        isValid: false,
        errors: [{ field: "body", message: "Invalid JSON in request body" }]
      });
    }
  });
}

// Helper to create validation error response
export function createValidationErrorResponse(errors: ValidationError[]) {
  return {
    error: "Validation failed",
    details: errors,
    message: errors.map(e => `${e.field}: ${e.message}`).join(", ")
  };
}
