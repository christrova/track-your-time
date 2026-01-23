'use client'

import { useDashboard } from "@/providers/dashboard-provider"


export function Settings(){
    const {userLinks} = useDashboard()

    // console.log(userAuth.id)
    // console.log("userLinksuserLinks", userLinks)


    return (
        <div>
            {/* <p>Hello this is the userId :{userAuth.id}</p> */}
            <p>Hello this is the userId :{userLinks[0].created_at}</p>
            <p>Hello this is the userId :{userLinks[0].id}</p>
            <p>Hello this is the userId :{userLinks[0].network_name}</p>
            <p>Hello this is the userId :{userLinks[0].network_link}</p>
        </div>
    )
}