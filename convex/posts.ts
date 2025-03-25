import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) {
      throw new Error("Image not found");
    }

    // create post
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      caption: args.caption,
      imageUrl: imageUrl,
      storageId: args.storageId,
      likes: 0,
      comments: 0,
    });

    // increment user's posts count by 1
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

export const getFeedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const posts = await ctx.db.query("posts").order("desc").collect();

    if (posts.length === 0) {
      return [];
    }

    const postsWithInfo = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = (await ctx.db.get(post.userId))!;
        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();
        const bookmarks = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: postAuthor._id,
            username: postAuthor.username,
            image: postAuthor.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmarks,
        };
      })
    );

    return postsWithInfo;
  },
});

export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(post._id, {
        likes: post.likes - 1,
      });
      return false;
    }

    await ctx.db.insert("likes", {
      userId: currentUser._id,
      postId: args.postId,
    });
    await ctx.db.patch(post._id, {
      likes: post.likes + 1,
    });

    if (currentUser._id !== post.userId) {
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "like",
        postId: args.postId,
      });
    }
    return true;
  },
});
