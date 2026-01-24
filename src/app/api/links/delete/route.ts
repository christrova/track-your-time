import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClientForRouteHandler } from "../../auth/_lib/supabaseserver";
import { deleteUserLink } from "@/lib/queries/links";

export async function DELETE(req: NextRequest) {
  try {
    const { supabase, response } = createSupabaseServerClientForRouteHandler(
      req,
      NextResponse.next()
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get("linkId");

    if (!linkId) {
      return NextResponse.json(
        { error: "linkId is required" },
        { status: 400 }
      );
    }

    const { error } = await deleteUserLink(supabase, linkId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
