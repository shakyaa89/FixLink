import axios from "axios";

export const API_BASE_URL = "http://192.168.1.70:3005";
const baseURL = `${API_BASE_URL}/api`;
// const baseURL = "http://100.64.234.28:3000/api";

interface User {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address?: string;
  addressDescription?: string;
  addressURL?: string;
  profilePicture: string;
  role?: string;
  verificationProofURL?: string;
  providerCategory?: string;
  idURL?: string;
}

interface ServiceProviderProfilePayload {
  verificationProofURL: string;
  providerCategory: string;
  idURL: string;
  address: string;
  addressDescription?: string;
  addressURL?: string;
}

interface UserLoginData {
  email: string;
  password: string;
}

export interface JobData {
  _id?: string;
  userId: User;
  title: string;
  description: string;
  jobCategory: string;
  userPrice: number;
  finalPrice?: number;
  location: string;
  locationURL: string;
  jobStatus?: string;
  images: string[];
  offers?: OfferData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferData {
  _id?: string;
  jobId: string;
  serviceProviderId: User;
  offeredPrice: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageData {
  _id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewData {
  _id?: string;
  jobId: { _id?: string; title?: string } | string;
  reviewerId: User;
  revieweeId: User;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SendMessagePayload {
  receiverId: string;
  content: string;
}

export interface AdminUserData {
  _id?: string;
  fullName: string;
  email: string;
  role: "user" | "serviceProvider" | "admin";
  verificationStatus?: string;
  createdAt?: string;
  profilePicture?: string;
  providerCategory?: string;
}

export interface AdminJobData {
  _id?: string;
  title: string;
  jobCategory?: string;
  jobStatus?: string;
  createdAt?: string;
  userId?: { _id?: string; fullName?: string };
}

export interface AdminDisputeData {
  _id?: string;
  title: string;
  jobId?: { _id?: string; title?: string } | string;
  status?: string;
  priority?: string;
  updatedAt?: string;
}

export interface AdminProviderData {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  providerCategory?: string;
  verificationStatus?: string;
  verificationProofURL?: string;
  idProofURL?: string;
  address?: string;
  addressDescription?: string;
  addressURL?: string;
  createdAt?: string;
}

// Helper to get Authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem("jwtToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const AuthApi = {
  registerApi: (registerData: User) => Api.post("/auth/register", registerData),

  loginApi: (loginData: UserLoginData) => Api.post("/auth/login", loginData),

  checkAuthApi: () => Api.get("/auth/me", { headers: getAuthHeader() }), // manually add token

  logoutApi: () => Api.post("/auth/logout", {}, { headers: getAuthHeader() }), // manually add token

  completeServiceProviderProfile: (data: ServiceProviderProfilePayload) =>
    Api.put("/auth/service-provider/complete-profile", data, {
      headers: getAuthHeader(),
    }),
};

export const JobApi = {
  createJobApi: (jobData: JobData) =>
    Api.post("/job/create", jobData, { headers: getAuthHeader() }),

  fetchUserJobsApi: () =>
    Api.get("/job/fetch-user-jobs", { headers: getAuthHeader() }),

  fetchAllJobsApi: () =>
    Api.get("/job/fetch-all-jobs", { headers: getAuthHeader() }),

  fetchJobByIdApi: (jobId: string) =>
    Api.get(`/job/fetch/${jobId}`, { headers: getAuthHeader() }),

  fetchProviderJobsApi: (category: string) =>
    Api.get(`/job/provider?category=${category}`, {
      headers: getAuthHeader(),
    }),

  cancelJobApi: (jobId: string) =>
    Api.put(`/job/cancel/${jobId}`, {}, { headers: getAuthHeader() }),

  completeJobApi: (jobId: string) =>
    Api.put(`/job/complete/${jobId}`, {}, { headers: getAuthHeader() }),
};

export const OfferApi = {
  createOffer: (data: { jobId: string; offeredPrice: number }) =>
    Api.post("/offer/create", data, { headers: getAuthHeader() }),

  acceptOffer: (data: { offerId: string }) =>
    Api.put("/offer/accept", data, { headers: getAuthHeader() }),
};

export const MessageApi = {
  fetchContacts: () =>
    Api.get("/messages/contacts", { headers: getAuthHeader() }),

  sendMessage: (data: SendMessagePayload) =>
    Api.post("/messages", data, { headers: getAuthHeader() }),

  fetchMessages: (userId: string) =>
    Api.get(`/messages/user/${userId}`, { headers: getAuthHeader() }),
};

export const ReviewApi = {
  createReview: (data: { jobId: string; rating: number; comment?: string }) =>
    Api.post("/reviews/create", data, { headers: getAuthHeader() }),

  fetchMyReceivedReviews: () =>
    Api.get("/reviews/received", { headers: getAuthHeader() }),
};

export const AiApi = {
  chat: (data: {
    message: string;
    history?: AiChatMessage[];
    category?: string;
  }) =>
    Api.post("/ai/chat", data, {
      headers: getAuthHeader(),
    }),
};

export const AdminApi = {
  fetchOverview: () =>
    Api.get("/admin/overview", { headers: getAuthHeader() }),

  fetchUsers: () => Api.get("/admin/users", { headers: getAuthHeader() }),

  fetchJobs: () => Api.get("/admin/jobs", { headers: getAuthHeader() }),

  fetchDisputes: () =>
    Api.get("/admin/disputes", { headers: getAuthHeader() }),

  fetchServiceProviders: () =>
    Api.get("/admin/service-providers", { headers: getAuthHeader() }),

  updateServiceProviderVerification: (providerId: string, status: string) =>
    Api.put(
      `/admin/service-providers/${providerId}/verification`,
      { status },
      { headers: getAuthHeader() }
    ),
};
