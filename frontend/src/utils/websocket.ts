const normalizeWebSocketUrl = (rawUrl: string) => {
  const parsed = new URL(rawUrl);

  if (parsed.protocol === "http:") {
    parsed.protocol = "ws:";
  } else if (parsed.protocol === "https:") {
    parsed.protocol = "wss:";
  }

  if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
    throw new Error(
      "VITE_SERVER_URL must use ws://, wss://, http:// or https://",
    );
  }

  return parsed.toString();
};

export const getWebSocketServerUrl = () => {
  const rawEnvUrl = import.meta.env.VITE_SERVER_URL?.trim();

  if (!rawEnvUrl) {
    throw new Error(
      "VITE_SERVER_URL is missing. Set it in your deployment environment.",
    );
  }

  return normalizeWebSocketUrl(rawEnvUrl);
};
