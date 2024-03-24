import React from "react";
import { Link } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import "../css/ProfileSettings.css"; // Adjust the path as necessary

const ProfileSettings = () => {
  return (
    <div className="profile-settings-container">
      <h2>Profile Settings</h2>
      <List component="nav" aria-label="profile settings">
        <h3>Personal Info</h3>
        <ListItem button component={Link} to="/settings/personal-information">
          <ListItemText primary="Personal Information" />
        </ListItem>
        <ListItem button component={Link} to="/settings/account-settings">
          <ListItemText primary="Sign-in and Security" />
        </ListItem>
        <ListItem button component={Link} to="/settings/addresses">
          <ListItemText primary="Addresses" />
        </ListItem>
        <ListItem button component={Link} to="/settings/feedback">
          <ListItemText primary="Feedback" />
        </ListItem>
        <ListItem button component={Link} to="/settings/request-data">
          <ListItemText primary="Request Your Data" />
        </ListItem>

        <Divider />

        <h3>Payment Information</h3>
        <ListItem button component={Link} to="/settings/payments">
          <ListItemText primary="Payments" />
        </ListItem>
        <ListItem button component={Link} to="/settings/stripe-account">
          <ListItemText primary="Stripe Account" />
        </ListItem>

        <Divider />

        <h3>Account Preferences</h3>
        <ListItem button component={Link} to="/settings/permissions">
          <ListItemText primary="Permissions" />
        </ListItem>
        <ListItem button component={Link} to="/settings/ad-preferences">
          <ListItemText primary="Advertisement Preferences" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/settings/communication-preferences"
        >
          <ListItemText primary="Communication Preferences" />
        </ListItem>
        <ListItem button component={Link} to="/settings/close-account">
          <ListItemText primary="Close Account" />
        </ListItem>

        <Divider />

        <h3>Selling</h3>
        <ListItem button component={Link} to="/settings/seller-dashboard">
          <ListItemText primary="Seller Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/settings/subscriptions">
          <ListItemText primary="Subscriptions" />
        </ListItem>
        <ListItem button component={Link} to="/settings/donation-preferences">
          <ListItemText primary="Donation Preferences" />
        </ListItem>
        <ListItem button component={Link} to="/settings/pending-donations">
          <ListItemText primary="Pending Donations" />
        </ListItem>
        <ListItem button component={Link} to="/settings/invoiced-donations">
          <ListItemText primary="Invoiced Donations" />
        </ListItem>

        <Divider />

        <h3>History & Favorites</h3>
        <ListItem button component={Link} to="/settings/favorites">
          <ListItemText primary="Favorites" />
        </ListItem>
        <ListItem button component={Link} to="/settings/settings">
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </div>
  );
};

export default ProfileSettings;
