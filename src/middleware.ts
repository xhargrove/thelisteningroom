import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "@/lib/auth/is-admin";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function withAdminNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function middleware(request: NextRequest) {
  const response = withAdminNoStore(
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    }),
  );

  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabasePublicConfig());
  } catch {
    return withAdminNoStore(
      NextResponse.next({
        request: {
          headers: request.headers,
        },
      }),
    );
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === "/admin/login";

  if (isLoginRoute) {
    if (user && isAdminUser(user)) {
      return withAdminNoStore(NextResponse.redirect(new URL("/admin", request.url)));
    }
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withAdminNoStore(NextResponse.redirect(loginUrl));
  }

  if (!isAdminUser(user)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "forbidden");
    return withAdminNoStore(NextResponse.redirect(loginUrl));
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
