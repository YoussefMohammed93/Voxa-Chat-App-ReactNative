import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@/contexts/UserContext";
import { useMutation } from "convex/react";
import { useState } from "react";

/**
 * Hook for creating a chat between the current user and another user
 */
export function useCreateChat() {
  const { userId } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the create chat mutation
  const createChat = useMutation(api.chats.create);
  
  /**
   * Create a chat with another user
   * @param otherUserId The ID of the user to chat with
   * @returns The ID of the created chat
   */
  const createChatWithUser = async (otherUserId: Id<"users">) => {
    if (!userId) {
      setError("You must be logged in to create a chat");
      return null;
    }
    
    try {
      setIsCreating(true);
      setError(null);
      
      // Create the chat
      const chatId = await createChat({
        userId,
        otherUserId,
      });
      
      return chatId;
    } catch (err) {
      console.error("Error creating chat:", err);
      setError(err instanceof Error ? err.message : "Failed to create chat");
      return null;
    } finally {
      setIsCreating(false);
    }
  };
  
  return {
    createChatWithUser,
    isCreating,
    error,
  };
}
