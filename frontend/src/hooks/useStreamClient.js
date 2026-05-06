import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";
import { useAuth } from "@clerk/clerk-react";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const { getToken } = useAuth();
  const isInitializedRef = useRef(false);

  console.log("useStreamClient called with:", { 
    session: session ? "exists" : "null", 
    loadingSession, 
    isHost, 
    isParticipant,
    callId: session?.callId 
  });

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      // Prevent duplicate initialization
      if (isInitializedRef.current) {
        console.log("initCall: already initialized, skipping");
        return;
      }
      console.log("initCall called - checking conditions:");
      console.log("- session?.callId:", session?.callId);
      console.log("- isHost:", isHost);
      console.log("- isParticipant:", isParticipant);
      console.log("- session.status:", session.status);
      
      if (!session?.callId) {
        console.log("initCall returning: no callId");
        return;
      }
      if (!isHost && !isParticipant) {
        console.log("initCall returning: not host or participant");
        return;
      }
      if (session.status === "completed") {
        console.log("initCall returning: session completed");
        return;
      }
      
      console.log("initCall: all conditions passed, proceeding with initialization");

      try {
        console.log("Initializing Stream call for session:", session.callId);
        console.log("Stream API Key:", import.meta.env.VITE_STREAM_API_KEY ? "Set" : "Not set");
        
        // Get auth token from Clerk
        const authToken = await getToken();
        
        const tokenResponse = await sessionApi.getStreamToken(authToken);
        console.log("Full Stream token response:", tokenResponse);
        console.log("Response type:", typeof tokenResponse);
        console.log("Response keys:", Object.keys(tokenResponse || {}));
        console.log("Response stringified:", JSON.stringify(tokenResponse, null, 2));
        
        const { token, userId, userName, userImage } = tokenResponse || {};
        console.log("Extracted Stream token data:", { 
          token: token ? "Received" : "Missing", 
          userId: userId || "MISSING", 
          userName: userName || "MISSING",
          userImage: userImage || "MISSING"
        });

        if (!userId) {
          console.error("Stream token response missing userId - cannot initialize video call");
          toast.error("Failed to get user information for video call");
          return;
        }

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName || 'Anonymous User',
            image: userImage || '',
          },
          token
        );

        setStreamClient(client);

        videoCall = client.call("default", session.callId);
        await videoCall.join({ create: true });
        setCall(videoCall);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);
        console.log("Chat client and channel set successfully");
        
        // Mark as initialized to prevent duplicate connections
        isInitializedRef.current = true;
      } catch (error) {
        console.error("Error initializing Stream call:", error);
        console.error("Error details:", error.response?.data || error.message);
        console.error("Error status:", error.response?.status);
        console.error("Error config:", error.config);
        
        if (error.message.includes("API key")) {
          // toast.error("Stream API key not configured");
        } else if (error.response?.status === 401) {
          // toast.error("Authentication failed for video call");
        } else if (error.response?.status === 403) {
          // toast.error("Access denied - check user permissions");
        } else {
          // toast.error("Failed to connect to video call");
        }
      } finally {
        setIsInitializingCall(false);
      }
    };

    console.log("useStreamClient useEffect - checking conditions:", {
      hasSession: !!session,
      loadingSession,
      shouldInit: session && !loadingSession
    });

    if (session && !loadingSession) {
      console.log("useStreamClient - calling initCall");
      initCall();
    } else {
      console.log("useStreamClient - not calling initCall, conditions not met");
      setIsInitializingCall(false);
    }

    // cleanup - performance reasons
    return () => {
      // Reset initialization flag
      isInitializedRef.current = false;
      
      // iife
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;