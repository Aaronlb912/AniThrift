import React, { useState, useCallback } from "react";
import { getAuth } from "firebase/auth";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  AlertColor,
} from "@mui/material";

import "../css/Feedback.css";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const FeedbackForm: React.FC = React.memo(() => {
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to submit feedback");
      return;
    }

    const response = await fetch(
      "https://your-cloud-function-url/submitFeedback",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          category,
          feedback,
        }),
      }
    );

    if (response.ok) {
      setSnackbar({
        open: true,
        message: "Feedback submitted successfully",
        severity: "success",
      });
      setCategory("");
      setFeedback("");
    } else {
      setSnackbar({
        open: true,
        message: "Failed to submit feedback",
        severity: "error",
      });
    }
  }, [user, category, feedback]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <div className="feedback-form-container">
      <div className="feedback-form-box">
        <h2>Feedback</h2>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="website">Website</MenuItem>
              <MenuItem value="usability">Usability</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="content">Content</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Feedback"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            margin="normal"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary">
            Submit Feedback
          </Button>
        </form>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
});

FeedbackForm.displayName = "FeedbackForm";

export default FeedbackForm;
