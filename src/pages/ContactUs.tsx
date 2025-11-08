import React, { useState } from "react";
import "../css/infoPages.css";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="info-page-container">
      <h1>Contact Us</h1>
      <div className="info-content">
        <p>
          Have a question or need assistance? Fill out the form below and we'll
          get back to you as soon as possible.
        </p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              required
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              required
              rows={6}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>
          <button type="submit" className="submit-button">
            Send Message
          </button>
        </form>
        <div className="contact-info">
          <h2>Other Ways to Reach Us</h2>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:support@anithrift.com">support@anithrift.com</a>
          </p>
          <p>
            <strong>Response Time:</strong> We typically respond within 24-48
            hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

