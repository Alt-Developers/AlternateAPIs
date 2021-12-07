import express from "express";
import { model, Types, Schema, connection } from "mongoose";
import { User } from "./types";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  DOB: Date,
  bio: String,
  system13: {
    players: [Types.ObjectId],
  },
});

const userDb = connection.useDb("SS-Account");

export default userDb.model<User>("User", userSchema);
