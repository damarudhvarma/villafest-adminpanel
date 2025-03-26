import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminAuth = ({ children }) => {
    
    const token = localStorage.getItem("Token");
    const navigate = useNavigate();

    useEffect(() => {

        if(!token){
            navigate("/login");
        }
    
    },[token])

   

  return (
    <>
      {children}
    </>
  )
}

export default AdminAuth