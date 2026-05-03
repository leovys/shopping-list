import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserIdFromRequest } from "@/lib/auth";
import { ShoppingList } from "@/models/List";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const archived = req.nextUrl.searchParams.get("archived") === "true";

  await connectDB();
  const lists = await ShoppingList.find({ userId, isArchived: archived }).sort({
    [archived ? "archivedAt" : "createdAt"]: -1,
  });

  return NextResponse.json({ lists: lists.map((l) => l.toJSON()) });
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, budget } = await req.json();
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  await connectDB();
  const list = await ShoppingList.create({
    userId,
    name,
    budget: budget || undefined,
    items: [],
  });

  return NextResponse.json({ list: list.toJSON() }, { status: 201 });
}
