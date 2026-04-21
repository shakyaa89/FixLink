import axios from "axios";


export const API_BASE_URL = "https://fixlink-n7rz.onrender.com";
export const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dj1vqpua0/image/upload";
const baseURL = `${API_BASE_URL}/api`;

interface User {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  city: string;
  address?: string;
  addressDescription?: string;
  addressURL?: string;
  profilePicture: string;
  role?: string;
  verificationStatus?: "pending" | "verified" | "rejected" | "";
  rejectionReason?: string;
  verificationProofURL?: string;
  providerCategory?: string;
  idURL?: string;
}

interface UserEditData{
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  addressDescription: string;
  addressURL?: string;
  profilePicture: string;
}

interface ServiceProviderProfilePayload {
  verificationProofURL: string;
  providerCategory: string;
  idURL: string;
  address: string;
  addressDescription?: string;
  addressURL?: string;
  verificationStatus: string;
  rejectionReason: string;
}

interface UserLoginData {
  email: string;
  password: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
  scheduledFor?: string;
  jobStatus?: string;
  images: string[];
  offers?: OfferData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  jobCategory?: string;
  userPrice?: number;
  location?: string;
  locationURL?: string;
  images?: string[];
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
  resolutionMessage?: string;
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

export interface AdminOfferData {
  _id?: string;
  jobId?: { _id?: string; title?: string } | string;
  serviceProviderId?: { _id?: string; fullName?: string; email?: string } | string;
  offeredPrice?: number;
  status?: "pending" | "accepted" | "rejected";
  createdAt?: string;
}

export interface AdminReviewData {
  _id?: string;
  jobId?: { _id?: string; title?: string } | string;
  reviewerId?: { _id?: string; fullName?: string; email?: string } | string;
  revieweeId?: { _id?: string; fullName?: string; email?: string } | string;
  rating?: number;
  comment?: string;
  createdAt?: string;
}

export interface AdminMessageData {
  _id?: string;
  senderId?: { _id?: string; fullName?: string; email?: string } | string;
  receiverId?: { _id?: string; fullName?: string; email?: string } | string;
  content?: string;
  createdAt?: string;
}

export interface DisputeData {
  _id?: string;
  jobId?: { _id?: string; title?: string } | string;
  title: string;
  description?: string;
  status?: "open" | "resolved";
  priority?: "low" | "medium" | "high";
  resolutionMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DisputableJobData {
  _id: string;
  title: string;
  jobStatus?: string;
  createdAt?: string;
}

// Returns auth header with JWT when available.
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
  
  updateUserProfileApi: (updateData: UserEditData) => Api.put("/auth/update/user", updateData, {
      headers: getAuthHeader(),
    }),

