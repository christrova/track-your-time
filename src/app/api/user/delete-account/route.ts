import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClientForRouteHandler,
} from "../../auth/_lib/supabaseserver";

export async function DELETE(req: NextRequest) {
  try {
    const { supabase } = createSupabaseServerClientForRouteHandler(
      req,
      NextResponse.next(),
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(
      user.id,
    );

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
