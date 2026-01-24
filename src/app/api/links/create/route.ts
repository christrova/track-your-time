import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClientForRouteHandler } from "../../auth/_lib/supabaseserver";
import { createUserLink } from "@/lib/queries/links";

export async function POST(req: NextRequest) {
  try {
    const { supabase, response } = createSupabaseServerClientForRouteHandler(
      req,
      NextResponse.next(),
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { networkName, networkLink } = await req.json();

    if (!networkName || !networkLink) {
      return NextResponse.json(
        { error: "networkName and networkLink are required" },
        { status: 400 },
      );
    }

    const { data, error } = await createUserLink(
      supabase,
      user.id,
      networkName,
      networkLink,
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
