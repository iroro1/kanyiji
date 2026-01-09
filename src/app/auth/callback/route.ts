import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/";

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(errorDescription || error)}`,
        requestUrl.origin
      )
    );
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (err) {
            console.error("Error setting cookies:", err);
            // Ignore cookie errors in server components
          }
        },
      },
    });

    try {
      console.log("Exchanging code for session...");
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Auth callback exchange error:", exchangeError);
        return NextResponse.redirect(
          new URL(
            `/?error=${encodeURIComponent(exchangeError.message || "Authentication failed")}`,
            requestUrl.origin
          )
        );
      }

      if (data.session) {
        console.log("Session created successfully for user:", data.session.user.email);
        // Successfully authenticated - redirect to home or next URL
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      } else {
        console.error("No session returned after code exchange");
        return NextResponse.redirect(
          new URL(
            `/?error=${encodeURIComponent("No session created")}`,
            requestUrl.origin
          )
        );
      }
    } catch (error: any) {
      console.error("Unexpected auth callback error:", error);
      return NextResponse.redirect(
        new URL(
          `/?error=${encodeURIComponent(error.message || "Authentication failed")}`,
          requestUrl.origin
        )
      );
    }
  }

  // If no code and no error, check if there's a hash fragment (for client-side OAuth)
  // This handles cases where OAuth redirects with hash instead of query params
  const hash = requestUrl.hash;
  if (hash && hash.includes("access_token")) {
    // Client-side OAuth - let the page.tsx handle it
    return NextResponse.redirect(new URL("/auth/callback", requestUrl.origin));
  }

  // If no code, redirect to home
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}

