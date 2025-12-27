import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="container">
      <Card className="card">
        <h2 className="login-title">Privacy Policy</h2>

        <h5>Your Data</h5>
        <p>
          We respect your privacy. Your personal data is securely stored and will
          never be shared with third parties.
        </p>

        <h5>Agreement</h5>
        <p>
          By using this app, you agree to our terms and conditions regarding data
          collection and security.
        </p>

        <h5>Contact</h5>
        <p>
          If you have any concerns, please contact our support team.
        </p>
        <p>
          Contact us at:{" "}
          <a href="mailto:support@mealtracker.com">ivosardzovski@hotmail.com</a>
        </p>

        <p>
          <small>Last updated: December 2025</small>
        </p>

        <Link to="/">
          <Button className="back-button" style={{ marginTop: "20px" }}>
            ← Back to Login
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;