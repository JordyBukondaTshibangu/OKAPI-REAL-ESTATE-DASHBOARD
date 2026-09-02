import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

function authHeaders(req: NextRequest): Record<string, string> {
  const auth = req.headers.get("authorization");
  return auth
    ? { "Content-Type": "application/json", Authorization: auth }
    : { "Content-Type": "application/json" };
}

export async function GET(req: NextRequest) {
  const res = await fetch(`${BACKEND}/users/count`, {
    headers: authHeaders(req),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
