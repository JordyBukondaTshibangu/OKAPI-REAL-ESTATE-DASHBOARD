import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

/** Verifies the admin JWT token by calling a protected backend endpoint. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ valid: false }, { status: 401 });

  try {
    const res = await fetch(`${BACKEND}/auth/admin/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
    });
    if (res.status === 200 || res.status === 201) {
      return NextResponse.json({ valid: true });
    }
    return NextResponse.json({ valid: false }, { status: 401 });
  } catch {
    return NextResponse.json({ valid: false }, { status: 503 });
  }
}
