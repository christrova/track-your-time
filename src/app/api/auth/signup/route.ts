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

    try{
        await supabase.from("users").insert({
            user_id: supabaseUserId,
            username
        })
        await supabase.from('users_auth').update({
            user_id : supabaseUserId
        }).eq("email", email)

        await supabase.from("users").insert({ user_id:supabaseUserId, username })

    }catch(e){
        return NextResponse.json({error : e}, {status : 400})
    }


    return NextResponse.json({user_id : supabaseUserId}, {status : 200 })
}
