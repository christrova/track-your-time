'use client'

import { createContext, useContext } from "react"


const DashboardContext = createContext<any>(null)

export function DashboardProvider({
children,
value
} : {
children : React.ReactNode,
value: any
}){

    return(
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    )
}

export const useDashboard = () => {
    const ctx = useContext(DashboardContext)
    if(!ctx){
        throw new Error("useDashboard must be used inside DashboardProvider")
    }
    return ctx
}

