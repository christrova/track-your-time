import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient, createSupabaseServerClientForRouteHandler } from "../_lib/supabaseserver"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest){
    const {email, password} = await req.json()

    const adminSupabase = createSupabaseAdminClient()

    const initialResponse = NextResponse.next({ request: req })
    const { supabase, response: supabaseResponse } = createSupabaseServerClientForRouteHandler(req, initialResponse)

    const { data: authUser, error: authError } = await adminSupabase
        .from('users_auth')
        .select('*')
        .eq('email', email)
        .single()

    if (authError) {
        return NextResponse.json({error: "Email ou mot de passe incorrect"}, {status: 401})
    }

    if (!authUser) {
        return NextResponse.json({error: "Email ou mot de passe incorrect"}, {status: 401})
    }

    const isPasswordValid = await bcrypt.compare(password, authUser.password_hash)

    if (!isPasswordValid) {
        return NextResponse.json({error: "Email ou mot de passe incorrect"}, {status: 401})
    }


    if (authUser.user_id) {
        const { data: userData, error: userError } = await adminSupabase
            .from('users')
            .select('*')
            .eq('user_id', authUser.user_id)
            .single()

        if (userError) {
            if (userError.code === 'PGRST116') {
                return NextResponse.json({
                    error: "User profile not found. Please contact support.",
                    code: "PROFILE_MISSING"
                }, {status: 500})
            }
            return NextResponse.json({error: userError.message}, {status: 500})
        }

        if (!userData) {
            return NextResponse.json({
                error: "User profile not found. Please contact support.",
                code: "PROFILE_MISSING"
            }, {status: 500})
        }

        const {data: userPresence, error: presenceError } = await adminSupabase.from("presence").select("*").eq("user_id", authUser.user_id).single()


        if(presenceError){
            return NextResponse.json({error: `error: "User presence not found. Please contact support :" ${presenceError.message}`}, {status : 500 })
        }


        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) {
            return NextResponse.json({
                user: userData,
                warning: "Session could not be created automatically",
                error: signInError.message
            }, {status: 200})
        }

        const jsonResponse = NextResponse.json({
            user: userData,
            presence: userPresence,
            session: sessionData.session,
        }, { status: 200 })


        return jsonResponse
    }

    console.log("⚠️  User has no user_id, account might be incomplete")
    return NextResponse.json({error: "Compte utilisateur incomplet"}, {status: 401})
}