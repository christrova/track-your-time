import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "../_lib/supabase-server"


const supabase = createSupabaseServerClient()


export async function POST(req: Request) {
    const {email, password, username} = await req.json()


    const { data: existingAuthUser } = await supabase.from('users_auth').select("*").eq("email", email).single()

    if (existingAuthUser) {
        return NextResponse.json({warning_code : "already_signup", message : "utilisateur déjà inscrit"}, {status : 400})
    }

    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const { data : userRow, error: dbError } = await supabase.from("users_auth").insert({email, password_hash}).select().single()

    if(dbError){
        return NextResponse.json({error: dbError.message}, {status : 400})
    }

    const {data, error} = await supabase.auth.signUp({
        email,
        password
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status : 400 })
    }

    const supabaseUserId = data.user?.id;

    if (!supabaseUserId) {
        return NextResponse.json({error: "Failed to create user in Supabase Auth"}, {status: 400})
    }

    try{
        // Insert user into users table
        const { error: usersError } = await supabase.from("users").insert({
            user_id: supabaseUserId,
            email,
            username
        })

        if (usersError) {
            return NextResponse.json({error: `Failed to create user profile: ${usersError.message}`}, {status: 400})
        }

        //Init the presence table
        const {error : presenceError } = await supabase.from("presence").insert({
            user_id: supabaseUserId,
            status : "OFFLINE",
        })

        if(presenceError){
            return NextResponse.json({error : `Failed to create user profile: ${presenceError.message}`}, {status : 400})
        }

        // Update users_auth with the Supabase user_id
        const { error: authUpdateError } = await supabase.from('users_auth').update({
            user_id : supabaseUserId
        }).eq("email", email)

        if (authUpdateError) {
            return NextResponse.json({error: `Failed to link auth user: ${authUpdateError.message}`}, {status: 400})
        }


    }catch(e: any){
        return NextResponse.json({error: e?.message || "Unknown error"}, {status : 400})
    }


    return NextResponse.json({user_id : supabaseUserId}, {status : 200 })
}
