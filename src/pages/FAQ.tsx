import React, { useState } from "react";
import "../css/infoPages.css";

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "Click the 'Sign In' button in the header, then select 'Create Account' to register with your email address.",
    },
    {
      question: "How do I list an item for sale?",
      answer:
        "Click 'Sell' in the header or navigate to the listing page, then click 'Start Selling' to create your listing.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept major credit cards and other payment methods through our secure payment processor.",
    },
    {
      question: "How do I track my order?",
      answer:
        "Once your order ships, you'll receive a tracking number via email. You can also view tracking information in your Orders page.",
    },
    {
      question: "What is your return policy?",
      answer:
        "Return policies vary by seller. Please check the individual seller's return policy on the product page or contact them directly.",
    },
    {
      question: "How do I contact a seller?",
      answer:
        "You can message sellers directly through the 'Message Seller' button on product pages or from your orders page.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes, we use industry-standard encryption and secure payment processing to protect your information.",
    },
    {
      question: "How do I update my profile?",
      answer:
        "Go to your Profile page and click 'Edit Profile' to update your information, bio, and profile picture.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="info-page-container">
      <h1>Frequently Asked Questions</h1>
      <div className="info-content">
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span className="faq-icon">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
        <p className="faq-footer">
          Still have questions?{" "}
          <a href="/contact-us">Contact our support team</a> for assistance.
        </p>
      </div>
    </div>
  );
};

export default FAQ;

