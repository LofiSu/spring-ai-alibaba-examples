import React from "react";
import { theme } from "antd";
import { useStyle } from "./style";

interface RequestBubbleProps {
  content: string;
  timestamp: number;
}

const RequestBubble: React.FC<RequestBubbleProps> = ({
  content,
  timestamp,
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyle();

  return (
    <div className={styles.userMessage}>
      <div className={styles.messageSender}>You</div>
      <div className={styles.messageText}>{content}</div>
      <div className={styles.messageTime}>
        {new Date(timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default RequestBubble;
