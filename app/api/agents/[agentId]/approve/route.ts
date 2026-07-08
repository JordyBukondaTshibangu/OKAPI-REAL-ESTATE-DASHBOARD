import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

function authHeaders(req: NextRequest): Record<string, string> {
  const auth = req.headers.get("authorization");
  return auth
    ? { "Content-Type": "application/json", Authorization: auth }
    : { "Content-Type": "application/json" };
}

/** PATCH /api/agents/:agentId/approve → proxies to backend PATCH /agents/:agentId/approve */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const res = await fetch(`${BACKEND}/agents/${agentId}/approve`, {
    method: "PATCH",
    headers: authHeaders(req),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
