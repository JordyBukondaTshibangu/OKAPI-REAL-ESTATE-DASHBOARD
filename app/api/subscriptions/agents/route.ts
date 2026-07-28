import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const status = req.nextUrl.searchParams.get("status") ?? "";
  const url = `${BACKEND}/subscriptions/admin/active-agents${status ? `?status=${status}` : ""}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
