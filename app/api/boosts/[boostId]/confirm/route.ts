import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boostId: string }> },
) {
  const { boostId } = await params;
  const auth = req.headers.get("authorization");
  const res = await fetch(`${BACKEND}/boosts/admin/${boostId}/confirm`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
