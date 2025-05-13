import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all contacts for a user
 */
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Get all contacts for this user
    const contactRelations = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // If no contacts, return empty array
    if (contactRelations.length === 0) {
      return [];
    }

    // Get the actual user data for each contact
    const contactIds = contactRelations.map((relation) => relation.contactId);
    const contactUsers = await Promise.all(
      contactIds.map((id) => ctx.db.get(id))
    );

    // Filter out any null values (in case a contact was deleted)
    return contactUsers.filter(Boolean);
  },
});

/**
 * Add a new contact by phone number
 */
export const addByPhoneNumber = mutation({
  args: {
    userId: v.id("users"),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Find the contact user by phone number
    const contactUsers = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();

    // If no user found with this phone number
    if (contactUsers.length === 0) {
      throw new ConvexError("No user found with this phone number");
    }

    const contactUser = contactUsers[0];

    // Don't allow adding yourself as a contact
    if (contactUser._id === args.userId) {
      throw new ConvexError("You cannot add yourself as a contact");
    }

    // Check if this contact already exists
    const existingContact = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("contactId"), contactUser._id))
      .first();

    if (existingContact) {
      throw new ConvexError("This contact already exists");
    }

    // Create the contact relation
    const contactId = await ctx.db.insert("contacts", {
      userId: args.userId,
      contactId: contactUser._id,
      createdAt: Date.now(),
    });

    return {
      contactId,
      contact: contactUser,
    };
  },
});

/**
 * Delete a contact
 */
export const remove = mutation({
  args: {
    userId: v.id("users"),
    contactId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Find the contact relation
    const contactRelation = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("contactId"), args.contactId))
      .first();

    if (!contactRelation) {
      throw new ConvexError("Contact not found");
    }

    // Delete the contact relation
    await ctx.db.delete(contactRelation._id);

    return { success: true };
  },
});
