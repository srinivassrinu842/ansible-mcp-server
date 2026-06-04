import axios, { AxiosInstance, AxiosError } from "axios";
import https from "https";

// Retrieve environment variables
const baseURL = process.env.AAP_BASE_URL || "";
const token = process.env.AAP_TOKEN || "";
const username = process.env.AAP_USERNAME || "";
const password = process.env.AAP_PASSWORD || "";
const insecure = process.env.AAP_INSECURE === "true";
const apiPrefix = process.env.AAP_API_PREFIX || "/api/controller/v2";

if (!baseURL) {
  console.error("Warning: AAP_BASE_URL environment variable is not defined.");
}

// Config HTTPS agent to bypass SSL verification if insecure mode is enabled
const httpsAgent = new https.Agent({
  rejectUnauthorized: !insecure,
});

// Configure base axios request config
const headers: Record<string, string> = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

if (token) {
  headers["Authorization"] = `Bearer ${token}`;
} else if (username && password) {
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");
  headers["Authorization"] = `Basic ${credentials}`;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL,
  headers,
  httpsAgent,
  timeout: 30000,
});

// Format endpoint to support dynamic API prefixes (e.g. /api/controller/v2/)
export function formatEndpoint(endpoint: string): string {
  const currentPrefix = process.env.AAP_API_PREFIX || "/api/controller/v2";
  const cleanPrefix = currentPrefix.endsWith("/") ? currentPrefix : `${currentPrefix}/`;
  if (endpoint.startsWith("/api/v2/")) {
    return endpoint.replace("/api/v2/", cleanPrefix);
  }
  return endpoint;
}

// Error handling helper
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data;
      const details = typeof data === "object" && data !== null ? JSON.stringify(data) : String(data);
      switch (error.response.status) {
        case 400:
          return `Error 400: Bad Request. ${details}`;
        case 401:
          return "Error 401: Unauthorized. Please check your credentials or API token.";
        case 403:
          return "Error 403: Forbidden. You do not have permissions for this action.";
        case 404:
          return "Error 404: Resource not found. Verify the URL, IDs, or endpoint.";
        case 409:
          return `Error 409: Conflict. ${details}`;
        case 429:
          return "Error 429: Rate limit exceeded. Please try again later.";
        default:
          return `Error ${error.response.status}: API Request failed. Detail: ${details}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out.";
    }
  }
  return `Error: Unexpected issue occurred: ${error instanceof Error ? error.message : String(error)}`;
}

// Helper methods to abstract api structure
export async function getRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  try {
    const response = await apiClient.get<T>(formatEndpoint(endpoint), { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function postRequest<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const response = await apiClient.post<T>(formatEndpoint(endpoint), data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function putRequest<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const response = await apiClient.put<T>(formatEndpoint(endpoint), data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function patchRequest<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const response = await apiClient.patch<T>(formatEndpoint(endpoint), data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function deleteRequest<T>(endpoint: string): Promise<T> {
  try {
    const response = await apiClient.delete<T>(formatEndpoint(endpoint));
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
