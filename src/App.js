import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
// import { MsalProvider } from "@azure/msal-react";
// import { PublicClientApplication } from "@azure/msal-browser";
// import { msalConfig } from "./components/authConfig";
// import { msalInstance } from "./components/authConfig";
import Login from "./pages/Login";
import LandingPage from "./pages/Landingpage";
import Input from "./pages/Input";
// import SignInRedirect from "./components/SignInRedirect";
import DisciplinesManagement from "./pages/Disciplines";
import RedirectHandler from "./components/redirectHandler";
// import AuthGuard from "./components/AuthGuard";
import "./Resources/spinner.css"; 
import { UserProvider } from './pages/UserContext';
import EngagementsManagement from "./pages/Engagements";

// const pca = new PublicClientApplication(msalConfig);

const Spinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
  </div>
);

function App() {
  // const [isMsalInitialized, setIsMsalInitialized] = useState(false);

  // useEffect(() => {
  //   // pca.initialize()
  //   msalInstance.initialize()
  //     .then(() => setIsMsalInitialized(true))
  //     .catch(error => console.error("MSAL initialization error:", error));
  // }, []);

  // if (!isMsalInitialized) return <Spinner />;

  return (
    // <MsalProvider instance={pca}>
    // <MsalProvider instance={msalInstance}>
    <UserProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          {/* <Route path="/signin" element={<SignInRedirect />} /> */}
          <Route path="/home" element={<LandingPage />} />
          <Route path="/createconsultant" element={<Input />} />
          {/* <Route path="/consultants" element={<ConsultantsPage />} /> */}
          <Route path="/disciplines" element={<DisciplinesManagement />} />
          <Route path="/engagements" element={<EngagementsManagement />} />
          <Route path="/logout" element={<h2>Logging out...</h2>} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </UserProvider>
    // </MsalProvider>
  );
}

export default App;


