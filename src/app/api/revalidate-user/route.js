import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request) {
  // Intentamos leer el JSON { userId }
  const body = await request.json().catch(() => ({}));
  const userId = body?.userId;

  if (!userId) {
    return NextResponse.json(
      { ok: false, message: "Missing userId" },
      { status: 400 }
    );
  }

  // Revalidamos las tags asociadas a ese usuario
  revalidateTag(`user:${userId}`);
  revalidateTag(`user:${userId}:puzzles`);

  return NextResponse.json({
    ok: true,
    revalidated: [`user:${userId}`, `user:${userId}:puzzles`],
  });
}
