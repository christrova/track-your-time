import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClientForRouteHandler } from "../../auth/_lib/supabaseserver";
import { updateUserData } from "@/lib/queries/user";

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

    const body = await req.json();
    const { data, error } = await updateUserData(supabase, user.id, body);

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
