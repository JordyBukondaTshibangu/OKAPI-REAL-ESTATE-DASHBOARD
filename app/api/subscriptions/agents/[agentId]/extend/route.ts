import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const auth = req.headers.get("authorization");
  const days = req.nextUrl.searchParams.get("days") ?? "30";
  const res = await fetch(`${BACKEND}/subscriptions/admin/agents/${agentId}/extend?days=${days}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
