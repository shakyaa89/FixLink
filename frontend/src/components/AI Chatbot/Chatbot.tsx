import { useMemo, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { AiApi, type AiChatMessage } from "../../api/Apis";
import { useAuthStore } from "../../store/authStore";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you today?",
    },
  ]);
  const { user } = useAuthStore();

  const category = useMemo(
    () => (user?.providerCategory ? String(user.providerCategory) : ""),
    [user]
  );

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history: AiChatMessage[] = nextMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const response = await AiApi.chat({
        message: trimmed,
        history,
        category,
      });

      const reply =
        response?.data?.reply ||
        "I could not generate a response right now. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I could not reach the AI service right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-(--accent) hover:bg-(--accent-hover) text-white p-4 rounded-full shadow-lg transition"
      >
        <MessageSquare size={22} />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-22 right-6 w-80 bg-(--primary) border border-(--border) shadow-xl rounded-xl flex flex-col overflow-hidden z-100">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-(--secondary) border-b border-(--border)">
            <h2 className="text-(--text) font-semibold">Chat Support</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-(--muted) hover:text-(--text)"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 h-64 overflow-y-auto space-y-3 bg-(--primary)">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "assistant"
                    ? "bg-(--secondary) p-2 rounded-lg text-sm text-(--text) w-fit max-w-[80%]"
                    : "bg-(--accent) text-white p-2 rounded-lg text-sm w-fit max-w-[80%] ml-auto"
                }
              >
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="bg-(--secondary) p-2 rounded-lg text-sm text-(--text) w-fit max-w-[80%]">
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-(--border) p-3 bg-(--secondary) flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-(--border) focus:outline-none focus:ring-1 focus:ring-(--accent) bg-(--primary) text-(--text)"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-(--accent) hover:bg-(--accent-hover) text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
