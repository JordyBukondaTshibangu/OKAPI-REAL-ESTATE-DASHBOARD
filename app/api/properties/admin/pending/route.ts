import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const res = await fetch(`${BACKEND}/properties/admin/pending`, {
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
