
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "../_lib/supabase-server"



const supabase = createSupabaseServerClient()


export async function POST(req: Request){
    const {email, password} = await req.json()


   const {data: dbData, error: dbError} = await supabase.auth.signInWithPassword({email, password})

   if(dbError){
        return NextResponse.json({error : dbError.message}, {status : 401} )
   }

   const {data: userData, error: userError} = await supabase.from('users').select('*').eq('user_id', dbData.user?.id).single()

   if(userError){
        return  NextResponse.json({error:userError.message}, {status: 500})
   }

   return NextResponse.json({
        user : userData,
        session : dbData.session
   })

}