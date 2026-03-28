import { create } from "zustand";
import Toast from "react-native-toast-message";
import { io, type Socket } from "socket.io-client";
import {
  API_BASE_URL,
  MessageApi,
  type MessageContact,
  type MessageData,
} from "@/api/Apis";

interface MessageState {
  recentChats: MessageContact[];
  contactsLoading: boolean;
  activeChatUser: MessageContact | null;
  messages: MessageData[];
  loading: boolean;
  sending: boolean;
  socket: Socket | null;
  socketUserId: string | null;
  loadContacts: () => Promise<void>;
  openChat: (user: MessageContact) => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
}

const showError = (message: string) => {
  Toast.show({
    type: "error",
    text1: message,
  });
};

export const useMessageStore = create<MessageState>((set, get) => ({
  recentChats: [],
  contactsLoading: false,
  activeChatUser: null,
  messages: [],
  loading: false,
  sending: false,
  socket: null,
  socketUserId: null,

  loadContacts: async () => {
    set({ contactsLoading: true });
    try {
      const res = await MessageApi.fetchContacts();
      set({ recentChats: res.data?.contacts || [] });
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || "Failed to load contacts";
      showError(errMsg);
    } finally {
      set({ contactsLoading: false });
    }
  },

  connectSocket: (userId) => {
    const { socket, socketUserId } = get();

    if (!userId) return;
    if (socket && socketUserId === userId) return;

    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(API_BASE_URL, {
      withCredentials: true,
      query: { userId },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 15000,
    });

    newSocket.on("connect_error", (err) => {
      console.log("Socket connect_error:", err?.message || err);
    });

    newSocket.on("message:new", (payload: MessageData) => {
      const {
        activeChatUser,
        recentChats,
        socketUserId: currentUserIdFromState,
      } = get();

      if (!payload?._id) return;

      const senderId = String(payload.senderId);
      const receiverId = String(payload.receiverId);
      const currentUserId = String(currentUserIdFromState || userId);
      const activeChatId = activeChatUser?._id ? String(activeChatUser._id) : "";

      const isForActiveChat =
        !!activeChatId &&
        ((senderId === activeChatId && receiverId === currentUserId) ||
          (receiverId === activeChatId && senderId === currentUserId));

      if (isForActiveChat) {
        set((state) => {
          const exists = state.messages.some((msg) => msg._id === payload._id);
          if (exists) return state;
          return { messages: [...state.messages, payload] };
        });
      }

      const otherUserId =
        senderId === currentUserId ? receiverId : senderId;

      const hasChat = recentChats.some((chat) => chat._id === otherUserId);
      if (!hasChat) {
        set({
          recentChats: [{ _id: otherUserId, fullName: "New chat" }, ...recentChats],
        });
      }
    });

    set({ socket: newSocket, socketUserId: userId });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, socketUserId: null });
  },

  openChat: async (user) => {
    set({ activeChatUser: user });

    const currentChats = get().recentChats;
    const exists = currentChats.some((chat) => chat._id === user._id);
    if (!exists) {
      set({ recentChats: [user, ...currentChats] });
    }

    await get().fetchMessages(user._id);
  },

  fetchMessages: async (userId) => {
    set({ loading: true });
    try {
      const res = await MessageApi.fetchMessages(userId);
      set({ messages: res.data?.messages || [] });
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || "Failed to load messages";
      showError(errMsg);
      set({ messages: [] });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (content) => {
    const { activeChatUser } = get();

    if (!activeChatUser) {
      showError("Select a chat to send messages");
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) return;

    set({ sending: true });
    try {
      const res = await MessageApi.sendMessage({
        receiverId: activeChatUser._id,
        content: trimmed,
      });

      const newMessage: MessageData | undefined = res.data?.data;
      if (newMessage) {
        set((state) => {
          const exists = state.messages.some((msg) => msg._id === newMessage._id);
          if (exists) return state;
          return { messages: [...state.messages, newMessage] };
        });
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || "Failed to send message";
      showError(errMsg);
    } finally {
      set({ sending: false });
    }
  },
}));
