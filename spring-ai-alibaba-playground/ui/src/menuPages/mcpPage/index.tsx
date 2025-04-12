import React from "react";
import { useParams } from "react-router-dom";
import McpConversationView from "./McpConversationView";
import McpLandingView from "./McpLandingView";

const McpPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();

  if (conversationId) {
    return <McpConversationView conversationId={conversationId} />;
  } else {
    return <McpLandingView />;
  }
};

export default McpPage;
