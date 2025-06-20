import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    const { pathname } = request.nextUrl;

    const isPublic =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/_next");

    // Jika belum login dan bukan ke halaman public → redirect ke login
    if (!token && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Jika sudah login dan akses login → redirect ke dashboard
    if (token && pathname === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|favicon.ico).*)"], // proteksi semua route kecuali ini
};
