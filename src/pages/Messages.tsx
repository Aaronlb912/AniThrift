import React, { useState } from "react";
import "../css/Messages.css"; // Ensure you have a Messages.css file for styling

// The component that lists conversations on the left
const ConversationTabs = ({ conversations, onSelectConversation }) => {
  return (
    <div className="conversation-tabs">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="conversation-tab"
          onClick={() => onSelectConversation(conversation.id)}
        >
          {conversation.name}
        </div>
      ))}
    </div>
  );
};

// The component that shows the selected conversation's messages
const ConversationDisplay = ({ conversationId }) => {
  if (!conversationId) {
    return <div className="conversation-display">Select a conversation</div>;
  }

  // Placeholder for actual messages. You'll replace this with your message fetching logic.
  return (
    <div className="conversation-display">
      Messages for conversation {conversationId}
      {/* Iterate over messages here */}
    </div>
  );
};

// The main messaging page component
const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Dummy data for conversations. Replace with actual data fetching logic.
  const conversations = [
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
    // Add more conversations as needed
  ];

  return (
    <div className="messages-page">
      <ConversationTabs
        conversations={conversations}
        onSelectConversation={setSelectedConversation}
      />
      <ConversationDisplay conversationId={selectedConversation} />
    </div>
  );
};

export default Messages;
