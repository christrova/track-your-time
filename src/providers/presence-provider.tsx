// "use client";

// import { createContext, useContext } from "react";

// const PresenceContext = createContext<any>(null)

// export function PresenceProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {

//     const []

//     return(
//         <PresenceContext.Provider value {}>

//         </PresenceContext.Provider>

//     )
// }
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const PresenceContext = createContext<any>(null);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // realtime logic ici plus tard

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  return useContext(PresenceContext);
}
