import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "../_lib/supabase-server"
import bcrypt from "bcrypt"

const supabase = createSupabaseServerClient()

export async function POST(req: Request){
    const {email, password} = await req.json()

    console.log("🔐 Signin attempt for email:", email)

    // First, verify user exists in users_auth table and check password
    const { data: authUser, error: authError } = await supabase
        .from('users_auth')
        .select('*')
        .eq('email', email)
        .single()

    if (authError) {
        console.error("❌ Error fetching user from users_auth:", authError)
        return NextResponse.json({error: "Email ou mot de passe incorrect"}, {status: 401})
    }

    if (!authUser) {
        console.log("❌ User not found in users_auth table")
        return NextResponse.json({error: "Email ou mot de passe incorrect"}, {status: 401})
    }

    // Verify password against bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, authUser.password_hash)
    
    if (!isPasswordValid) {
        console.log("❌ Invalid password")
        return NextResponse.json({error: "Email ou mot de passe incorrect"}, {status: 401})
    }

    console.log("✅ Password verified successfully")

    // If user has a user_id, get the Supabase Auth user
    if (authUser.user_id) {
        console.log("🔍 Fetching user data for user_id:", authUser.user_id)
        
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', authUser.user_id)
            .single()

        if (userError) {
            console.error("❌ Error fetching user from users table:", userError)
            // If user doesn't exist in users table, return error but allow them to know the issue
            if (userError.code === 'PGRST116') {
                return NextResponse.json({
                    error: "User profile not found. Please contact support.",
                    code: "PROFILE_MISSING"
                }, {status: 500})
            }
            return NextResponse.json({error: userError.message}, {status: 500})
        }

        if (!userData) {
            console.error("❌ User data is null")
            return NextResponse.json({
                error: "User profile not found. Please contact support.",
                code: "PROFILE_MISSING"
            }, {status: 500})
        }

        console.log("✅ User data fetched:", userData)

        // Get Supabase Auth user for session
        try {
            const { data: authData, error: authDataError } = await supabase.auth.admin.getUserById(authUser.user_id)
            
            if (authDataError) {
                console.error("❌ Error fetching auth user:", authDataError)
                // Don't fail if we can't get auth data, just return user data
            }

            return NextResponse.json({
                user: userData,
                authUser: authData?.user
            }, {status: 200})
        } catch (error: any) {
            console.error("❌ Exception getting auth user:", error)
            // Return user data even if auth fetch fails
            return NextResponse.json({
                user: userData
            }, {status: 200})
        }
    }

    // If no user_id, user might not be fully set up
    console.log("⚠️  User has no user_id, account might be incomplete")
    return NextResponse.json({error: "Compte utilisateur incomplet"}, {status: 401})
}