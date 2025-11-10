import React, { useEffect, useState, useCallback } from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../firebase-config";
import { getAuth } from "firebase/auth";

interface BlockedUser {
  uid: string;
  username: string;
  name: string;
  photoURL?: string;
}

const SettingsBlockedUsers: React.FC = () => {
  const auth = getAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlockedUsers = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setBlockedUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (!userDoc.exists()) {
        setBlockedUsers([]);
        setIsLoading(false);
        return;
      }

      const blockedIds: string[] = userDoc.data()?.blockedUsers || [];
      if (blockedIds.length === 0) {
        setBlockedUsers([]);
        setIsLoading(false);
        return;
      }

      const blockedProfiles = await Promise.all(
        blockedIds.map(async (uid) => {
          try {
            const profileSnap = await getDoc(doc(db, "users", uid));
            if (!profileSnap.exists()) {
              return {
                uid,
                username: "Unknown user",
                name: "Unknown",
              };
            }
            const data = profileSnap.data();
            return {
              uid,
              username: data.username || "Unknown user",
              name: data.name || data.username || "Unknown",
              photoURL: data.photoURL || "",
            };
          } catch (innerError) {
            console.error("Error loading blocked user profile:", innerError);
            return {
              uid,
              username: "Unknown user",
              name: "Unknown",
            };
          }
        })
      );

      setBlockedUsers(blockedProfiles);
    } catch (fetchError) {
      console.error("Error loading blocked users:", fetchError);
      setError("Unable to load blocked users right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  const handleUnblock = async (blockedUserId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayRemove(blockedUserId),
      });
      await updateDoc(doc(db, "users", blockedUserId), {
        blockedBy: arrayRemove(currentUser.uid),
      });

      setBlockedUsers((prev) =>
        prev.filter((user) => user.uid !== blockedUserId)
      );
    } catch (unblockError) {
      console.error("Error unblocking user:", unblockError);
      setError("We couldn't unblock that user right now. Please try again.");
    }
  };

  return (
    <MainLayout>
      <div className="info-page-container">
        <h1>Blocked Users</h1>
        <div className="info-content">
          <p>
            Manage the people you’ve blocked. Unblocking someone restores their
            ability to view your public profile and send you messages.
          </p>

          {error && <p className="error-message">{error}</p>}

          {isLoading ? (
            <p>Loading blocked users...</p>
          ) : blockedUsers.length === 0 ? (
            <p>You haven’t blocked anyone yet.</p>
          ) : (
            <ul className="blocked-users-list">
              {blockedUsers.map((blockedUser) => (
                <li key={blockedUser.uid} className="blocked-user-item">
                  <div className="blocked-user-info">
                    {blockedUser.photoURL ? (
                      <img
                        src={blockedUser.photoURL}
                        alt={blockedUser.username}
                      />
                    ) : (
                      <div className="blocked-user-fallback">
                        {blockedUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="blocked-user-name">{blockedUser.name}</p>
                      <p className="blocked-user-username">
                        @{blockedUser.username}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleUnblock(blockedUser.uid)}
                  >
                    Unblock
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsBlockedUsers;

