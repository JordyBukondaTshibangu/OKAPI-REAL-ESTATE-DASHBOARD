import { NextRequest, NextResponse } from "next/server";

const BACKEND = "http://localhost:3000";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const res = await fetch(`${BACKEND}/agencies/${agencyId}`, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const body = await req.json();
  const res = await fetch(`${BACKEND}/agencies/${agencyId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const res = await fetch(`${BACKEND}/agencies/${agencyId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
