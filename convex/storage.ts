import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProfileImage = mutation({
  args: {
    storageId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);

    if (!url) {
      throw new ConvexError("Failed to get URL for uploaded file");
    }

    await ctx.db.patch(args.userId, {
      profileImageUrl: url,
    });

    return url;
  },
});
