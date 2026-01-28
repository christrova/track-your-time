import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClientForRouteHandler,
} from "../_lib/supabaseserver";

export async function POST(req: NextRequest) {
  const initialResponse = NextResponse.next({ request: req });
  const { supabase, response } = createSupabaseServerClientForRouteHandler(
    req,
    initialResponse
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return NextResponse.json(
      { error: "Session invalide ou expirée. Veuillez redemander un lien." },
      { status: 401 }
    );
  }

  const { password } = await req.json();

  if (!password || typeof password !== "string") {
    return NextResponse.json(
      { error: "Nouveau mot de passe requis." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 6 caractères." },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 400 }
    );
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  const admin = createSupabaseAdminClient();

  const { error: dbError } = await admin
    .from("users_auth")
    .update({ password_hash })
    .eq("email", user.email);

  if (dbError) {
    return NextResponse.json(
      { error: "Mot de passe mis à jour côté connexion, mais erreur de synchronisation. Réessayez de vous connecter." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Mot de passe mis à jour. Vous pouvez vous connecter.",
  });
}
