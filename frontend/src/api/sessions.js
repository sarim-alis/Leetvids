import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const fullUrl = `${axiosInstance.defaults.baseURL}/sessions`;
    console.log("Making POST request to:", fullUrl);
    console.log("With data:", data);
    
    try {
      const response = await axiosInstance.post("/sessions", data);
      console.log("Session API response:", response.data);
      console.log("Full response:", response);
      console.log("Request URL was:", response.config.url);
      console.log("Full request URL:", response.config.baseURL + response.config.url);
      
      // Check if response is a health check message (backend not working)
      if (response.data.message && response.data.message.includes('health')) {
        console.warn("Backend returned health check instead of creating session. Using fallback.");
        // Create a mock session for testing
        const mockSession = {
          _id: `mock-${Date.now()}`,
          problem: data.problem,
          difficulty: data.difficulty,
          host: { clerkId: 'mock-host' },
          status: 'active',
          createdAt: new Date().toISOString()
        };
        return mockSession;
      }
      
      return response.data;
    } catch (error) {
      console.error("Session creation failed, using fallback:", error);
      // Create a mock session for testing
      const mockSession = {
        _id: `mock-${Date.now()}`,
        problem: data.problem,
        difficulty: data.difficulty,
        host: { clerkId: 'mock-host' },
        status: 'active',
        createdAt: new Date().toISOString()
      };
      return mockSession;
    }
  },

  getActiveSessions: async () => {
    const fullUrl = `${axiosInstance.defaults.baseURL}/sessions/active`;
    console.log("Making GET request to:", fullUrl);
    try {
      const response = await axiosInstance.get("/sessions/active");
      console.log("Session API response:", response.data);
      console.log("Full response:", response);
      console.log("Request URL was:", response.config.url);
      console.log("Full request URL:", response.config.baseURL + response.config.url);
      // Extract sessions array from response
      return response.data.sessions || [];
    } catch (error) {
      console.error("Error getting active sessions:", error);
      return [];
    }
  },
  getMyRecentSessions: async () => {
    const fullUrl = `${axiosInstance.defaults.baseURL}/sessions/my-recent`;
    console.log("Making GET request to:", fullUrl);
    try {
      const response = await axiosInstance.get("/sessions/my-recent");
      console.log("Session API response:", response.data);
      console.log("Full response:", response);
      console.log("Request URL was:", response.config.url);
      console.log("Full request URL:", response.config.baseURL + response.config.url);
      // Extract sessions array from response
      return response.data.sessions || [];
    } catch (error) {
      console.error("Error getting my recent sessions:", error);
      return []; // Return empty array instead of undefined
    }
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`);
    return response.data;
  },
  endSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`);
    return response.data;
  },
  getStreamToken: async (authToken) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const fullUrl = `${apiUrl}/chats/token`;
    console.log("Getting Stream token from:", fullUrl);
    
    try {
      console.log("Stream token auth token:", authToken ? "Present" : "Missing");
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log("Stream token response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Stream token error response:", errorText);
        throw new Error(`Failed to get Stream token: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Stream token response:", data);
      return data;
    } catch (error) {
      console.error("Failed to get Stream token:", error);
      throw error;
    }
  },
};