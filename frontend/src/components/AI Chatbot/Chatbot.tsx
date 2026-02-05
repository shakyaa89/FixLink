import { useState } from "react";
import { MessageSquare, X } from "lucide-react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

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
            <div className="bg-(--secondary) p-2 rounded-lg text-sm text-(--text) w-fit max-w-[80%]">
              Hello! How can I help you today?
            </div>

            <div className="bg-(--accent) text-white p-2 rounded-lg text-sm w-fit max-w-[80%] ml-auto">
              I need a plumber.
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-(--border) p-3 bg-(--secondary) flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-(--border) focus:outline-none focus:ring-1 focus:ring-(--accent) bg-(--primary) text-(--text)"
            />
            <button className="bg-(--accent) hover:bg-(--accent-hover) text-white px-4 py-2 rounded-lg text-sm">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
