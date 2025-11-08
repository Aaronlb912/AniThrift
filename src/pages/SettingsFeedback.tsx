import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsFeedback: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Feedback</h1>
      <div className="info-content">
        <p>
          We value your feedback! Your input helps us improve AniThrift.
        </p>
        <button
          className="primary-button"
          onClick={() => navigate("/feedback")}
        >
          Submit Feedback
        </button>
        <p>
          You can also provide feedback about specific features or report issues
          through our main feedback form.
        </p>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsFeedback;

