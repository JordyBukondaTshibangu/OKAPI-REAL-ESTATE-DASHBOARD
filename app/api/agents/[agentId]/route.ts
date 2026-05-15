import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

function authHeaders(req: NextRequest): Record<string, string> {
  const auth = req.headers.get("authorization");
  return auth ? { "Content-Type": "application/json", Authorization: auth } : { "Content-Type": "application/json" };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const res = await fetch(`${BACKEND}/agents/${agentId}`, {
    headers: authHeaders(req),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const body = await req.json();
  const res = await fetch(`${BACKEND}/agents/${agentId}`, {
    method: "PATCH",
    headers: authHeaders(req),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const res = await fetch(`${BACKEND}/agents/${agentId}`, {
    method: "DELETE",
    headers: authHeaders(req),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
