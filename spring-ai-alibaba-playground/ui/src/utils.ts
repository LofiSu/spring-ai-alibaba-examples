import { message } from "antd";
import type { GetProp, UploadProps } from "antd";
import { ChatMessage, Message } from "./menuPages/ChatPage/types";
import { AiCapabilities } from "./stores/conversation.store";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

// 限制文件大小
export const litFileSize = (file: FileType, size: number) => {
  const isLt2M = file.size / 1024 / size < 1;
  if (!isLt2M) {
    message.error(`Image must smaller than ${size}KB!`);
  }
  return isLt2M;
};

export const decoder = new TextDecoder("utf-8");

// 创建AI请求参数
export const createAiRequestParams = (
  conversationId: string | undefined,
  modelValue: string | undefined,
  aiCapabilities: AiCapabilities,
  additionalParams: Record<string, any> = {}
) => {
  return {
    chatId: conversationId,
    model: modelValue,
    deepThink: aiCapabilities.deepThink,
    onlineSearch: aiCapabilities.onlineSearch,
    ...additionalParams,
  };
};

// 聊天持久化消息映射为UI表示
export const mapStoredMessagesToUIMessages = (
  messages: ChatMessage[]
): Message[] => {
  if (!messages || !Array.isArray(messages)) {
    console.warn("无效的消息数组:", messages);
    return [];
  }

  return (
    messages
      ?.filter((msg) => !msg.isLoading) // 过滤掉加载中的消息
      ?.map((msg) => {
        return {
          id: `msg-${msg.timestamp}`,
          text: msg.content || "",
          sender: msg.role === "user" ? "user" : "bot",
          timestamp: msg.timestamp,
        };
      }) ?? []
  );
};

export const createTagMerger = (startTag: string, endTag: string) => {
  const queue: { content: string }[] = [];
  let currentContent = "";
  let lastProcessedLength = 0;

  const tagMerger = (fullText: string) => {
    // 计算新增的部分
    const newPart = fullText.slice(lastProcessedLength);
    lastProcessedLength = fullText.length;

    // 如果遇到纯文本，说明标签区域结束，清空队列
    if (!newPart.includes(startTag) || !newPart.includes(endTag)) {
      if (currentContent) {
        queue.push({ content: currentContent });
        currentContent = "";
      }
      return newPart;
    }

    // 提取内容
    const content = newPart.replace(startTag, "").replace(endTag, "");

    // 合并内容
    currentContent += content;

    // null表示这个chunk已经被处理
    return null;
  };

  const getResult = () => {
    if (currentContent) {
      queue.push({ content: currentContent });
    }
    return queue
      .map(({ content }) => `${startTag}${content}${endTag}`)
      .join("");
  };

  return {
    tagMerger,
    getResult,
  };
};
