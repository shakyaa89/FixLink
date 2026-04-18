import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://192.168.1.73:3005';
// export const API_BASE_URL = 'http://localhost:3005';
// export const API_BASE_URL = 'https://fixlink-n7rz.onrender.com';
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
    const token = await AsyncStorage.getItem('jwtToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};


export const AuthApi = {
    registerApi: (registerData: User) =>
        Api.post('/auth/register', registerData),

    loginApi: (loginData: UserLoginData) =>
        Api.post('/auth/login', loginData),

    checkAuthApi: async () => {
        const headers = await getAuthHeader();
        return Api.get('/auth/me', { headers });
    },

    logoutApi: async () => {
        const headers = await getAuthHeader();
        return Api.post('/auth/logout', {}, { headers });
    },

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

    updateUserProfile: async (data: UpdateUserProfilePayload) => {
        const headers = await getAuthHeader();
        return Api.put('/auth/update/user', data, { headers });
    },
};

export const JobApi = {
    createJobApi: async (jobData: JobData) => {
        const headers = await getAuthHeader();
        return Api.post("/job/create", jobData, { headers })
    },

    scheduleJobApi: async (jobData: JobData & { scheduledFor: string }) => {
        const headers = await getAuthHeader();
        return Api.post("/job/schedule", jobData, { headers })
    },

    fetchUserJobsApi: async () =>
        Api.get("/job/fetch-user-jobs", { headers: await getAuthHeader() }),

    fetchAllJobsApi: async () =>
        Api.get("/job/fetch-all-jobs", { headers: await getAuthHeader() }),

    fetchJobByIdApi: async (jobId: string) =>
        Api.get(`/job/fetch/${jobId}`, { headers: await getAuthHeader() }),

    fetchProviderJobsApi: async (category: string) =>
        Api.get(`/job/provider?category=${category}`, {
            headers: await getAuthHeader(),
        }),

    updateJobDetailsApi: async (jobId: string, data: UpdateJobData) =>
        Api.put(`/job/update/${jobId}`, data, { headers: await getAuthHeader() }),

    cancelJobApi: async (jobId: string) =>
        Api.put(`/job/cancel/${jobId}`, {}, { headers: await getAuthHeader() }),

    completeJobApi: async (jobId: string) =>
        Api.put(`/job/complete/${jobId}`, {}, { headers: await getAuthHeader() }),
};

export const OfferApi = {
    createOffer: async (data: { jobId: string; offeredPrice: number }) =>
        Api.post("/offer/create", data, { headers: await getAuthHeader() }),

    acceptOffer: async (data: { offerId: string }) =>
        Api.put("/offer/accept", data, { headers: await getAuthHeader() }),
};

export const DisputeApi = {
    getDisputableJobs: async () =>
        Api.get("/disputes/jobs", { headers: await getAuthHeader() }),

    createDispute: async (data: { jobId: string; title: string; description: string; priority?: string }) =>
        Api.post("/disputes/create", data, { headers: await getAuthHeader() }),

    getMyDisputes: async () =>
        Api.get("/disputes/my", { headers: await getAuthHeader() }),
};

export const ReviewApi = {
    createReview: async (data: { jobId: string; rating: number; comment?: string }) =>
        Api.post("/reviews/create", data, { headers: await getAuthHeader() }),

    fetchMyReceivedReviews: async () =>
        Api.get("/reviews/received", { headers: await getAuthHeader() }),

    fetchMySentReviews: async () =>
        Api.get("/reviews/sent", { headers: await getAuthHeader() }),
};

export const AiApi = {
    chat: async (data: { message: string; history?: AiChatMessage[]; category?: string }) =>
        Api.post('/ai/chat', data, { headers: await getAuthHeader() }),

    verifyProvider: async (data: { verificationProofURL: string; category: string }) =>
        Api.post('/ai/verify', data, { headers: await getAuthHeader() }),

    verifyJob: async (data: { title: string; description: string; userPrice: number }) =>
        Api.post('/ai/verifyJob', data, { headers: await getAuthHeader() }),
};

export const MessageApi = {
    fetchContacts: async () =>
        Api.get('/messages/contacts', { headers: await getAuthHeader() }),

    sendMessage: async (data: SendMessagePayload) =>
        Api.post('/messages', data, { headers: await getAuthHeader() }),

    fetchMessages: async (userId: string) =>
        Api.get(`/messages/user/${userId}`, { headers: await getAuthHeader() }),
};
