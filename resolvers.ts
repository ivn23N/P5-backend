import { Collection, ObjectId } from "mongodb";
import { User, UserModel, Post, PostModel, Comment, CommentModel } from "./types.ts";
import { fromModelToUser, fromModelToPost, fromModelToComment } from "./utils.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";


export const resolvers = {
  Query: {
    users: async (
      _: unknown,
      __: unknown,
      context: {
        userCollection: Collection<UserModel>;
        postCollection: Collection<PostModel>;
        commentCollection: Collection<CommentModel>;
      }
    ): Promise<User[]> => {
      const usersModel = await context.userCollection.find().toArray();
      return Promise.all(usersModel.map(user => fromModelToUser(user, context.userCollection, context.postCollection, context.commentCollection)));
    },

    user: async (
      _: unknown,
      { id }: { id: string },
      context: {
        userCollection: Collection<UserModel>;
        postCollection: Collection<PostModel>;
        commentCollection: Collection<CommentModel>;
      }
    ): Promise<User | null> => {
      const userModel = await context.userCollection.findOne({ _id: new ObjectId(id) });
      if (!userModel) return null;
      return fromModelToUser(userModel, context.userCollection, context.postCollection, context.commentCollection);
    },

    posts: async (
      _: unknown,
      __: unknown,
      context: {
        postCollection: Collection<PostModel>;
        userCollection: Collection<UserModel>;
        commentCollection: Collection<CommentModel>;
      }
    ): Promise<Post[]> => {
      const postsModel = await context.postCollection.find().toArray();
      return Promise.all(postsModel.map(post =>
        fromModelToPost(post, context.userCollection, context.postCollection, context.commentCollection)
      ));
    },

    post: async (
      _: unknown,
      { id }: { id: string },
      context: {
        postCollection: Collection<PostModel>;
        userCollection: Collection<UserModel>;
        commentCollection: Collection<CommentModel>;
      }
    ): Promise<Post | null> => {
      const postModel = await context.postCollection.findOne({ _id: new ObjectId(id) });
      if (!postModel) return null;
      return fromModelToPost(postModel, context.userCollection, context.postCollection, context.commentCollection);
    },

    comments: async (
      _: unknown,
      __: unknown,
      context: {
        commentCollection: Collection<CommentModel>;
        userCollection: Collection<UserModel>;
        postCollection: Collection<PostModel>;
      }
    ): Promise<Comment[]> => {
      const commentsModel = await context.commentCollection.find().toArray();
      return Promise.all(commentsModel.map(comment =>
        fromModelToComment(comment, context.userCollection, context.postCollection, context.commentCollection)
      ));
    },

    comment: async (
      _: unknown,
      { id }: { id: string },
      context: {
        commentCollection: Collection<CommentModel>;
        userCollection: Collection<UserModel>;
        postCollection: Collection<PostModel>;
      }
    ): Promise<Comment | null> => {
      const commentModel = await context.commentCollection.findOne({ _id: new ObjectId(id) });
      if (!commentModel) return null;
      return fromModelToComment(commentModel, context.userCollection, context.postCollection, context.commentCollection);
    },
  },

  Mutation: {
    createUser: async (
      _: unknown,
      { input }: { input: { name: string; email: string; password: string } },
      context: { userCollection: Collection<UserModel> }
    ): Promise<User> => {
      const existingUser = await context.userCollection.findOne({ email: input.email });
      if (existingUser) throw new Error("Email already in use");

      const hashedPassword = input.password; // Replace with actual hashing logic if needed
      const { insertedId } = await context.userCollection.insertOne({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        posts: [],
        comments: [],
        likedPosts: [],
      });

      const userModel = {
        _id: insertedId,
        name: input.name,
        email: input.email,
        password: hashedPassword,
        posts: [],
        comments: [],
        likedPosts: [],
      };
      return fromModelToUser(userModel, context.userCollection, {} as Collection<PostModel>, {} as Collection<CommentModel>);
    },
  },
};
