import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';


const UserContext = createContext();


export const UserProvider = ({ children }) => {
  const { instance } = useMsal(); // Get the MSAL instance
  const [account, setAccount] = useState(null); // State to hold the account data

  // Step 3: Fetch the account when the component mounts or when the instance changes
  useEffect(() => {
    const accounts = instance.getAllAccounts(); // Get all accounts
    setAccount(accounts.length > 0 ? accounts[0] : null); // Set the first account (if it exists)
  }, [instance]);

  // Step 4: Provide the account data to all child components
  return (
    <UserContext.Provider value={{ account }}>
      {children}
    </UserContext.Provider>
  );
};

// Step 5: Create a custom hook to easily access the context
export const useUser = () => {
  return useContext(UserContext);
};