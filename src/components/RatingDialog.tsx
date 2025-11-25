import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import "../css/RatingDialog.css";

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  onRate: (rating: number, review?: string) => void;
  sellerName: string;
  itemName: string;
  alreadyRated?: boolean;
  existingRating?: number;
  existingReview?: string;
}

const RatingDialog: React.FC<RatingDialogProps> = ({
  open,
  onClose,
  onRate,
  sellerName,
  itemName,
  alreadyRated = false,
  existingRating = 0,
  existingReview = "",
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(existingRating || 0);
  const [reviewText, setReviewText] = useState(existingReview || "");

  const handleStarClick = (rating: number) => {
    if (!alreadyRated) {
      setSelectedRating(rating);
    }
  };

  const handleSubmit = () => {
    if (selectedRating > 0 && !alreadyRated) {
      onRate(selectedRating, reviewText.trim() || undefined);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedRating(existingRating || 0);
    setHoveredStar(0);
    setReviewText(existingReview || "");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {alreadyRated ? "Your Rating" : "Rate Seller"}
      </DialogTitle>
      <DialogContent>
        <div className="rating-dialog-content">
          <Typography variant="body1" className="rating-item-name">
            Item: {itemName}
          </Typography>
          <Typography variant="body1" className="rating-seller-name">
            Seller: {sellerName}
          </Typography>
          {alreadyRated && (
            <Typography variant="body2" className="already-rated-message">
              You have already rated this seller
            </Typography>
          )}
          <div className="star-rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star-icon ${!alreadyRated ? "clickable" : ""}`}
                onMouseEnter={() => !alreadyRated && setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleStarClick(star)}
              >
                {star <= (hoveredStar || selectedRating) ? (
                  <StarIcon className="filled-star" />
                ) : (
                  <StarBorderIcon className="empty-star" />
                )}
              </span>
            ))}
          </div>
          {selectedRating > 0 && (
            <Typography variant="body2" className="rating-text">
              {selectedRating} out of 5 stars
            </Typography>
          )}
          {!alreadyRated && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Write a review (optional)"
              placeholder="Share your experience with this seller..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              variant="outlined"
              className="review-text-field"
              inputProps={{ maxLength: 1000 }}
              helperText={`${reviewText.length}/1000 characters`}
            />
          )}
          {alreadyRated && existingReview && (
            <div className="existing-review">
              <Typography variant="body2" className="review-label">
                Your Review:
              </Typography>
              <Typography variant="body2" className="review-text">
                {existingReview}
              </Typography>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          {alreadyRated ? "Close" : "Cancel"}
        </Button>
        {!alreadyRated && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={selectedRating === 0}
          >
            Submit Rating
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog;

