import React, { createContext,  useState } from 'react'

export const HostContext= createContext();

export const HostProvider= ({children})=>{
    const [Host,setHost]= useState(null);

    return(
        <HostContext.Provider value={{Host,setHost}}>
            {children}
        </HostContext.Provider>
    )
};