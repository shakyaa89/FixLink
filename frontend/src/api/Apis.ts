// import axios from "axios";

// const baseURL = "http://192.168.1.70:3000/api";

// const Api = axios.create({
//   baseURL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // runs a function before every request made by that Axios instance
// Api.interceptors.request.use((config) => {
//   // Read token from localStorage
//   const token = localStorage.getItem("jwtToken");
//   // If token exists, attach it to the request headers
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   // Return the modified config so Axios can send the request
//   return config;
// });

// interface UserRegisterData {
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   password: string;
//   address: string;
//   addressDescription: string;
//   addressURL: string;
//   profilePicture: string;
// }

// interface UserLoginData {
//   email: string;
//   password: string;
// }

// export const AuthApi = {
//   registerApi: (registerData: UserRegisterData) =>
//     Api.post("/auth/register", registerData),
//   loginApi: (loginData: UserLoginData) => Api.post("/auth/login", loginData),
//   checkAuthApi: () => Api.get("/auth/me"),
//   logoutApi: () => Api.post("/auth/logout"),
// };

import axios from "axios";

const baseURL = "http://192.168.1.70:3000/api";
// const baseURL = "http://100.64.216.104:3000/api";

interface User {
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
  location: string;
  locationURL: string;
  jobStatus?: string;
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
};

export const OfferApi = {
  createOffer: (data: { jobId: string; offeredPrice: number }) =>
    Api.post("/offer/create", data, { headers: getAuthHeader() }),
};
