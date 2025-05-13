import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get unread messages for a user with real-time updates
 */
export const getUnreadMessages = query({
  args: {
    userId: v.id("users"),
    lastReadTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Get all chats where this user is a participant
    const allChats = await ctx.db.query("chats").collect();
    const userChatIds = allChats
      .filter((chat) => chat.participants.includes(args.userId))
      .map((chat) => chat._id);

    if (userChatIds.length === 0) {
      return [];
    }

    // Get all messages from these chats that are newer than lastReadTimestamp
    // and were not sent by the current user
    const messages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.and(
          q.gt(q.field("timestamp"), args.lastReadTimestamp),
          q.neq(q.field("senderId"), args.userId),
          q.or(...userChatIds.map((chatId) => q.eq(q.field("chatId"), chatId)))
        )
      )
      .order("asc") // Order by creation time ascending (oldest first)
      .collect();

    // For each message, fetch the sender details
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender,
        };
      })
    );

    return messagesWithSenders;
  },
});

/**
 * Delete a message (marks as deleted instead of removing)
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    // Check if the user is the sender of the message
    if (message.senderId !== args.userId) {
      throw new ConvexError("You can only delete your own messages");
    }

    // Get the chat to check if we need to update lastMessageText/Time
    const chat = await ctx.db.get(message.chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    // Mark the message as deleted instead of deleting it
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      // We keep the original content in the database but it won't be displayed
    });

    // Check if this was the last message in the chat
    // If so, we need to update the chat's lastMessageText
    if (chat.lastMessageTime === message.timestamp) {
      // Update the chat with "This message was deleted" text
      await ctx.db.patch(message.chatId, {
        lastMessageText: "This message was deleted",
        // Keep the same timestamp
      });
    }

    return { success: true };
  },
});

/**
 * Mark messages as read
 */
export const markMessagesAsRead = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if the chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    // Check if the user is a participant in the chat
    if (!chat.participants.includes(args.userId)) {
      throw new ConvexError("User is not a participant in this chat");
    }

    // Get all unread messages in this chat not sent by the current user
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) =>
        q.and(
          q.neq(q.field("senderId"), args.userId),
          q.eq(q.field("status"), "sent")
        )
      )
      .collect();

    // Update each message status to "read"
    for (const message of messages) {
      await ctx.db.patch(message._id, { status: "read" });
    }

    return messages.length;
  },
});
