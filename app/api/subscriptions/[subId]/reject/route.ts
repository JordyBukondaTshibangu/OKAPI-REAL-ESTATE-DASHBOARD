import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ subId: string }> },
) {
  const { subId } = await params;
  const auth = req.headers.get("authorization");
  const body = await req.json();
  const res = await fetch(`${BACKEND}/subscriptions/admin/${subId}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
