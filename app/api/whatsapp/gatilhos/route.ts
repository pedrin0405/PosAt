import { NextResponse } from "next/server";
import { GATILHOS_FOLLOW_UP } from "@/lib/whatsapp";

export async function GET() {
  return NextResponse.json({ gatilhos: GATILHOS_FOLLOW_UP });
}