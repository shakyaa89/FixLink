import Sidebar from "../../components/Sidebar/Sidebar";
import { Send, MessageCircle, User, Menu } from "lucide-react";
import { useState } from "react";

export default function Messages() {
  const conversations = [
    {
      id: 1,
      name: "John Doe",
      lastMessage: "I can start tomorrow.",
      time: "10:24 AM",
    },
    {
      id: 2,
      name: "FixItPlumber",
      lastMessage: "Can you send a photo?",
      time: "Yesterday",
    },
    { id: 3, name: "GardenPro", lastMessage: "Offer sent!", time: "Mon" },
  ];

  const sampleMessages = [
    { id: 1, sender: "me", text: "Hi, I need help with my sink." },
    { id: 2, sender: "them", text: "Sure! What seems to be the issue?" },
    { id: 3, sender: "me", text: "It’s leaking under the pipe." },
    { id: 4, sender: "them", text: "Got it, I can check it tomorrow." },
  ];

  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false); // mobile toggle

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for Desktop Only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 bg-white py-6 px-4 md:px-6 lg:px-10">
        <div className="w-full mx-auto lg:h-[85vh] h-full flex flex-col lg:flex-row border border-gray-300 rounded-2xl overflow-hidden shadow">
          {/* Mobile Toggle Button */}
          <button
            className="lg:hidden flex items-center gap-2 p-4 border-b bg-gray-100"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">Messages</span>
          </button>

          {/* Chat List (Sidebar) */}
          <aside
            className={`border-r border-gray-300 bg-gray-50 overflow-y-auto ${
              showSidebar ? "block" : "hidden"
            } absolute inset-0 z-50 w-full h-full lg:static lg:block lg:w-72 lg:h-auto`}
          >
            <div className="p-4 border-b border-gray-300 relative">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Messages
              </h2>

              {/* Close button on mobile */}
              <button
                className="lg:hidden absolute right-4 top-4 text-gray-600 text-xl"
                onClick={() => setShowSidebar(false)}
              >
                ✕
              </button>
            </div>

            {conversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat.id);
                  setShowSidebar(false); // close on mobile
                }}
                className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-gray-100 ${
                  selectedChat === chat.id ? "bg-gray-200" : ""
                }`}
              >
                <h3 className="font-medium text-gray-900">{chat.name}</h3>
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage}
                </p>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </div>
            ))}
          </aside>

          {/* Chat Window */}
          <section className="flex-1 flex flex-col bg-white h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-300 flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {conversations.find((c) => c.id === selectedChat)?.name}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
              {sampleMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`w-full flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`inline-flex w-fit max-w-[80%] flex-col p-3 rounded-xl text-sm wrap-break-word ${
                      msg.sender === "me"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 md:p-4 border-t border-gray-300 flex items-center gap-3 bg-white">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={handleSend}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
