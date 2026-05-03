import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

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
        
        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();
        console.log("Stream token response:", { token: token ? "Received" : "Missing", userId, userName });

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
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
      } catch (error) {
        console.error("Error initializing Stream call:", error);
        console.error("Error details:", error.response?.data || error.message);
        
        if (error.message.includes("API key")) {
          toast.error("Stream API key not configured");
        } else if (error.response?.status === 401) {
          toast.error("Authentication failed for video call");
        } else {
          toast.error("Failed to connect to video call");
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