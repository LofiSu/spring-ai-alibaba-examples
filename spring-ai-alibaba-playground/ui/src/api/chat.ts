import { BASE_URL } from "../constant";

interface ChatParams {
  model?: string;
  chatId?: string;
  deepThink?: boolean;
  onlineSearch?: boolean;
}

export const getChat = async (
  prompt: string,
  callback?: (value: Uint8Array) => void,
  params?: ChatParams
): Promise<Response> => {
  const { model, chatId, onlineSearch, deepThink } = params || {};

  let res: Response;
  if (onlineSearch) {
    console.log("onlineSearch", onlineSearch);
    res = await fetch(BASE_URL + "/search?query=" + prompt, {
      method: "GET",
      headers: {
        model: model || "",
        chatId: chatId || "",
      },
    });
    console.log("联网搜索响应状态:", res.status, res.statusText);
  } else if (deepThink) {
    res = await fetch(BASE_URL + "/deep-thinking/chat?prompt=" + prompt, {
      method: "GET",
      headers: {
        // model: model || "",
        chatId: chatId || "",
      },
    });
  } else {
    res = await fetch(BASE_URL + "/chat?prompt=" + prompt, {
      method: "GET",
      headers: {
        model: model || "",
        chatId: chatId || "",
      },
    });
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response reader");
  }

  console.log("reader", reader);
  await reader.read().then(function process({ done, value }) {
    if (done) return;
    callback?.(value); // TODO: 支持打字机效果
    return reader.read().then(process);
  });

  return res;
};
