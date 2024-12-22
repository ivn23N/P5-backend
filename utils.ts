//utils.ts

import { Collection } from "mongodb";
import { User, UserModel } from "./types.ts";
import { Post, PostModel } from "./types.ts";
import { Comment, CommentModel } from "./types.ts";

export const fromModelToUser = async (
    um: UserModel,
    uc: Collection<UserModel>,
    pc: Collection<PostModel>,
    cc: Collection<CommentModel>
): Promise<User> => {
    const posts = await pc.find({ author: um._id }).toArray();
    const comments = await cc.find({ author: um._id }).toArray();
    const likedPosts = await pc.find({ likes: um._id }).toArray();

    return {
        id: um._id!.toString(),
        name: um.name,
        password: um.password,
        email: um.email,
        posts: await Promise.all(posts.map(pm => fromModelToPost(pm, uc, pc, cc))),
        comments: await Promise.all(comments.map(cm => fromModelToComment(cm, uc, pc, cc))),
        likedPosts: await Promise.all(likedPosts.map(pm => fromModelToPost(pm, uc, pc, cc)))
    };
};

export const fromModelToPost = async (
    pm: PostModel,
    uc: Collection<UserModel>,
    pc: Collection<PostModel>,
    cc: Collection<CommentModel>
): Promise<Post> => {
    const author = await uc.findOne({ _id: pm.author });
    const comments = await cc.find({ post: pm._id }).toArray();
    const likes = await uc.find({ _id: { $in: pm.likes } }).toArray();

    return {
        id: pm._id!.toString(),
        content: pm.content,
        author: author ? await fromModelToUser(author, uc, pc, cc) : {
            id: "",
            name: "Unknown",
            password: "",
            email: "",
            posts: [],
            comments: [],
            likedPosts: []
        },
        comments: await Promise.all(comments.map(cm => fromModelToComment(cm, uc, pc, cc))),
        likes: await Promise.all(likes.map(user => fromModelToUser(user, uc, pc, cc)))
    };
};

export const fromModelToComment = async (
    cm: CommentModel,
    uc: Collection<UserModel>,
    pc: Collection<PostModel>,
    cc: Collection<CommentModel>
): Promise<Comment> => {
    const author = await uc.findOne({ _id: cm.author });
    const post = await pc.findOne({ _id: cm.post });

    return {
        id: cm._id!.toString(),
        text: cm.text,
        author: author ? await fromModelToUser(author, uc, pc, cc) : {
            id: "",
            name: "Unknown",
            password: "",
            email: "",
            posts: [],
            comments: [],
            likedPosts: []
        },
        post: post ? await fromModelToPost(post, uc, pc, cc) : {
            id: "",
            content: "Deleted",
            author: {
                id: "",
                name: "Unknown",
                password: "",
                email: "",
                posts: [],
                comments: [],
                likedPosts: []
            },
            comments: [],
            likes: []
        }
    };
};