import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="container">
      <Card className="card">
        <h2 className="login-title">Login</h2>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </Form.Group>

          <Button type="submit" className="animated-button">
            Login
          </Button>

          <div className="links">
            <Link to="/privacy">Privacy Policy</Link> |{" "}
            <a
              href="https://www.youtube.com/watch?v=8XmyHiLkfhU"
              rel="noreferrer"
              target="_blank"
            >
              Forgot Password?
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
