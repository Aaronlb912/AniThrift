import React, { useEffect, useState, useCallback, useMemo } from "react";
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

  // Function to start a new conversation
  const startNewConversation = useCallback(
    async (otherUserId: string, otherUsername: string) => {
      if (!user?.uid) return null;

      // Check if conversation already exists
      const existingConv = await findExistingConversation(
        user.uid,
        otherUserId
      );
      if (existingConv) {
        return existingConv;
      }

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
    [user]
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
    async (userIdToBlock: string) => {
      if (!user?.uid || !userIdToBlock) return;

      try {
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

        if (selectedConversation?.userId === userIdToBlock) {
          await deleteConversation(
            selectedConversation.id,
            selectedConversation.messageThreadId
          );
        }

        if (selectedConversation?.messageThreadId) {
          await deleteDoc(
            doc(
              db,
              "users",
              userIdToBlock,
              "conversations",
              selectedConversation.messageThreadId
            )
          );
        }
      } catch (error) {
        console.error("Error blocking user:", error);
      }
    },
    [user, selectedConversation, deleteConversation]
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

  // Find existing conversation between two users
  const findExistingConversation = async (userId1: string, userId2: string) => {
    const user1ConvsRef = collection(db, "users", userId1, "conversations");
    const snapshot = await getDocs(user1ConvsRef);

    for (const convDoc of snapshot.docs) {
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
    return null;
  };

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

  // Listen to messages in real-time
  useEffect(() => {
    if (!selectedConversation?.messageThreadId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(
      db,
      "message_threads",
      selectedConversation.messageThreadId,
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
        .filter((msg): msg is Message => msg !== null); // Filter out null messages
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversation?.messageThreadId]);

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
                    <button
                      className="delete-conversation-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Are you sure you want to delete this conversation?"
                          )
                        ) {
                          deleteConversation(
                            selectedConversation.id,
                            selectedConversation.messageThreadId
                          );
                        }
                      }}
                      title="Delete conversation"
                    >
                      🗑️
                    </button>
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
                            blockUser(selectedConversation.userId);
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
                <MessageInput
                  onSendMessage={sendMessage}
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
