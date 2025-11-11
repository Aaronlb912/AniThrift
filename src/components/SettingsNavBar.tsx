import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { List, ListItem, ListItemText, Collapse, Divider } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import "../css/SettingNav.css";

interface Section {
  title: string;
  items: Array<{
    text: string;
    path: string;
  }>;
}

const sections: Section[] = [
  {
    title: "Personal Info",
    items: [
      { text: "Personal Information", path: "/settings/personal-information" },
      { text: "Sign-in and Security", path: "/settings/account-settings" },
      { text: "Request Your Data", path: "/settings/request-data" },
    ],
  },
  {
    title: "Payment Information",
    items: [
      { text: "Stripe Account", path: "/settings/stripe-account" },
    ],
  },
  {
    title: "Account Preferences",
    items: [
      { text: "Permissions", path: "/settings/permissions" },
      { text: "Content Preferences", path: "/settings/content-preferences" },
      { text: "Advertisement Preferences", path: "/settings/ad-preferences" },
      {
        text: "Communication Preferences",
        path: "/settings/communication-preferences",
      },
      { text: "Blocked Users", path: "/settings/blocked-users" },
      { text: "Close Account", path: "/settings/close-account" },
    ],
  },
  {
    title: "Selling",
    items: [
      { text: "Seller Dashboard", path: "/settings/seller-dashboard" },
      { text: "Subscriptions", path: "/settings/subscriptions" },
      { text: "Donation Preferences", path: "/settings/donation-preferences" },
      { text: "Pending Donations", path: "/settings/pending-donations" },
      { text: "Invoiced Donations", path: "/settings/invoiced-donations" },
    ],
  },
];

const SidebarNavigation: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = useState<string | null>(() => {
    // Open the section that contains the current page
    const currentPath = location.pathname;
    for (const section of sections) {
      if (section.items.some((item) => item.path === currentPath)) {
        return section.title;
      }
    }
    return "Personal Info"; // Default to first section
  });

  const handleClick = (title: string) => {
    setOpen(open === title ? null : title);
  };

  return (
    <div className="settings-nav-container">
      <List component="nav" aria-label="profile settings">
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            <ListItem button onClick={() => handleClick(section.title)}>
              <ListItemText primary={section.title} />
              {open === section.title ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open === section.title} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {section.items.map((item, itemIndex) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <ListItem
                      button
                      component={Link}
                      to={item.path}
                      key={itemIndex}
                      className={isActive ? "active" : ""}
                      selected={isActive}
                    >
                      <ListItemText primary={item.text} />
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
            {index < sections.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </div>
  );
};

export default SidebarNavigation;
