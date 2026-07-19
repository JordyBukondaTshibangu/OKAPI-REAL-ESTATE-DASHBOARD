import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_URL_BACKEND;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;
  const auth = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${BACKEND}/properties/${propertyId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
