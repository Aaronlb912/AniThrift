import React, { useState } from "react";
import "../css/faq.css";

const faqs = [
  {
    question: "How do I list an item?",
    answer:
      "To list an item, go to the Sell page and fill out the form with your item details.",
  },
  {
    question: "Is there a listing fee?",
    answer:
      "No, listing on Anithrift is free with no hidden fees. A percentage is taken only when an item sells.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Once your item sells, payment will be processed and transferred to your designated account.",
  },
  {
    question: "Can I list any item?",
    answer:
      "You can list most items, however, there are restrictions on certain types of goods. Please refer to our prohibited items list.",
  },
  {
    question: "What if my item doesn’t sell?",
    answer:
      "If your item does not sell, you can relist it. There are no fees for relisting items.",
  },
];

const FaqSection = () => {
  const [expanded, setExpanded] = useState(null);

  const toggleExpansion = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <div className="faq-section">
      <h2>Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <button
            className="faq-question"
            onClick={() => toggleExpansion(index)}
          >
            {faq.question}
          </button>
          <div
            className={`faq-answer ${expanded === index ? "open" : ""}`} // Apply the 'open' class conditionally
            style={{
              maxHeight: expanded === index ? "1000px" : "0", // Transition max-height
              padding: expanded === index ? "10px" : "0 10px", // Transition padding
            }}
          >
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqSection;
