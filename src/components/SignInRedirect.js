// src/components/SignInRedirect.jsx
import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

const SignInRedirect = () => {
  const { instance } = useMsal();

  useEffect(() => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error("MSAL login redirect failed", e);
    });
  }, [instance]);

  return <p>Redirecting...</p>;
};

export default SignInRedirect;
