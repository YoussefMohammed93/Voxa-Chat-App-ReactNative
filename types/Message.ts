import { Doc, Id } from "@/convex/_generated/dataModel";

export interface Message {
  id: string;
  senderId: string | Id<"users">;
  type: "text" | "image" | "audio" | "video" | "file";
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  replyTo?: string;
  caption?: string;
  createdAt?: Date;
  isDateSeparator?: boolean;
  isUploading?: boolean;
  isDeleted?: boolean; // Flag to indicate if a message has been deleted
}

export interface ConvexMessage extends Doc<"messages"> {
  chatId: Id<"chats">;
  senderId: Id<"users">;
  content: string;
  type: string;
  timestamp: number;
  status: string;
  replyToId?: Id<"messages">;
  isDeleted?: boolean;
}

export interface MessageWithSender extends ConvexMessage {
  sender?: Doc<"users">;
}

// Convert a Convex message to a UI message
export function convertConvexMessage(
  message: ConvexMessage,
  currentUserId: Id<"users">,
  sender?: Doc<"users">
): Message {
  return {
    id: message._id,
    senderId: message.senderId,
    type: message.type as "text" | "image" | "audio" | "video" | "file",
    content: message.content,
    timestamp: new Date(message.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: message.status as "sent" | "delivered" | "read",
    replyTo: message.replyToId as string | undefined,
    createdAt: new Date(message.timestamp),
    isDeleted: message.isDeleted, // Include the isDeleted flag
  };
}
