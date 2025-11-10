import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase-config";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import MainLayout from "../components/MainLayout";
import "../css/EditProfile.css";

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    setUserId(currentUser.uid);

    const loadProfile = async () => {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || currentUser.displayName || "");
          setBio(data.bio || "");
          setPreviewImage(data.photoURL || currentUser.photoURL || null);
        } else {
          setUsername(currentUser.displayName || "");
          setPreviewImage(currentUser.photoURL || null);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        alert("We hit a snag loading your profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !auth.currentUser) return;

    setIsLoading(true);
    try {
      let imageUrl = previewImage || auth.currentUser.photoURL || null;
      if (selectedImage) {
        const imageRef = ref(
          storage,
          `profileImages/${userId}/${Date.now()}-${selectedImage.name}`
        );
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await updateProfile(auth.currentUser, {
        displayName: username.trim(),
        photoURL: imageUrl || undefined,
      });

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        username: username.trim(),
        photoURL: imageUrl || "",
        bio: bio.trim(),
      });

      alert("Your profile has been updated.");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Something went wrong saving your changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="edit-profile-container loading">Loading profile...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="edit-profile-container">
        <h1>Edit Profile</h1>
        <p className="edit-profile-subtitle">
          Update your storefront details so buyers know who they’re shopping
          with.
        </p>
        <form className="edit-profile-form" onSubmit={handleUpdateProfile}>
          <div className="form-columns">
            <div className="form-column">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={40}
                required
              />
              <span className="input-hint">
                This is the name customers see across the marketplace.
              </span>

              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={500}
                rows={6}
                placeholder="Share your store story, specialties, or what inspires your collections."
              />
            </div>

            <div className="form-column media-column">
              <label className="form-label">Profile Photo</label>
              <div className="photo-preview">
                {previewImage ? (
                  <img src={previewImage} alt="Profile preview" />
                ) : (
                  <div className="photo-placeholder">Add a personal touch</div>
                )}
              </div>
              <label className="upload-button">
                Upload New Photo
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>
              <span className="input-hint">
                Recommended: square image, at least 400x400px.
              </span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditProfile;
