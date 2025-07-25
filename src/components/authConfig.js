import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "2ba3f71e-e7b2-40c5-b333-626adb64e153", 
    authority: "https://login.microsoftonline.com/334e13ff-4395-4fb1-8769-638205278c36", 
    redirectUri: "https://miogconsultancy.kpc.co.ke/index.html",
    postLogoutRedirectUri: "https://miogconsultancy.kpc.co.ke/",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        // console.log("MSAL Log:", message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Info,
    },
  },
  
};

export const msalInstance = new PublicClientApplication(msalConfig);
export const loginRequest = {
  scopes: ["openid", "profile","User.Read"],
};