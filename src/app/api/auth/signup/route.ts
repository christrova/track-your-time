import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../_lib/supabaseserver";

const supabase = createSupabaseAdminClient();

export async function POST(req: Request) {
  const { email, password, username } = await req.json();

  const { data: existingAuthUser } = await supabase
    .from("users_auth")
    .select("*")
    .eq("email", email)
    .single();

  if (existingAuthUser) {
    return NextResponse.json(
      { warning_code: "already_signup", message: "utilisateur déjà inscrit" },
      { status: 400 },
    );
  }

  const normalizedUsername =
    typeof username === "string" ? username.trim().toLowerCase() : "";
  if (!normalizedUsername) {
    return NextResponse.json(
      { error: "Le nom d'utilisateur est requis.", code: "USERNAME_REQUIRED" },
      { status: 400 },
    );
  }

  const { data: existingByUsername } = await supabase
    .from("users")
    .select("user_id")
    .eq("username", normalizedUsername)
    .maybeSingle();
  if (existingByUsername) {
    return NextResponse.json(
      { error: "Ce nom d'utilisateur est déjà pris.", code: "USERNAME_TAKEN" },
      { status: 400 },
    );
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const { data: userRow, error: dbError } = await supabase
    .from("users_auth")
    .insert({ email, password_hash })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    await supabase.from("users_auth").delete().eq("email", email);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const supabaseUserId = data.user?.id;

  if (!supabaseUserId) {
    await supabase.from("users_auth").delete().eq("email", email);
    return NextResponse.json(
      { error: "Failed to create user in Supabase Auth" },
      { status: 400 },
    );
  }

  let usersCreated = false;
  let presenceCreated = false;
  let usersAuthUpdated = false;

  try {
    const { error: usersError } = await supabase.from("users").insert({
      user_id: supabaseUserId,
      email,
      username: normalizedUsername,
    });

    if (usersError) {
      if (
        usersError.code === "23505" ||
        /unique|duplicate/i.test(usersError.message ?? "")
      ) {
        throw new Error("Ce nom d'utilisateur est déjà pris.");
      }
      throw new Error(`Failed to create user: ${usersError.message}`);
    }
    usersCreated = true;

    const { error: presenceError } = await supabase.from("presence").insert({
      user_id: supabaseUserId,
      status: "OFFLINE",
    });

    if (presenceError) {
      throw new Error(`Failed to create presence: ${presenceError.message}`);
    }
    presenceCreated = true;

    const { error: authUpdateError } = await supabase
      .from("users_auth")
      .update({
        user_id: supabaseUserId,
      })
      .eq("email", email);

    if (authUpdateError) {
      throw new Error(`Failed to link auth user: ${authUpdateError.message}`);
    }
    usersAuthUpdated = true;

    return NextResponse.json({ user_id: supabaseUserId }, { status: 200 });
  } catch (error: any) {
    // Delete in reverse order
    if (presenceCreated) {
      await supabase.from("presence").delete().eq("user_id", supabaseUserId);
    }

    if (usersCreated) {
      await supabase.from("users").delete().eq("user_id", supabaseUserId);
    }

    // Delete users_auth
    await supabase.from("users_auth").delete().eq("email", email);

    // Delete Supabase Auth user
    try {
      await supabase.auth.admin.deleteUser(supabaseUserId);
    } catch (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to create user",
        code: "SIGNUP_FAILED",
      },
      { status: 400 },
    );
  }
}
