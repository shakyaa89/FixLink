import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://fixlink-n7rz.onrender.com';
export const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dj1vqpua0/image/upload';

const baseURL = `${API_BASE_URL}/api`;

console.log(baseURL)

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
    verificationStatus?: 'pending' | 'verified' | 'rejected' | '';
    rejectionReason?: string;
    verificationProofURL?: string;
    providerCategory?: string;
    idProofURL?: string;
    idURL?: string;
}

interface ServiceProviderProfilePayload {
    verificationProofURL: string;
    providerCategory: string;
    idURL: string;
    address: string;
    addressDescription?: string;
    addressURL?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    rejectionReason?: string;
}

interface UpdateUserProfilePayload {
    fullName: string;
    email: string;
    phoneNumber: string;
    city: string;
    address: string;
    addressDescription: string;
    addressURL?: string;
    profilePicture?: string;
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
    jobStatus?: string;
    scheduledFor?: string;
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

export interface MessageContact {
    _id: string;
    fullName: string;
    jobId?: string;
    jobTitle?: string;
    profilePicture?: string;
}

export interface SendMessagePayload {
    receiverId: string;
    content: string;
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
    role: 'user' | 'assistant';
    content: string;
}

const Api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});


const getAuthHeader = async () => {
    // Read stored JWT token from device storage.
    const token = await AsyncStorage.getItem('jwtToken');
    // Return bearer header only when token exists.
    return token ? { Authorization: `Bearer ${token}` } : {};
};


export const AuthApi = {
    // Register a new account.
    registerApi: (registerData: User) =>
        Api.post('/auth/register', registerData),

    // Login with email and password.
    loginApi: (loginData: UserLoginData) =>
        Api.post('/auth/login', loginData),

    // Validate current token and fetch user.
    checkAuthApi: async () => {
        const headers = await getAuthHeader();
        return Api.get('/auth/me', { headers });
    },

    // Logout current session.
    logoutApi: async () => {
        const headers = await getAuthHeader();
        return Api.post('/auth/logout', {}, { headers });
    },

    // Complete profile for service providers.
    completeServiceProviderProfile: async (
        data: ServiceProviderProfilePayload
    ) => {
        const headers = await getAuthHeader();
        return Api.put(
            '/auth/service-provider/complete-profile',
            data,
            { headers }
        );
    },

    // Update current user profile fields.
    updateUserProfile: async (data: UpdateUserProfilePayload) => {
        const headers = await getAuthHeader();
        return Api.put('/auth/update/user', data, { headers });
    },

    // Change account password.
    changePassword: async (payload: ChangePasswordPayload) => {
        const headers = await getAuthHeader();
        return Api.put('/auth/change-password', payload, { headers });
    },
};

export const JobApi = {
    // Create a new open job.
    createJobApi: async (jobData: JobData) => {
        const headers = await getAuthHeader();
        return Api.post("/job/create", jobData, { headers })
    },

    // Create a scheduled job.
    scheduleJobApi: async (jobData: JobData & { scheduledFor: string }) => {
        const headers = await getAuthHeader();
        return Api.post("/job/schedule", jobData, { headers })
    },

    // Fetch jobs created by current user.
    fetchUserJobsApi: async () =>
        Api.get("/job/fetch-user-jobs", { headers: await getAuthHeader() }),

    // Fetch all jobs for listing.
    fetchAllJobsApi: async () =>
        Api.get("/job/fetch-all-jobs", { headers: await getAuthHeader() }),

    // Fetch one job by id.
    fetchJobByIdApi: async (jobId: string) =>
        Api.get(`/job/fetch/${jobId}`, { headers: await getAuthHeader() }),

    // Fetch provider-visible jobs by category.
    fetchProviderJobsApi: async (category: string) =>
        Api.get(`/job/provider?category=${category}`, {
            headers: await getAuthHeader(),
        }),

    // Update selected fields of a job.
    updateJobDetailsApi: async (jobId: string, data: UpdateJobData) =>
        Api.put(`/job/update/${jobId}`, data, { headers: await getAuthHeader() }),

    // Cancel a job by id.
    cancelJobApi: async (jobId: string) =>
        Api.put(`/job/cancel/${jobId}`, {}, { headers: await getAuthHeader() }),

    // Mark a job as completed.
    completeJobApi: async (jobId: string) =>
        Api.put(`/job/complete/${jobId}`, {}, { headers: await getAuthHeader() }),
};

export const OfferApi = {
    // Create a new offer on a job.
    createOffer: async (data: { jobId: string; offeredPrice: number }) =>
        Api.post("/offer/create", data, { headers: await getAuthHeader() }),

    // Accept an existing offer.
    acceptOffer: async (data: { offerId: string }) =>
        Api.put("/offer/accept", data, { headers: await getAuthHeader() }),
};

export const DisputeApi = {
    // Fetch jobs eligible for dispute.
    getDisputableJobs: async () =>
        Api.get("/disputes/jobs", { headers: await getAuthHeader() }),

    // Create a new dispute record.
    createDispute: async (data: { jobId: string; title: string; description: string; priority?: string }) =>
        Api.post("/disputes/create", data, { headers: await getAuthHeader() }),

    // Fetch disputes created by current user.
    getMyDisputes: async () =>
        Api.get("/disputes/my", { headers: await getAuthHeader() }),
};

export const ReviewApi = {
    // Submit a review after job completion.
    createReview: async (data: { jobId: string; rating: number; comment?: string }) =>
        Api.post("/reviews/create", data, { headers: await getAuthHeader() }),

    // Fetch reviews received by current user.
    fetchMyReceivedReviews: async () =>
        Api.get("/reviews/received", { headers: await getAuthHeader() }),

    // Fetch reviews sent by current user.
    fetchMySentReviews: async () =>
        Api.get("/reviews/sent", { headers: await getAuthHeader() }),
};

export const AiApi = {
    // Send message to AI support chat.
    chat: async (data: { message: string; history?: AiChatMessage[]; category?: string }) =>
        Api.post('/ai/chat', data, { headers: await getAuthHeader() }),

    // Verify provider document with AI.
    verifyProvider: async (data: { verificationProofURL: string; category: string }) =>
        Api.post('/ai/verify', data, { headers: await getAuthHeader() }),

    // Verify posted job details with AI.
    verifyJob: async (data: { title: string; description: string; userPrice: number }) =>
        Api.post('/ai/verifyJob', data, { headers: await getAuthHeader() }),
};

export const MessageApi = {
    // Fetch chat contact list.
    fetchContacts: async () =>
        Api.get('/messages/contacts', { headers: await getAuthHeader() }),

    // Send a chat message.
    sendMessage: async (data: SendMessagePayload) =>
        Api.post('/messages', data, { headers: await getAuthHeader() }),

    // Fetch messages with one user.
    fetchMessages: async (userId: string) =>
        Api.get(`/messages/user/${userId}`, { headers: await getAuthHeader() }),
};
