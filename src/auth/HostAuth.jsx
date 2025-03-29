import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const HostAuth = ({ children }) => {
    
  const token = localStorage.getItem("HostToken");
  const navigate = useNavigate();

  useEffect(() => {

      if(!token){
          navigate("/host-login");
      }
  
  },[token])

 

return (
  <>
    {children}
  </>
)
}

export default HostAuth