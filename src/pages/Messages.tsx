import React, { useEffect, useState } from "react";
import "../css/Messages.css"; // Ensure you have a Messages.css file for styling
import { db } from "../firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, doc, setDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";
import {
  MinChatUiProvider,
  MainContainer,
  MessageInput,
  MessageContainer,
  MessageList,
  MessageHeader
} from "@minchat/react-chat-ui";

// The main messaging page component
const Messages = () => {
  const [conversations, setConversations] = useState();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<null | any>(null);
  
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, [])

// Function to start a new conversation
  const startNewConversation = async (userIds: string[], usernames: string[]) => {
    // Create a new message thread
    const messageThreadRef = await addDoc(collection(db, "message_threads"), {
      createdAt: serverTimestamp(),
      userIds: usernames,
  });

  // Add or update conversations for each user
  userIds.forEach(async (userId, index) => {
    await setDoc(doc(db, "users", userId, "conversations", messageThreadRef.id), {
      username: usernames[index],
      userId: userId,
      lastMessage: {},
      lastMessageTimestamp: serverTimestamp(),
      messageThreadRef: doc(db, "message_threads", messageThreadRef.id),
    });
  });

  console.log("New conversation started with ID: ", messageThreadRef.id);
};

const fetchMessages = async (messageThreadId: string) => {
  const messagesRef = collection(db, "message_threads", messageThreadId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  const querySnapshot = await getDocs(q);
  const messages = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return messages;
};

const sendMessage = async (messageThreadId: string, senderId: string, text: string) => {
  await addDoc(collection(db, "message_threads", messageThreadId, "messages"), {
    senderId,
    text,
    timestamp: serverTimestamp(),
  });
};

  // Function to fetch all conversations for a given user
const fetchUserConversations = async (userId: string) => {
  const userConversationsRef = collection(db, "users", userId, "conversations");
  const q = query(userConversationsRef);

  const querySnapshot = await getDocs(q);
  const conversations: any = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Optionally, resolve the messageThreadRef to get the actual thread data
    // This example just includes the reference as-is
    conversations.push({
      username: data.username,
      userId: data.userId,
      lastMessageTimestamp: data.lastMessageTimestamp,
      messageThreadRef: data.messageThreadRef,
    });
  });

  setConversations(conversations);
};

useEffect(() => {
  if (user?.uid) {
    fetchUserConversations(user?.uid);
  }
}, [user])

useEffect(() => {
  const fetchAndSetMessages = async () => {
    setLoading(true);
    try {
      const fetchedMessages = await fetchMessages(selectedConversation?.messageThreadRef);
      setMessages(fetchedMessages);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  fetchAndSetMessages();
}, [selectedConversation?.messageThreadRef]); // Re-run this effect if messageThreadId changes

  return (
    <div className="messages-page">
      <MinChatUiProvider theme="#6ea9d7">
        <MainContainer style={{ height: '100vh' }}>
          <MessageContainer>
            <MessageHeader />
            <MessageList
              currentUserId='dan'
              messages={[{
                text: 'Hello',
                user: {
                  id: 'mark',
                  name: 'Markus',
                },
              }]}
            />
            <MessageInput showSendButton={false} placeholder={"Type message here"} />
          </MessageContainer>
        </MainContainer>
      </MinChatUiProvider>
    </div>
  );
};

export default Messages;
