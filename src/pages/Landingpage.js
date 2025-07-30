import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import "bootstrap/dist/css/bootstrap.min.css";
import iconView from "../Resources/iconview.png";
import iconCreate from "../Resources/iconcreate.png";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useMsal } from "@azure/msal-react";
import iconsuser from "../Resources/iconsuser.png";
import "../Resources/landingpg.css";
import { useUser } from "./UserContext";
import { useIsAuthenticated } from "@azure/msal-react";


const LandingPage = () => {
  const [consultants, setConsultants] = useState([]);
  const [disciplinesData, setDisciplinesData] = useState([]);
  const [totalConsultants, setTotalConsultants] = useState(0);
  const [totalDisciplines, setTotalDisciplines] = useState(0);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // const { instance } = useMsal();
  const { account } = useUser();

  const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
      if (isAuthenticated && !sessionStorage.getItem("hasRefreshed")) {
        sessionStorage.setItem("hasRefreshed", "true");
        window.location.reload();
      }
    }, [isAuthenticated]);



  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "X-USER-EMAIL": account && account.username ? account.username : ""
    };
  };


  useEffect(() => {
    if (!account) return;
  
    const fetchDisciplines = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}?entity=disciplines&action=read`,
          { headers: getAuthHeaders() }
        );
  
        // Redirect on 403 Forbidden
        if (response.status === 403) {
          // window.location.href = 'https://miog.ac.ke/';
          return;
        }
  
        // Handle other errors silently
        if (!response.ok) return;
  
        const data = await response.json();
        setDisciplinesData(data);
        setTotalDisciplines(data.length);
      } catch (err) {
        // Redirect on any error if needed
        // window.location.href = 'https://miog.ac.ke/';
      }
    };
  
    fetchDisciplines();
  }, [account]);
  
  // Similar modification for consultants fetch
  useEffect(() => {
    if (!account) return;
  
    const fetchConsultants = async () => {
      try {
      const response = await fetch(
        `${API_BASE_URL}?entity=consultants&action=read`,
        { headers: getAuthHeaders() }
      );
    
      // Redirect on 403 Forbidden
      if (response.status === 403) {
        console.log("Fetch failed: 403 Forbidden");
        // window.location.href = 'https://miog.ac.ke/';
        return;
      }
    
      if (!response.ok) {
        console.log(`Fetch failed: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      setConsultants(data);
      setTotalConsultants(data.length);
      } catch (err) {
      // console.log("Fetch failed with error:", err);
      // window.location.href = 'https://miog.ac.ke/';
      }
    };
    
    fetchConsultants();
  }, [account]);

  const handleLogout = () => {
    sessionStorage.removeItem("hasRefreshed");
    // instance.logoutRedirect();
  };

  return (
    <>
      <Navbar expand="lg" style={{ backgroundColor: "#1e73be" }} className="py-2">
        <Container fluid>
          <Navbar.Brand
            href="#home"
            className="me-auto"
            style={{ color: "#ffffff", fontWeight: "bold" }}
          >
            Consultant Management System
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="index.html#/home" style={{ color: "#ffffff", fontWeight: "500" }}>
                Home
              </Nav.Link>
              <Nav.Link href="index.html#/createconsultant" style={{ color: "#ffffff", fontWeight: "500" }}>
                Create Consultant
              </Nav.Link>
              <Nav.Link href="index.html#/engagements" style={{ color: "#ffffff", fontWeight: "500" }}>
                Engagement Management
              </Nav.Link>
              <NavDropdown title="" id="basic-nav-dropdown" alignRight>
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="" style={{ color: "#ffffff", fontWeight: "500" }}>
                <img
                  src={iconsuser}
                  alt="User Icon"
                  style={{ width: "20px", height: "20px" }}
                />
                <span className="ms-2">{account ? account.name : " log in"}</span>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="card-container" style={{ marginLeft: "15px" }}>
        <div className="custom-card">
          <Link to="/createconsultant">
            <img src={iconCreate} alt="Create Consultant" className="card-icon" />
            <h3>Create Consultant</h3>
            <p>Add new consultants</p>
          </Link>
        </div>

        <div className="custom-card">
          <Link to="/disciplines">
            <img src={iconView} alt="Manage Disciplines" className="card-icon" />
            <h3>Manage Specialties</h3>
            <p>Create or modify specialties</p>
            <i style={{ opacity: 0.5 }}>Total Specialties:</i> {totalDisciplines}
          </Link>
        </div>

        <div className="custom-card">
          <Link to="/engagements">
            <img src={iconView} alt="Manage Engagements" className="card-icon" />
            <h3>Manage Consultant Engagement</h3>
            <p>Create or modify consultant engagement</p>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
