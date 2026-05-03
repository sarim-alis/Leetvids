import { chatClient, upsertStreamUser } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const userId = req.user.clerkId;
    const userName = req.user.name || 'Anonymous User';
    const userImage = req.user.image || '';
    
    // Create/upsert user with proper permissions
    await upsertStreamUser({
      id: userId,
      name: userName,
      image: userImage,
      role: 'user',
    });
    
    const token = chatClient.createToken(userId);
    res.status(200).json({ token, userId, userName, userImage });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}