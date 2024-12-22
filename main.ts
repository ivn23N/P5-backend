import { MongoClient } from "mongodb";
import { ApolloServer } from "npm:@apollo/server";
import { startStandaloneServer } from "npm:@apollo/server/standalone";
import { UserModel, PostModel, CommentModel } from "./types.ts";
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";

import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  throw new Error("Please provide a MONGO_URL");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("Connected to MongoDB");

const mongoDB = mongoClient.db("BBDD_P5");
const UserCollection = mongoDB.collection<UserModel>("users");
const PostCollection = mongoDB.collection<PostModel>("post");
const CommentCollection = mongoDB.collection<CommentModel>("comment");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers: resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async () => ({
    userCollection: UserCollection,
    postCollection: PostCollection,
    commentCollection: CommentCollection,
  }),
});

console.info(`Server ready at ${url}`);