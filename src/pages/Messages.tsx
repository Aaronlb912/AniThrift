import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "../css/Messages.css";
import { db } from "../firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MinChatUiProvider,
  MainContainer,
  MessageInput,
  MessageContainer,
  MessageList,
  MessageHeader,
  TypingIndicator,
} from "@minchat/react-chat-ui";

interface Conversation {
  id: string;
  username: string;
  userId: string;
  lastMessage?: {
    text: string;
    timestamp: any;
  };
  lastMessageTimestamp?: any;
  messageThreadId: string;
  otherUserPhotoURL?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
}

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);
  
  // Cache messages per thread to avoid reloading
  const messagesCache = useRef<Record<string, Message[]>>({});
  // Store active listeners to manage them properly
  const messageListeners = useRef<Record<string, () => void>>({});
  const typingListeners = useRef<Record<string, () => void>>({});

  // Ensure messages is always an array
  useEffect(() => {
    if (!Array.isArray(messages)) {
      setMessages([]);
    }
  }, [messages]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [blockedByUsers, setBlockedByUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<number | null>(null);
  const { userId: targetUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate("/signin");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Find existing conversation between two users
  const findExistingConversation = useCallback(async (userId1: string, userId2: string) => {
    // First, check user1's conversations
    const user1ConvsRef = collection(db, "users", userId1, "conversations");
    const user1Snapshot = await getDocs(user1ConvsRef);

    for (const convDoc of user1Snapshot.docs) {
      const convData = convDoc.data();
      if (convData.otherUserId === userId2) {
        const otherUserDoc = await getDoc(doc(db, "users", userId2));
        const otherUsername = otherUserDoc.data()?.username || "User";
        return {
          id: convDoc.id,
          username: otherUsername,
          userId: userId2,
          messageThreadId: convData.messageThreadId,
        };
      }
    }

    // Also check message_threads collection directly for threads with these participants
    // This prevents race conditions where conversations might exist but not be found in user's collection
    const threadsRef = collection(db, "message_threads");
    const threadsSnapshot = await getDocs(threadsRef);
    
    for (const threadDoc of threadsSnapshot.docs) {
      const threadData = threadDoc.data();
      const participants = threadData.participants || [];
      
      // Check if both users are in the participants array
      if (
        participants.includes(userId1) &&
        participants.includes(userId2) &&
        participants.length === 2
      ) {
        // Found existing thread, now check if conversation exists in user's collection
        const threadId = threadDoc.id;
        const user1ConvRef = doc(db, "users", userId1, "conversations", threadId);
        const user1ConvSnap = await getDoc(user1ConvRef);
        
        if (user1ConvSnap.exists()) {
          const convData = user1ConvSnap.data();
          const otherUserDoc = await getDoc(doc(db, "users", userId2));
          const otherUsername = otherUserDoc.data()?.username || "User";
          return {
            id: threadId,
            username: otherUsername,
            userId: userId2,
            messageThreadId: threadId,
          };
        } else {
          // Thread exists but conversation doc is missing, recreate it
          const otherUserDoc = await getDoc(doc(db, "users", userId2));
          const otherUsername = otherUserDoc.data()?.username || "User";
          const currentUserDoc = await getDoc(doc(db, "users", userId1));
          const currentUsername = currentUserDoc.data()?.username || "User";
          
          // Recreate conversation documents for both users
          await setDoc(doc(db, "users", userId1, "conversations", threadId), {
            otherUserId: userId2,
            otherUsername: otherUsername,
            messageThreadId: threadId,
            lastMessageTimestamp: threadData.createdAt || serverTimestamp(),
          });
          
          await setDoc(doc(db, "users", userId2, "conversations", threadId), {
            otherUserId: userId1,
            otherUsername: currentUsername,
            messageThreadId: threadId,
            lastMessageTimestamp: threadData.createdAt || serverTimestamp(),
          });
          
          return {
            id: threadId,
            username: otherUsername,
            userId: userId2,
            messageThreadId: threadId,
          };
        }
      }
    }
    
    return null;
  }, []);

  // Function to start a new conversation
  const startNewConversation = useCallback(
    async (otherUserId: string, otherUsername: string) => {
      if (!user?.uid) return null;

      // Check if conversation already exists (with improved checking)
      const existingConv = await findExistingConversation(
        user.uid,
        otherUserId
      );
      if (existingConv) {
        return existingConv;
      }

      // Double-check by querying message_threads with a where clause to prevent race conditions
      const threadsRef = collection(db, "message_threads");
      const threadsSnapshot = await getDocs(threadsRef);
      
      // Check for existing thread with these exact participants
      for (const threadDoc of threadsSnapshot.docs) {
        const threadData = threadDoc.data();
        const participants = threadData.participants || [];
        
        if (
          participants.includes(user.uid) &&
          participants.includes(otherUserId) &&
          participants.length === 2
        ) {
          // Found existing thread, return it
          const threadId = threadDoc.id;
          const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
          const otherUsernameFromDoc = otherUserDoc.data()?.username || otherUsername;
          const currentUserDoc = await getDoc(doc(db, "users", user.uid));
          const currentUsername = currentUserDoc.data()?.username || "User";
          
          // Ensure conversation documents exist
          const user1ConvRef = doc(db, "users", user.uid, "conversations", threadId);
          const user1ConvSnap = await getDoc(user1ConvRef);
          
          if (!user1ConvSnap.exists()) {
            await setDoc(user1ConvRef, {
              otherUserId: otherUserId,
              otherUsername: otherUsernameFromDoc,
              messageThreadId: threadId,
              lastMessageTimestamp: threadData.createdAt || serverTimestamp(),
            });
          }
          
          const user2ConvRef = doc(db, "users", otherUserId, "conversations", threadId);
          const user2ConvSnap = await getDoc(user2ConvRef);
          
          if (!user2ConvSnap.exists()) {
            await setDoc(user2ConvRef, {
              otherUserId: user.uid,
              otherUsername: currentUsername,
              messageThreadId: threadId,
              lastMessageTimestamp: threadData.createdAt || serverTimestamp(),
            });
          }
          
          return {
            id: threadId,
            username: otherUsernameFromDoc,
            userId: otherUserId,
            messageThreadId: threadId,
          };
        }
      }

      // No existing conversation found, create a new one
      // Get current user's username
      const currentUserDoc = await getDoc(doc(db, "users", user.uid));
      const currentUsername = currentUserDoc.data()?.username || "User";

      // Create a new message thread
      const messageThreadRef = await addDoc(collection(db, "message_threads"), {
        createdAt: serverTimestamp(),
        participants: [user.uid, otherUserId],
        participantUsernames: [currentUsername, otherUsername],
      });

      const threadId = messageThreadRef.id;

      // Add conversation for current user
      await setDoc(doc(db, "users", user.uid, "conversations", threadId), {
        otherUserId: otherUserId,
        otherUsername: otherUsername,
        messageThreadId: threadId,
        lastMessageTimestamp: serverTimestamp(),
      });

      // Add conversation for other user
      await setDoc(doc(db, "users", otherUserId, "conversations", threadId), {
        otherUserId: user.uid,
        otherUsername: currentUsername,
        messageThreadId: threadId,
        lastMessageTimestamp: serverTimestamp(),
      });

      return {
        id: threadId,
        username: otherUsername,
        userId: otherUserId,
        messageThreadId: threadId,
      };
    },
    [user, findExistingConversation]
  );

  // Fetch blocked users
  const fetchBlockedUsers = useCallback(async (userId: string) => {
    if (!userId) return;

    try {
      const blockedUsersRef = doc(db, "users", userId);
      const blockedUsersSnap = await getDoc(blockedUsersRef);
      if (blockedUsersSnap.exists()) {
        const data = blockedUsersSnap.data();
        setBlockedUsers(data.blockedUsers || []);
        setBlockedByUsers(data.blockedBy || []);
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  }, []);

  const updateTypingStatus = useCallback(
    async (threadId: string, userId: string, isTyping: boolean) => {
      if (!threadId || !userId) return;
      try {
        await updateDoc(doc(db, "message_threads", threadId), {
          [`typingStatus.${userId}`]: isTyping,
          typingUpdatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    },
    []
  );

  // Delete conversation
  const deleteConversation = useCallback(
    async (conversationId: string, messageThreadId: string) => {
      if (!user?.uid) return;

      try {
        // Delete conversation from user's conversations subcollection
        await deleteDoc(
          doc(db, "users", user.uid, "conversations", conversationId)
        );

        // Clear selected conversation if it's the one being deleted
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    },
    [user, selectedConversation]
  );

  // Block a user
  const blockUser = useCallback(
    async (conversation: Conversation) => {
      if (!user?.uid || !conversation?.userId) return;

      try {
        const userIdToBlock = conversation.userId;
        const userRef = doc(db, "users", user.uid);
        const blockedUserRef = doc(db, "users", userIdToBlock);

        await updateDoc(userRef, {
          blockedUsers: arrayUnion(userIdToBlock),
        });

        await updateDoc(blockedUserRef, {
          blockedBy: arrayUnion(user.uid),
        });

        setBlockedUsers((prev) =>
          Array.from(new Set([...prev, userIdToBlock]))
        );
        setBlockedByUsers((prev) => prev);

        // Stop typing status when blocking
        if (conversation.messageThreadId) {
          await updateTypingStatus(conversation.messageThreadId, user.uid, false);
          await updateTypingStatus(
            conversation.messageThreadId,
            userIdToBlock,
            false
          );
        }
      } catch (error) {
        console.error("Error blocking user:", error);
      }
    },
    [user, updateTypingStatus]
  );

  // Unblock a user
  const unblockUser = useCallback(
    async (userIdToUnblock: string) => {
      if (!user?.uid || !userIdToUnblock) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const updatedBlocked = blockedUsers.filter(
          (id) => id !== userIdToUnblock
        );

        await updateDoc(userRef, {
          blockedUsers: updatedBlocked,
        });

        const blockedUserRef = doc(db, "users", userIdToUnblock);
        await updateDoc(blockedUserRef, {
          blockedBy: arrayRemove(user.uid),
        });

        setBlockedUsers(updatedBlocked);
        setBlockedByUsers((prev) =>
          prev.filter((id) => id !== userIdToUnblock)
        );
      } catch (error) {
        console.error("Error unblocking user:", error);
      }
    },
    [user, blockedUsers]
  );


  // Fetch user conversations
  const fetchUserConversations = useCallback(
    (userId: string) => {
      if (!userId) return () => {}; // Return empty function if no userId

      const userConversationsRef = collection(
        db,
        "users",
        userId,
        "conversations"
      );
      const q = query(
        userConversationsRef,
        orderBy("lastMessageTimestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const convs: Conversation[] = [];

        for (const convDoc of snapshot.docs) {
          const data = convDoc.data();

          // Skip if user is blocked
          if (
            blockedUsers.includes(data.otherUserId) ||
            blockedByUsers.includes(data.otherUserId)
          ) {
            continue;
          }

          // Get other user's photo if available
          let otherUserPhotoURL = null;
          try {
            const otherUserDoc = await getDoc(
              doc(db, "users", data.otherUserId)
            );
            otherUserPhotoURL = otherUserDoc.data()?.photoURL || null;
          } catch (e) {
            console.error("Error fetching user photo:", e);
          }

          // Get last message
          let lastMessage: { text: string; timestamp: any } | undefined;
          if (data.messageThreadId) {
            try {
              const messagesRef = collection(
                db,
                "message_threads",
                data.messageThreadId,
                "messages"
              );
              const messagesQuery = query(
                messagesRef,
                orderBy("timestamp", "desc"),
                limit(1)
              );
              const messagesSnapshot = await getDocs(messagesQuery);
              if (!messagesSnapshot.empty) {
                const lastMsg = messagesSnapshot.docs[0].data();
                lastMessage = {
                  text: lastMsg.text || "",
                  timestamp: lastMsg.timestamp,
                };
              }
            } catch (e) {
              console.error("Error fetching last message:", e);
            }
          }

          convs.push({
            id: convDoc.id,
            username: data.otherUsername || "User",
            userId: data.otherUserId,
            messageThreadId: data.messageThreadId,
            lastMessage,
            lastMessageTimestamp: data.lastMessageTimestamp,
            otherUserPhotoURL,
          });
        }

        setConversations(convs);
        setLoading(false);
      });

      return unsubscribe;
    },
    [blockedUsers, blockedByUsers]
  );

  // Listen to messages in real-time with caching
  useEffect(() => {
    if (!selectedConversation?.messageThreadId) {
      setMessages([]);
      setIsOtherTyping(false);
      return;
    }

    const threadId = selectedConversation.messageThreadId;

    // If we have cached messages, set them immediately
    if (messagesCache.current[threadId]) {
      setMessages(messagesCache.current[threadId]);
    } else {
      setMessages([]);
    }

    // Only create a new listener if one doesn't exist for this thread
    if (!messageListeners.current[threadId]) {
      const messagesRef = collection(
        db,
        "message_threads",
        threadId,
        "messages"
      );
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: Message[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (!doc.id || !data) {
              return null;
            }
            return {
              id: doc.id,
              text: data.text || "",
              senderId: data.senderId || "",
              timestamp: data.timestamp,
            };
          })
          .filter((msg): msg is Message => msg !== null);
        
        // Cache the messages
        messagesCache.current[threadId] = msgs;
        
        // Only update state if this is the currently selected conversation
        if (selectedConversation?.messageThreadId === threadId) {
          setMessages(msgs);
        }
      });

      messageListeners.current[threadId] = unsubscribe;
    }

    // Cleanup: only remove listener if component unmounts, not when switching conversations
    return () => {
      // Don't clean up here - we want to keep listeners active
      // They'll be cleaned up on component unmount
    };
  }, [selectedConversation?.messageThreadId]);

  useEffect(() => {
    if (!selectedConversation?.messageThreadId) {
      setIsOtherTyping(false);
      return;
    }

    const threadId = selectedConversation.messageThreadId;

    // Only create a new typing listener if one doesn't exist for this thread
    if (!typingListeners.current[threadId]) {
      const threadRef = doc(db, "message_threads", threadId);
      const unsubscribe = onSnapshot(threadRef, (snapshot) => {
        const data = snapshot.data();
        const typingStatus = data?.typingStatus || {};
        // Only update if this is still the selected conversation
        if (selectedConversation?.messageThreadId === threadId && selectedConversation?.userId) {
          setIsOtherTyping(Boolean(typingStatus[selectedConversation.userId]));
        }
      });

      typingListeners.current[threadId] = unsubscribe;
    } else {
      // Update typing status immediately for the current conversation
      const threadRef = doc(db, "message_threads", threadId);
      getDoc(threadRef).then((snapshot) => {
        const data = snapshot.data();
        const typingStatus = data?.typingStatus || {};
        // Only update if this is still the selected conversation
        if (selectedConversation?.messageThreadId === threadId) {
          if (selectedConversation?.userId) {
            setIsOtherTyping(Boolean(typingStatus[selectedConversation.userId]));
          } else {
            setIsOtherTyping(false);
          }
        }
      });
    }

    return () => {
      // Don't clean up here - keep listeners active
    };
  }, [selectedConversation?.messageThreadId, selectedConversation?.userId]);

  // Cleanup all listeners and typing status on unmount
  useEffect(() => {
    return () => {
      // Clean up all message listeners
      Object.values(messageListeners.current).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
      messageListeners.current = {};

      // Clean up all typing listeners
      Object.values(typingListeners.current).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
      typingListeners.current = {};

      // Clear typing status for all active threads
      if (user?.uid) {
        Object.keys(messagesCache.current).forEach((threadId) => {
          updateTypingStatus(threadId, user.uid, false);
        });
      }
    };
  }, [user?.uid, updateTypingStatus]);

  // Fetch blocked users when user is set
  useEffect(() => {
    if (user?.uid) {
      fetchBlockedUsers(user.uid);
    }
  }, [user, fetchBlockedUsers]);

  // Fetch conversations when user is set
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = fetchUserConversations(user.uid);
      return () => {
        if (unsubscribe && typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    }
  }, [user, fetchUserConversations]);

  // Handle starting conversation from URL param
  useEffect(() => {
    if (targetUserId && user?.uid && targetUserId !== user.uid) {
      // Check if user is blocked
      if (blockedUsers.includes(targetUserId)) {
        alert("You cannot message this user. They have been blocked.");
        navigate("/messages");
        return;
      }

      if (blockedByUsers.includes(targetUserId)) {
        alert("This user has blocked you. You cannot message them.");
        navigate("/messages");
        return;
      }

      const startConv = async () => {
        try {
          const otherUserDoc = await getDoc(doc(db, "users", targetUserId));
          if (otherUserDoc.exists()) {
            const otherUsername = otherUserDoc.data()?.username || "User";
            const newConv = await startNewConversation(
              targetUserId,
              otherUsername
            );
            if (newConv) {
              setSelectedConversation(newConv as Conversation);
            }
          }
        } catch (error) {
          console.error("Error starting conversation:", error);
        }
      };
      startConv();
    }
  }, [
    targetUserId,
    user,
    startNewConversation,
    blockedUsers,
    blockedByUsers,
    navigate,
  ]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      if (
        !selectedConversation?.messageThreadId ||
        !user?.uid ||
        !text.trim()
      ) {
        return;
      }

      // Check if user is blocked
      if (blockedUsers.includes(selectedConversation.userId)) {
        alert("You cannot message this user. They have been blocked.");
        return;
      }

      if (blockedByUsers.includes(selectedConversation.userId)) {
        alert("This user has blocked you. You cannot send messages to them.");
        return;
      }

      // Check if we have item info from navigation state (from orders page)
      const itemInfo = location.state as {
        itemTitle?: string;
        itemId?: string;
        orderId?: string;
      } | null;
      let messageText = text.trim();

      // If this is a new conversation and we have item info, prepend context
      if (itemInfo && itemInfo.itemTitle && messages.length === 0) {
        messageText = `Regarding my order for "${itemInfo.itemTitle}" (Order #${
          itemInfo.orderId || "N/A"
        }): ${messageText}`;
      }

      try {
        await addDoc(
          collection(
            db,
            "message_threads",
            selectedConversation.messageThreadId,
            "messages"
          ),
          {
            senderId: user.uid,
            text: messageText,
            timestamp: serverTimestamp(),
          }
        );

        // Update last message timestamp for both users
        const currentUserDoc = await getDoc(doc(db, "users", user.uid));
        const currentUsername = currentUserDoc.data()?.username || "User";

        await setDoc(
          doc(
            db,
            "users",
            user.uid,
            "conversations",
            selectedConversation.messageThreadId
          ),
          {
            otherUserId: selectedConversation.userId,
            otherUsername: selectedConversation.username,
            messageThreadId: selectedConversation.messageThreadId,
            lastMessageTimestamp: serverTimestamp(),
          },
          { merge: true }
        );

        await setDoc(
          doc(
            db,
            "users",
            selectedConversation.userId,
            "conversations",
            selectedConversation.messageThreadId
          ),
          {
            otherUserId: user.uid,
            otherUsername: currentUsername,
            messageThreadId: selectedConversation.messageThreadId,
            lastMessageTimestamp: serverTimestamp(),
          },
          { merge: true }
        );

        await updateTypingStatus(
          selectedConversation.messageThreadId,
          user.uid,
          false
        );
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [
      selectedConversation,
      user,
      messages.length,
      location.state,
      blockedUsers,
      blockedByUsers,
      updateTypingStatus,
    ]
  );

  // Format messages for MinChat
  const formatMessagesForMinChat = useCallback(
    (msgs: Message[] | undefined | null, currentUserId?: string): any[] => {
      if (!msgs || !Array.isArray(msgs) || !currentUserId) {
        return [];
      }
      try {
        const normalizedCurrentUserId = currentUserId.toLowerCase();
        return msgs
          .filter((msg) => {
            // Strict validation: ensure msg exists and has required properties
            return (
              msg &&
              typeof msg === "object" &&
              msg.id &&
              typeof msg.id === "string" &&
              msg.senderId &&
              typeof msg.senderId === "string"
            );
          })
          .map((msg) => {
            const timestamp =
              msg.timestamp?.toMillis?.() ||
              (msg.timestamp?.seconds ? msg.timestamp.seconds * 1000 : null) ||
              Date.now();

            const safeId = msg.id
              ? String(msg.id)
              : `${timestamp}-${msg.senderId || "unknown"}`;
            const safeSenderId = String(
              msg.senderId || "unknown"
            ).toLowerCase();

            return {
              id: safeId,
              text: String(msg.text || ""),
              createdAt: timestamp,
              user: {
                id: safeSenderId || "unknown",
                username: safeSenderId || "unknown",
              },
              direction:
                safeSenderId === normalizedCurrentUserId
                  ? "outgoing"
                  : "incoming",
              seen: false,
              loading: false,
            };
          });
      } catch (error) {
        console.error("Error formatting messages for MinChat:", error);
        return [];
      }
    },
    []
  );

  // Memoize formatted messages to prevent unnecessary re-renders
  const formattedMessages = useMemo(() => {
    const safeMessages = formatMessagesForMinChat(messages, user?.uid || "");
    const filtered = Array.isArray(safeMessages)
      ? safeMessages.filter((msg) => msg && msg.id && msg.user?.id)
      : [];
    return filtered;
  }, [messages, formatMessagesForMinChat, user?.uid]);

  const handleStartTyping = useCallback(() => {
    if (
      !selectedConversation?.messageThreadId ||
      !user?.uid ||
      blockedUsers.includes(selectedConversation.userId) ||
      blockedByUsers.includes(selectedConversation.userId)
    ) {
      return;
    }

    const threadId = selectedConversation.messageThreadId;
    const currentUserId = user.uid;

    updateTypingStatus(threadId, currentUserId, true);

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      updateTypingStatus(threadId, currentUserId, false);
      typingTimeoutRef.current = null;
    }, 5000);
  }, [
    selectedConversation,
    user,
    blockedUsers,
    blockedByUsers,
    updateTypingStatus,
  ]);

  const handleEndTyping = useCallback(() => {
    if (!selectedConversation?.messageThreadId || !user?.uid) {
      return;
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    updateTypingStatus(selectedConversation.messageThreadId, user.uid, false);
  }, [selectedConversation?.messageThreadId, updateTypingStatus, user?.uid]);

  if (!user) {
    return <div>Please sign in to view messages.</div>;
  }

  return (
    <div className="messages-page">
      <div className="conversations-sidebar">
        <h2>Conversations</h2>
        {loading ? (
          <div>Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="no-conversations">
            No conversations yet. Start chatting!
          </div>
        ) : (
          <ul className="conversation-list">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                className={`conversation-item ${
                  selectedConversation?.id === conversation.id ? "active" : ""
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {conversation.otherUserPhotoURL ? (
                    <img
                      src={conversation.otherUserPhotoURL}
                      alt={conversation.username}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {conversation.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-username">
                    {conversation.username}
                  </div>
                  {conversation.lastMessage && (
                    <div className="conversation-preview">
                      {conversation.lastMessage.text}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="messages-main">
        {selectedConversation ? (
          <MinChatUiProvider>
            <MainContainer style={{ height: "100%" }}>
              <MessageContainer>
                <div className="message-header-wrapper">
                  <MessageHeader
                    {...({
                      title: selectedConversation.username,
                      avatar: selectedConversation.otherUserPhotoURL,
                    } as any)}
                  />
                  <div className="conversation-actions">
                    {blockedUsers.includes(selectedConversation.userId) ? (
                      <button
                        className="unblock-user-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `Are you sure you want to unblock ${selectedConversation.username}?`
                            )
                          ) {
                            unblockUser(selectedConversation.userId);
                          }
                        }}
                        title="Unblock user"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        className="block-user-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `Are you sure you want to block ${selectedConversation.username}? This will delete your conversation with them.`
                            )
                          ) {
                            blockUser(selectedConversation);
                          }
                        }}
                        title="Block user"
                      >
                        Block
                      </button>
                    )}
                  </div>
                </div>
                <MessageList
                  messages={
                    Array.isArray(formattedMessages)
                      ? formattedMessages.filter((msg) => msg && msg.user?.id)
                      : []
                  }
                  currentUserId={user.uid.toLowerCase()}
                />
                {isOtherTyping && (
                  <div className="typing-indicator-wrapper">
                    <TypingIndicator
                      content={`${selectedConversation.username} is typing...`}
                    />
                  </div>
                )}
                <MessageInput
                  onSendMessage={sendMessage}
                  showAttachButton={false}
                  onStartTyping={handleStartTyping}
                  onEndTyping={handleEndTyping}
                  showSendButton={true}
                  placeholder={
                    location.state && (location.state as any).itemTitle
                      ? `Message about "${
                          (location.state as any).itemTitle
                        }"...`
                      : "Type message here..."
                  }
                />
              </MessageContainer>
            </MainContainer>
          </MinChatUiProvider>
        ) : (
          <div className="no-conversation-selected">
            <h3>Select a conversation to start messaging</h3>
            <p>Or start a new conversation from a user's profile</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
