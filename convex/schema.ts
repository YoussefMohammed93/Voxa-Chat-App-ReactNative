import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_phone", ["phoneNumber"]),

  contacts: defineTable({
    userId: v.id("users"),
    contactId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  chats: defineTable({
    participants: v.array(v.id("users")),
    lastMessageText: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    createdAt: v.number(),
  }),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.string(), // "text", "image", etc.
    timestamp: v.number(),
    status: v.string(), // "sent", "delivered", "read"
    replyToId: v.optional(v.id("messages")),
    isDeleted: v.optional(v.boolean()), // Flag to mark messages as deleted
  }).index("by_chat", ["chatId"]),
});
