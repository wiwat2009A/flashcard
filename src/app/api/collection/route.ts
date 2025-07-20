import { getDb } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);
    return NextResponse.json({ ok: true, collections: collectionNames });
  } catch (error) {
    return NextResponse.json({ status: 500 });
  }
}
