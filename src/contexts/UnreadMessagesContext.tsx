import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

interface UnreadMessagesContextType {
  unreadCount: number;
  markConversationAsRead: (threadId: string) => Promise<void>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType>({
  unreadCount: 0,
  markConversationAsRead: async () => {},
});

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

export const UnreadMessagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  const calculateUnreadCount = useCallback(async (uid: string) => {
    try {
      // Get all user's conversations
      const conversationsRef = collection(db, "users", uid, "conversations");
      const conversationsSnapshot = await getDocs(conversationsRef);

      let totalUnread = 0;

      for (const convDoc of conversationsSnapshot.docs) {
        const convData = convDoc.data();
        const threadId = convData.messageThreadId;

        if (!threadId) continue;

        // Get last read timestamp from conversation document
        const lastReadTimestamp = convData.lastReadTimestamp;

        // Get messages from thread
        const messagesRef = collection(
          db,
          "message_threads",
          threadId,
          "messages"
        );
        const messagesSnapshot = await getDocs(messagesRef);

        let unreadInThread = 0;

        messagesSnapshot.forEach((msgDoc) => {
          const msgData = msgDoc.data();
          const msgTimestamp = msgData.timestamp;

          // Check if message is unread
          if (msgData.senderId !== uid) {
            // Message is from other user
            if (!lastReadTimestamp) {
              // No last read timestamp, all messages are unread
              unreadInThread++;
            } else if (msgTimestamp) {
              // Compare timestamps
              const msgTime = msgTimestamp.toMillis ? msgTimestamp.toMillis() : (msgTimestamp.seconds * 1000);
              const lastReadTime = lastReadTimestamp.toMillis ? lastReadTimestamp.toMillis() : (lastReadTimestamp.seconds * 1000);
              if (msgTime > lastReadTime) {
                unreadInThread++;
              }
            }
          }
        });

        totalUnread += unreadInThread;
      }

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error calculating unread count:", error);
      setUnreadCount(0);
    }
  }, []);

  // Listen to conversations and messages for real-time updates
  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const conversationsRef = collection(db, "users", userId, "conversations");
    const unsubscribe = onSnapshot(conversationsRef, async () => {
      await calculateUnreadCount(userId);
    });

    // Also set up listeners for message threads
    const threadListeners: (() => void)[] = [];

    const setupThreadListeners = async () => {
      const conversationsSnapshot = await getDocs(conversationsRef);
      
      conversationsSnapshot.forEach((convDoc) => {
        const convData = convDoc.data();
        const threadId = convData.messageThreadId;

        if (threadId) {
          const messagesRef = collection(
            db,
            "message_threads",
            threadId,
            "messages"
          );
          const unsubscribe = onSnapshot(messagesRef, async () => {
            await calculateUnreadCount(userId);
          });
          threadListeners.push(unsubscribe);
        }
      });
    };

    setupThreadListeners();

    return () => {
      unsubscribe();
      threadListeners.forEach((unsub) => unsub());
    };
  }, [userId, calculateUnreadCount]);

  const markConversationAsRead = useCallback(
    async (threadId: string) => {
      if (!userId || !threadId) return;

      try {
        // Find the conversation document
        const conversationsRef = collection(db, "users", userId, "conversations");
        const conversationsSnapshot = await getDocs(conversationsRef);

        for (const convDoc of conversationsSnapshot.docs) {
          const convData = convDoc.data();
          if (convData.messageThreadId === threadId) {
            // Update last read timestamp
            await updateDoc(convDoc.ref, {
              lastReadTimestamp: serverTimestamp(),
            });
            break;
          }
        }

        // Recalculate unread count
        await calculateUnreadCount(userId);
      } catch (error) {
        console.error("Error marking conversation as read:", error);
      }
    },
    [userId, calculateUnreadCount]
  );

  return (
    <UnreadMessagesContext.Provider
      value={{ unreadCount, markConversationAsRead }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

