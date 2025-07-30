import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Check if the initialize method exists and call it.
        if (typeof instance.initialize === "function") {
          await instance.initialize();
          console.log("MSAL instance initialized.");
        }

        const response = await instance.handleRedirectPromise();
        if (response) {
          instance.setActiveAccount(response.account);
          console.log("Authentication successful:", response.account);
          navigate("/consultants"); 
        } else {
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            instance.setActiveAccount(accounts[0]);
            navigate("/home");
          } else {
            navigate("/home");
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        navigate("/login");
      }
    };

    handleRedirect();
  }, [instance, navigate]);

  return <div>Processing authentication...</div>;
};

export default Callback;
