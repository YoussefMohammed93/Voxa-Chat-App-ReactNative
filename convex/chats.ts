import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all chats for a user
 */
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Get all chats where this user is a participant
    // Using JavaScript filter to check if the user is in the participants array
    const allChats = await ctx.db.query("chats").collect();
    const chats = allChats.filter((chat) =>
      chat.participants.some((participantId) => participantId === args.userId)
    );

    // For each chat, get the other participants' details
    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        // Get the other participants (excluding the current user)
        const otherParticipantIds = chat.participants.filter(
          (id) => id !== args.userId
        );

        // Get user details for each participant
        const otherParticipants = await Promise.all(
          otherParticipantIds.map(async (id) => {
            const user = await ctx.db.get(id);
            return user;
          })
        );

        // Filter out any null values (in case a user was deleted)
        const validParticipants = otherParticipants.filter(Boolean);

        return {
          ...chat,
          otherParticipants: validParticipants,
        };
      })
    );

    return chatsWithDetails;
  },
});

/**
 * Create a new chat with another user
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if both users exist
    const user = await ctx.db.get(args.userId);
    const otherUser = await ctx.db.get(args.otherUserId);

    if (!user || !otherUser) {
      throw new ConvexError("One or both users not found");
    }

    // Check if a chat already exists between these users
    const allChats = await ctx.db.query("chats").collect();

    // Find a chat that includes both users
    const chatWithUser = allChats.find(
      (chat) =>
        chat.participants.includes(args.userId) &&
        chat.participants.includes(args.otherUserId)
    );

    if (chatWithUser) {
      return chatWithUser._id;
    }

    // Create a new chat
    const chatId = await ctx.db.insert("chats", {
      participants: [args.userId, args.otherUserId],
      createdAt: Date.now(),
    });

    return chatId;
  },
});

/**
 * Get messages for a chat
 */
export const getMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    // Check if the chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    // Get all messages for this chat, ordered by timestamp
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .collect();

    return messages;
  },
});

/**
 * Send a message in a chat
 */
export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    // Check if the chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    // Check if the sender is a participant in the chat
    if (!chat.participants.includes(args.senderId)) {
      throw new ConvexError("User is not a participant in this chat");
    }

    // If this is a reply, check if the original message exists
    if (args.replyToId) {
      const originalMessage = await ctx.db.get(args.replyToId);
      if (!originalMessage) {
        throw new ConvexError("Original message not found");
      }
    }

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: args.senderId,
      content: args.content,
      type: args.type,
      timestamp: Date.now(),
      status: "sent",
      replyToId: args.replyToId,
    });

    // Update the chat with the last message
    await ctx.db.patch(args.chatId, {
      lastMessageText: args.content,
      lastMessageTime: Date.now(),
    });

    return messageId;
  },
});
