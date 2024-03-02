import React, { useState } from "react";
import { Link } from "react-router-dom";
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
      { text: "Sign-in and Security", path: "/settings/sign-in-security" },
      { text: "Addresses", path: "/settings/addresses" },
      { text: "Feedback", path: "/settings/feedback" },
      { text: "Request Your Data", path: "/settings/request-data" },
    ],
  },
  {
    title: "Payment Information",
    items: [
      { text: "Payments", path: "/settings/payments" },
      { text: "Stripe Account", path: "/settings/stripe-account" },
    ],
  },
  {
    title: "Account Preferences",
    items: [
      { text: "Permissions", path: "/settings/permissions" },
      { text: "Advertisement Preferences", path: "/settings/ad-preferences" },
      {
        text: "Communication Preferences",
        path: "/settings/communication-preferences",
      },
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
  {
    title: "History & Favorites",
    items: [
      { text: "Favorites", path: "/settings/favorites" },
      { text: "Settings", path: "/settings/settings" },
    ],
  },
];

const SidebarNavigation: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);

  const handleClick = (title: string) => {
    setOpen(open === title ? null : title);
  };

  return (
    <List component="nav" aria-label="profile settings">
      {sections.map((section, index) => (
        <React.Fragment key={index}>
          <ListItem button onClick={() => handleClick(section.title)}>
            <ListItemText primary={section.title} />
            {open === section.title ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open === section.title} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {section.items.map((item, itemIndex) => (
                <ListItem
                  button
                  component={Link}
                  to={item.path}
                  key={itemIndex}
                >
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Collapse>
          {index < sections.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default SidebarNavigation;
