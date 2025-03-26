import React, { createContext,  useState } from 'react'

export const AdminContext= createContext();

export const AdminProvider= ({children})=>{
    const [Admin,setAdmin]= useState("");

    return(
        <AdminContext.Provider value={{Admin,setAdmin}}>
            {children}
        </AdminContext.Provider>
    )
};