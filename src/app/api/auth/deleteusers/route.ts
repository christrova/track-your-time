import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


const supabase = createClient(
    supabaseUrl!,
    supabaseServiceKey!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(req: Request) {
    console.log("🚀 DELETE USERS API: Request received");
    console.log("🔧 Supabase URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
    console.log("🔧 Service Role Key:", supabaseServiceKey ? "✅ Set" : "❌ Missing");

    let page = 1
    let  hasmore = true
    let totalDeleted = 0
    let totalUsersInDb = 0

    while (hasmore){
        console.log(`📄 Fetching page ${page}...`);
        const {data : users, error: dbError} = await supabase.auth.admin.listUsers({
            perPage : 100,
            page
        })

    if(dbError){
       console.error("❌ Error fetching users:", dbError);
       return  NextResponse.json({error: dbError, message : "Admin error : while getting users"})
    }

    if (!users || !users.users || users.users.length === 0) {
        console.log("ℹ️  No users found to delete");
        hasmore = false
        break;
    }

    for(const user of users.users){
     const {error: deleteError }  = await supabase.auth.admin.deleteUser(user.id)
     if (deleteError){
        console.error(`❌ Error deleting user ${user.id}:`, deleteError);
        return NextResponse.json({error: "Problem during the delation of user"})
     }
     totalDeleted++;
     console.log(`🗑️  Deleted user: ${user.id} (${totalDeleted} total)`);
    }

    page++
    }

    console.log(`✅ Successfully deleted ${totalDeleted} users`);

    if (totalDeleted === 0) {
        return NextResponse.json({
            message: "Aucun utilisateur à supprimer (0 utilisateurs dans la base de données)",
            totalDeleted: 0,
            totalInDatabase: totalUsersInDb
        }, {status : 200});
    }

    return NextResponse.json({
        message: `Suppression réussi ✅ (${totalDeleted} utilisateur(s) supprimé(s))`,
        totalDeleted,
        totalInDatabase: totalUsersInDb
    }, {status : 200})

}