  changePasswordApi: (payload: ChangePasswordPayload) =>
    Api.put("/auth/change-password", payload, {
      headers: getAuthHeader(),
    }),
};

export const JobApi = {
  createJobApi: (jobData: JobData) =>
    Api.post("/job/create", jobData, { headers: getAuthHeader() }),

  scheduleJobApi: (jobData: JobData) =>
    Api.post("/job/schedule", jobData, { headers: getAuthHeader() }),

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

  updateJobDetailsApi: (jobId: string, data: UpdateJobData) =>
    Api.put(`/job/update/${jobId}`, data, { headers: getAuthHeader() }),

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

  fetchMySentReviews: () =>
    Api.get("/reviews/sent", { headers: getAuthHeader() }),
};

export const DisputeApi = {
  fetchMyDisputes: () => Api.get("/disputes/my", { headers: getAuthHeader() }),

  fetchDisputableJobs: () =>
    Api.get("/disputes/jobs", { headers: getAuthHeader() }),

  createDispute: (data: {
    jobId: string;
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
  }) => Api.post("/disputes/create", data, { headers: getAuthHeader() }),
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

  verifyProvider: (data: { verificationProofURL: string; category: string }) =>
    Api.post("/ai/verify", data),

  verifyJob: (data: { title: string; description: string; userPrice: number }) =>
    Api.post("/ai/verifyJob", data),
};

export const AdminApi = {
  fetchOverview: () => Api.get("/admin/overview", { headers: getAuthHeader() }),

  fetchUsers: () => Api.get("/admin/users", { headers: getAuthHeader() }),

  fetchUserById: (userId: string) =>
    Api.get(`/admin/users/${userId}`, { headers: getAuthHeader() }),

  updateUser: (userId: string, data: Partial<User>) =>
    Api.put(`/admin/users/${userId}`, data, { headers: getAuthHeader() }),

  deleteUser: (userId: string) =>
    Api.delete(`/admin/users/${userId}`, { headers: getAuthHeader() }),

  fetchJobs: () => Api.get("/admin/jobs", { headers: getAuthHeader() }),

  fetchJobById: (jobId: string) =>
    Api.get(`/admin/jobs/${jobId}`, { headers: getAuthHeader() }),

  createJob: (data: {
    userId: string;
    title: string;
    description: string;
    jobCategory: string;
    userPrice: number;
    location: string;
    locationURL?: string;
    images?: string[];
    scheduledFor?: string;
    jobStatus?: "open" | "scheduled" | "in-progress" | "cancelled" | "completed";
    finalPrice?: number;
  }) => Api.post("/admin/jobs", data, { headers: getAuthHeader() }),

  updateJob: (
    jobId: string,
    data: Partial<{
      userId: string;
      title: string;
      description: string;
      jobCategory: string;
      userPrice: number;
      finalPrice: number;
      location: string;
      locationURL: string;
      images: string[];
      scheduledFor: string;
      offers: string[];
      jobStatus: "open" | "scheduled" | "in-progress" | "cancelled" | "completed";
    }>,
  ) =>
    Api.put(`/admin/jobs/${jobId}`, data, { headers: getAuthHeader() }),

  deleteJob: (jobId: string) =>
    Api.delete(`/admin/jobs/${jobId}`, { headers: getAuthHeader() }),

  fetchOffers: () => Api.get("/admin/offers", { headers: getAuthHeader() }),

  updateOffer: (
    offerId: string,
    data: Partial<{ offeredPrice: number; status: "pending" | "accepted" | "rejected" }>
  ) => Api.put(`/admin/offers/${offerId}`, data, { headers: getAuthHeader() }),

  deleteOffer: (offerId: string) =>
    Api.delete(`/admin/offers/${offerId}`, { headers: getAuthHeader() }),

  fetchDisputes: () => Api.get("/admin/disputes", { headers: getAuthHeader() }),

  updateDispute: (
    disputeId: string,
    data: Partial<{
      title: string;
      description: string;
      status: "open" | "resolved";
      priority: "low" | "medium" | "high";
      resolutionMessage: string;
    }>
  ) => Api.put(`/admin/disputes/${disputeId}`, data, { headers: getAuthHeader() }),

  deleteDispute: (disputeId: string) =>
    Api.delete(`/admin/disputes/${disputeId}`, { headers: getAuthHeader() }),

  fetchReviews: () => Api.get("/admin/reviews", { headers: getAuthHeader() }),

  updateReview: (
    reviewId: string,
    data: Partial<{ rating: number; comment: string }>
  ) => Api.put(`/admin/reviews/${reviewId}`, data, { headers: getAuthHeader() }),

  deleteReview: (reviewId: string) =>
    Api.delete(`/admin/reviews/${reviewId}`, { headers: getAuthHeader() }),

  fetchMessages: () => Api.get("/admin/messages", { headers: getAuthHeader() }),

  updateMessage: (messageId: string, data: { content: string }) =>
    Api.put(`/admin/messages/${messageId}`, data, { headers: getAuthHeader() }),

  deleteMessage: (messageId: string) =>
    Api.delete(`/admin/messages/${messageId}`, { headers: getAuthHeader() }),

  fetchServiceProviders: () =>
    Api.get("/admin/service-providers", { headers: getAuthHeader() }),

  updateServiceProviderVerification: (
    providerId: string,
    status: "pending" | "verified" | "rejected",
    rejectionReason?: string,
  ) =>
    Api.put(
      `/admin/service-providers/${providerId}/verification`,
      { status, rejectionReason },
      { headers: getAuthHeader() },
    ),
};
