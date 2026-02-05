import Sidebar from "../../components/Sidebar/Sidebar";
import { Send, MessageCircle, Menu, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMessageStore } from "../../store/messageStore";
import { useAuthStore } from "../../store/authStore";

export default function Messages() {
  const {
    recentChats,
    contactsLoading,
    activeChatUser,
    messages,
    loading,
    sending,
    openChat,
    loadContacts,
    sendMessage,
    connectSocket,
    disconnectSocket,
  } = useMessageStore();

  const { user } = useAuthStore();

  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  const loggedInId = user?._id || user?.id;

  useEffect(() => {
    if (!loggedInId) return;
    loadContacts();
  }, [loggedInId, loadContacts]);

  useEffect(() => {
    if (!loggedInId) return;
    connectSocket(String(loggedInId));
    return () => {
      disconnectSocket();
    };
  }, [loggedInId, connectSocket, disconnectSocket]);

  // const formatTimestamp = (value?: string) => {
  //   if (!value) return "";
  //   try {
  //     return new Date(value).toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     });
  //   } catch (error) {
  //     return value;
  //   }
  // };

  const isOwnMessage = useMemo(() => {
    const authId = user?._id || user?.id;
    return (senderId: string) => {
      if (!authId) return false;
      return senderId === authId;
    };
  }, [user]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message.trim());
    setMessage("");
  };

  useEffect(() => {
    console.log(activeChatUser);
  }, [activeChatUser]);

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 bg-(--primary) py-6 px-4 md:px-6 lg:px-10">
        <div className="w-full mx-auto lg:h-[85vh] h-full flex flex-col lg:flex-row border border-(--border) rounded-2xl overflow-hidden shadow">
          <button
            className="lg:hidden flex items-center gap-2 p-4 border-b bg-(--secondary)"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="w-6 h-6 text-(--accent)" />
            <span className="font-semibold">Messages</span>
          </button>

          <aside
            className={`border-r border-(--border) bg-(--secondary) overflow-y-auto ${
              showSidebar ? "block" : "hidden"
            } absolute inset-0 z-50 w-full h-full lg:static lg:block lg:w-72 lg:h-auto`}
          >
            <div className="p-4 border-b border-(--border) relative space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-(--text) flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-(--accent)" />
                  Messages
                </h2>
              </div>

              <button
                className="lg:hidden absolute right-4 top-4 text-(--muted) text-xl"
                onClick={() => setShowSidebar(false)}
              >
                ✕
              </button>
            </div>

            <div>
              {contactsLoading && (
                <div className="p-4 flex items-center gap-2 text-sm text-(--muted)">
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating
                  contacts...
                </div>
              )}

              {!contactsLoading && recentChats.length === 0 && (
                <p className="p-4 text-sm text-(--muted)">
                  No in-progress jobs yet. Once a provider is working on your
                  job, they will appear here.
                </p>
              )}

              {recentChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={async () => {
                    await openChat(chat);
                    setShowSidebar(false);
                  }}
                  className={`p-4 cursor-pointer border-b border-(--border) hover:bg-(--primary) ${
                    activeChatUser?._id === chat._id ? "bg-(--primary)" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={chat.profilePicture}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-(--text)">
                        {chat.fullName}
                      </h3>
                      <span className="text-xs text-(--muted)">
                        {chat.jobTitle
                          ? `Job: ${chat.jobTitle}`
                          : chat.jobId || chat._id}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="flex-1 flex flex-col bg-(--primary) h-full">
            <div className="p-4 border-b border-(--border) flex items-center gap-3">
              {activeChatUser && (
                <img
                  src={activeChatUser?.profilePicture}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <h2 className="text-lg font-semibold text-(--text)">
                  {activeChatUser ? activeChatUser.fullName : "Select a chat"}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 bg-(--secondary)">
              {!activeChatUser && (
                <div className="h-full flex items-center justify-center text-(--muted) text-sm">
                  Choose or start a chat to view messages.
                </div>
              )}

              {activeChatUser && loading && (
                <div className="h-full flex items-center justify-center text-(--muted)">
                  <Loader2 className="animate-spin" />
                </div>
              )}

              {activeChatUser && !loading && messages.length === 0 && (
                <p className="text-center text-sm text-(--muted)">
                  No messages yet. Say hello!
                </p>
              )}

              {activeChatUser &&
                !loading &&
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`w-full flex ${
                      isOwnMessage(msg.senderId)
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`inline-flex w-fit max-w-[70%] px-3 py-2 rounded-xl text-sm gap-1 ${
                        isOwnMessage(msg.senderId)
                          ? "bg-(--accent) text-(--primary) rounded-br-sm"
                          : "bg-(--primary) border border-(--border) text-(--text) rounded-bl-sm"
                      }`}
                    >
                      <span className="wrap-break-word whitespace-pre-wrap text-left">
                        {msg.content}
                      </span>
                      {/* <span
                        className={`text-[10px] uppercase ${
                          isOwnMessage(msg.senderId)
                            ? "text-(--primary)/70"
                            : "text-(--muted)"
                        }`}
                      >
                        {formatTimestamp(msg.createdAt)}
                      </span> */}
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-3 md:p-4 border-t border-(--border) flex items-center gap-3 bg-(--primary)">
              <input
                type="text"
                value={message}
                disabled={!activeChatUser}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  activeChatUser
                    ? "Type your message..."
                    : "Select a chat to start messaging"
                }
                className="flex-1 px-4 py-2 border border-(--border) rounded-lg focus:outline-none focus:border-(--accent) disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                type="button"
                disabled={!activeChatUser || sending || !message.trim()}
                className="p-3 bg-(--accent) text-white rounded-lg hover:bg-(--accent-hover) transition disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
