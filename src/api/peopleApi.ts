import axios, { type AxiosInstance } from "axios";
import type {
  SearchParams,
  SearchResponse,
  DatabaseStats,
  Person,
} from "@/types/person";
import { mockPeople, mockStates } from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === "true";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Network Error:", error.message);
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  },
);

// Mock API functions
const mockApi = {
  searchPeople: async (params: SearchParams): Promise<SearchResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockPeople];

    // Filter by search params
    if (params.firstname) {
      filtered = filtered.filter((p) =>
        p.firstname?.toLowerCase().includes(params.firstname!.toLowerCase()),
      );
    }
    if (params.lastname) {
      filtered = filtered.filter((p) =>
        p.lastname?.toLowerCase().includes(params.lastname!.toLowerCase()),
      );
    }
    if (params.city) {
      filtered = filtered.filter((p) =>
        p.city?.toLowerCase().includes(params.city!.toLowerCase()),
      );
    }
    if (params.state) {
      filtered = filtered.filter((p) => p.st === params.state);
    }
    if (params.zip) {
      filtered = filtered.filter((p) => p.zip?.includes(params.zip!));
    }

    const page = params.page || 1;
    const limit = params.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  },

  getPersonById: async (id: number): Promise<Person> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const person = mockPeople.find((p) => p.id === id);
    if (!person) throw new Error("Person not found");
    return person;
  },

  getStates: async (): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockStates;
  },

  getStats: async (): Promise<DatabaseStats> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      totalRecords: mockPeople.length,
      recordsByState: [
        { state: "KY", count: 2 },
        { state: "NY", count: 1 },
        { state: "CA", count: 1 },
        { state: "IL", count: 1 },
        { state: "TX", count: 1 },
        { state: "AZ", count: 1 },
        { state: "PA", count: 1 },
      ],
    };
  },
};

// API Methods
export const peopleApi = {
  searchPeople: async (params: SearchParams): Promise<SearchResponse> => {
    if (USE_MOCK_DATA) {
      return mockApi.searchPeople(params);
    }

    const cleanParams = Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    const response = await apiClient.get<SearchResponse>("/people/search", {
      params: cleanParams,
    });
    return response.data;
  },

  getPersonById: async (id: number): Promise<Person> => {
    if (USE_MOCK_DATA) {
      return mockApi.getPersonById(id);
    }

    const response = await apiClient.get<Person>(`/people/${id}`);
    return response.data;
  },

  getStates: async (): Promise<string[]> => {
    if (USE_MOCK_DATA) {
      return mockApi.getStates();
    }

    const response = await apiClient.get<string[]>("/people/states");
    return response.data;
  },

  getStats: async (): Promise<DatabaseStats> => {
    if (USE_MOCK_DATA) {
      return mockApi.getStats();
    }

    const response = await apiClient.get<DatabaseStats>("/people/stats");
    return response.data;
  },
};

export default apiClient;
