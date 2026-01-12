import { create } from "zustand";
import toast from "react-hot-toast";
import { MessageApi, type MessageData } from "../api/Apis.ts";

export interface ChatUserMeta {
  _id: string;
  fullName: string;
  jobId?: string;
  jobTitle?: string;
}

interface MessageState {
  recentChats: ChatUserMeta[];
  contactsLoading: boolean;
  activeChatUser: ChatUserMeta | null;
  messages: MessageData[];
  loading: boolean;
  sending: boolean;
  loadContacts: () => Promise<void>;
  openChat: (user: ChatUserMeta) => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  recentChats: [],
  contactsLoading: false,
  activeChatUser: null,
  messages: [],
  loading: false,
  sending: false,

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
        set({ messages: [...messages, newMessage] });
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
