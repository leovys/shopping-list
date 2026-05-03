import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserIdFromRequest } from "@/lib/auth";
import { ShoppingList } from "@/models/List";

async function getListForUser(listId: string, userId: string) {
  return ShoppingList.findOne({ _id: listId, userId });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await connectDB();
  const list = await getListForUser(params.id, userId);
  if (!list) return NextResponse.json({ error: "Lista não encontrada" }, { status: 404 });

  return NextResponse.json({ list: list.toJSON() });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if (body.name !== undefined) allowed.name = body.name;
  if (body.budget !== undefined) allowed.budget = body.budget;
  if (body.items !== undefined) allowed.items = body.items;
  if (body.isArchived !== undefined) allowed.isArchived = body.isArchived;
  if (body.archivedAt !== undefined) allowed.archivedAt = body.archivedAt;

  await connectDB();
  const list = await ShoppingList.findOneAndUpdate(
    { _id: params.id, userId },
    { $set: allowed },
    { new: true }
  );
  if (!list) return NextResponse.json({ error: "Lista não encontrada" }, { status: 404 });

  return NextResponse.json({ list: list.toJSON() });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await connectDB();
  const list = await ShoppingList.findOneAndDelete({ _id: params.id, userId });
  if (!list) return NextResponse.json({ error: "Lista não encontrada" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
