import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      firstName: args.firstName,
      lastName: args.lastName,
      phoneNumber: args.phoneNumber,
      profileImageUrl: args.profileImageUrl,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Update a user's profile information
 */
export const update = mutation({
  args: {
    id: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the user exists
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Update the user
    await ctx.db.patch(args.id, {
      firstName: args.firstName,
      lastName: args.lastName,
    });

    return { success: true };
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const findByPhoneNumber = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    // Find the user by phone number using the by_phone index
    const users = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();

    // If no user found, return null
    if (users.length === 0) {
      return null;
    }

    // Return the first user found with this phone number
    return users[0];
  },
});

// This function is used to synchronize the auth state with the Convex database
export const syncUserByPhoneNumber = mutation({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    // Find the user by phone number using the by_phone index
    const users = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();

    // If no user found, return null
    if (users.length === 0) {
      return null;
    }

    // Return the first user found with this phone number
    return users[0]._id;
  },
});
