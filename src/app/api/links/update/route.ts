import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClientForRouteHandler } from "../../auth/_lib/supabaseserver";
import { updateUserLink } from "@/lib/queries/links";

export async function PATCH(req: NextRequest) {
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

    const { linkId, ...updates } = await req.json();

    if (!linkId) {
      return NextResponse.json(
        { error: "linkId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await updateUserLink(supabase, linkId, updates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
