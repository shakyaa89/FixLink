import { create } from "zustand";
import toast from "react-hot-toast";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL, MessageApi, type MessageData } from "../api/Apis.ts";

export interface ChatUser {
  _id: string;
  fullName: string;
  jobId?: string;
  jobTitle?: string;
  profilePicture?: string;
}

interface MessageState {
  recentChats: ChatUser[];
  contactsLoading: boolean;
  activeChatUser: ChatUser | null;
  messages: MessageData[];
  loading: boolean;
  sending: boolean;
  socket: Socket | null;
  socketUserId: string | null;
  loadContacts: () => Promise<void>;
  openChat: (user: ChatUser) => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
}

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
      console.log(error);
      const errMsg = error.response?.data?.message || "Failed to load contacts";
      toast.error(errMsg);
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
    });

    newSocket.on("message:new", (payload: MessageData) => {
      const { messages, activeChatUser, recentChats, socketUserId } = get();

      if (!payload?._id) return;

      const exists = messages.some((msg) => msg._id === payload._id);
      if (exists) return;

      const isForActiveChat =
        activeChatUser &&
        ((payload.senderId === activeChatUser._id &&
          payload.receiverId === socketUserId) ||
          (payload.receiverId === activeChatUser._id &&
            payload.senderId === socketUserId));

      if (isForActiveChat) {
        set({ messages: [...messages, payload] });
      }

      const otherUserId =
        payload.senderId === socketUserId
          ? payload.receiverId
          : payload.senderId;

      const hasChat = recentChats.some((chat) => chat._id === otherUserId);
      if (!hasChat) {
        set({
          recentChats: [
            { _id: otherUserId, fullName: "New chat" },
            ...recentChats,
          ],
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
    const exists = currentChats.find((chat) => chat._id === user._id);
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
      console.log(error);
      const errMsg = error.response?.data?.message || "Failed to load messages";
      toast.error(errMsg);
      set({ messages: [] });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (content) => {
    const { activeChatUser, messages } = get();

    if (!activeChatUser) {
      toast.error("Select a chat to send messages");
      return;
    }

    if (!content.trim()) {
      return;
    }

    set({ sending: true });
    try {
      const res = await MessageApi.sendMessage({
        receiverId: activeChatUser._id,
        content: content.trim(),
      });

      const newMessage: MessageData | undefined = res.data?.data;

      if (newMessage) {
        const exists = messages.some((msg) => msg._id === newMessage._id);
        if (!exists) {
          set({ messages: [...messages, newMessage] });
        }
      }
    } catch (error: any) {
      console.log(error);
      const errMsg = error.response?.data?.message || "Failed to send message";
      toast.error(errMsg);
    } finally {
      set({ sending: false });
    }
  },
}));
