import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserIdFromRequest } from "@/lib/auth";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await connectDB();
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  return NextResponse.json({ user: user.toJSON() });
}

export async function PUT(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const updates = await req.json();
  const allowed: Record<string, unknown> = {};
  if (updates.name) allowed.name = updates.name;
  if (updates.language) allowed.language = updates.language;
  if (updates.currency) allowed.currency = updates.currency;
  if (updates.theme) allowed.theme = updates.theme;

  await connectDB();
  const user = await User.findByIdAndUpdate(userId, { $set: allowed }, { new: true });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  return NextResponse.json({ user: user.toJSON() });
}
