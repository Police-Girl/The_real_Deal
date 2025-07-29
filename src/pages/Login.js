import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

function Login() {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accounts.length > 0) {
      navigate("/home");
    }
  }, [accounts, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}?entity=users&action=validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();

      if (data.valid) {
        sessionStorage.setItem("account", JSON.stringify({ username: email }));
        navigate("/home");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.backdrop} />
      <div style={styles.overlay}>
        <div style={styles.headerRow}>
          <img src="/mioglogo.png" alt="Logo" style={styles.logo} />
          <span style={styles.titleText}>Welcome</span>
        </div>
        <p style={styles.subtitle}>Please sign in.</p>

        <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              required
              onChange={e => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter password"
              value={password}
              required
              onChange={e => setPassword(e.target.value)}
            />
  
          </Form.Group>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <div className="d-grid gap-2 mt-3">
            <Button
              variant="primary"
              size="lg"
              style={styles.button}
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    height: '100vh',
    backgroundImage: `url('/login.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    zIndex: 0,
  },

  overlay: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    width: '360px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },

  logo: {
    height: '36px',
    width: '36px', 
    marginRight: '10px',
    borderRadius: '50%',
    objectFit: 'cover', 
  },

  titleText: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#222',
  },

  subtitle: {
    fontSize: '16px',
    color: '#444',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#3b5675',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '15px',
  },

  errorMessage: {
    color: '#b00020',
    fontSize: '14px',
    marginTop: '10px',
    textAlign: 'center',
  },
};

export default Login;

