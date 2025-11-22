/**
 * Environment variable validation
 * Validates required environment variables and provides helpful error messages
 */

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

const optionalEnvVars = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
};

export function validateEnvVars() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });

  // Check optional but recommended variables
  Object.entries(optionalEnvVars).forEach(([key, value]) => {
    if (!value) {
      warnings.push(key);
    }
  });

  if (missing.length > 0) {
    const errorMessage = `
❌ Missing required environment variables:
${missing.map((key) => `   - ${key}`).join('\n')}

Please add these to your .env.local file.
See env.example for reference.
    `.trim();

    if (typeof window === 'undefined') {
      // Server-side: throw error
      throw new Error(errorMessage);
    } else {
      // Client-side: log warning
      console.error(errorMessage);
    }
  }

  if (warnings.length > 0 && typeof window === 'undefined') {
    console.warn(`
⚠️  Missing optional environment variables:
${warnings.map((key) => `   - ${key}`).join('\n')}

These are not required but may be needed for certain features.
    `.trim());
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnvVars();
  } catch (error) {
    // In development, log the error but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    } else {
      // In production, re-throw to prevent deployment with missing vars
      throw error;
    }
  }
}

