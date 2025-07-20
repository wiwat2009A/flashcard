import { getDb } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collectionName = searchParams.get("collection");

    if (!collectionName) {
      return NextResponse.json(
        { ok: false, error: "Missing collection name" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection(collectionName);
    const quizzes = await collection.find().toArray();

    return NextResponse.json({ ok: true, quizzes });
  } catch (error: any) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { collectionName, data } = await req.json();
    if (!collectionName || typeof collectionName !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid collectionName" },
        { status: 400 }
      );
    }

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Data must be an array" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection(collectionName);
    const result = await collection.insertMany(data);
    return NextResponse.json({
      ok: true,
      insertedCount: result.insertedCount,
    });
  } catch (error: any) {
    console.error("Insert failed:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
