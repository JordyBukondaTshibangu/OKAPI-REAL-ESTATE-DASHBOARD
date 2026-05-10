import { NextRequest, NextResponse } from "next/server";

const BACKEND = "http://localhost:3000";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.toString();
  const res = await fetch(`${BACKEND}/properties${search ? `?${search}` : ""}`, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND}/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
