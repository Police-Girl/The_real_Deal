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
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is already logged in, go to /home.
  useEffect(() => {
    if (accounts.length > 0) {
      navigate("/home");
    }
  }, [accounts, navigate]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Send to backend for validation
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}?entity=users&action=validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username }),
        }
      );
      if (!response.ok) {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }
      const data = await response.json();
      // Assume backend returns { valid: true, user: { ... } }
      if (data.valid) {
        // Store user info in sessionStorage (or context, as needed)
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
      <div style={styles.wrapper}>
        <div style={styles.title}>
          <span style={styles.titleText}>Welcome</span>
        </div>
        <p style={styles.subtitle}>Please sign in.</p>
        {/* <div className="d-grid gap-3" style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="lg"
            style={styles.button}
            onClick={handleLogin}
          >
            <BsMicrosoft style={styles.icon} />
            Sign in with Microsoft
          </Button>
        </div> */}
        <Form onSubmit={handleSubmit}>
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
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              required
              onChange={e => setUsername(e.target.value)}
            />
            <Form.Text className="text-muted">
              (Usually the same as your email)
            </Form.Text>
          </Form.Group>
          {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
          <div className="d-grid gap-3" style={styles.buttonContainer}>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
  },
  wrapper: {
    textAlign: 'center',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: '20px',
  },
  titleText: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '20px',
  },
  buttonContainer: {
    marginTop: '20px',
  },
  button: {
    fontSize: '16px',
    padding: '10px 50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: '10px',
  },
};

export default Login