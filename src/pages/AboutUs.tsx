// AboutUsPage.tsx
import React from "react";
import "../css/AboutUs.css"; // Assume you have an accompanying CSS file for styling

const AboutUsPage: React.FC = () => {
  // Example function to simulate navigation (replace with your actual navigation logic)
  const navigateToItem = (itemId: string) => {
    console.log(`Navigating to item ${itemId}`);
    // navigate(`/item/${itemId}`); // Uncomment and use your actual navigation method
  };

  return (
    <div className="about-us-container">
      <h1>About Us</h1>

      {/* Our History Section */}
      <section>
        <h2>Our History</h2>
        <p>
          Describe the journey of your company. Highlight milestones and
          achievements.
        </p>
      </section>

      {/* Our Mission and Goals Section */}
      <section>
        <h2>Our Mission and Goals</h2>
        <p>
          Explain your company's mission and the goals you are striving towards.
        </p>
      </section>

      {/* Our Values Section */}
      <section>
        <h2>Our Values</h2>
        <ul>
          <li>Value 1: Description</li>
          <li>Value 2: Description</li>
          {/* Add more values as needed */}
        </ul>
      </section>

      {/* Meet the Team Section */}
      <section>
        <h2>Meet the Team</h2>
        <div className="team-profiles">
          {/* Iterate over team member data */}
          <div className="team-member">
            <img src="/path-to-image.jpg" alt="Team Member Name" />
            <h3>Team Member Name</h3>
            <p>Role and a fun fact or personal tidbit.</p>
          </div>
          {/* Add more team members as needed */}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section>
        <h2>Why Choose Us?</h2>
        <p>
          Explain what sets your company apart and why customers should choose
          you.
        </p>
      </section>

      {/* Call to Action */}
      <section>
        <h2>Get Involved</h2>
        <p>
          Encourage visitors to engage with your brand further, whether by
          signing up for a newsletter, exploring products, or following on
          social media.
        </p>
      </section>
    </div>
  );
};

export default AboutUsPage;
