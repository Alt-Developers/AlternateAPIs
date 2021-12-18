import express from "express";
import { model, Types, Schema, connection } from "mongoose";
import { UserInterface } from "./types";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    DOB: Date,
    system13: [Types.ObjectId],
    expenses: [Types.ObjectId],
    avatar: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const userDb = connection.useDb("ss_Account");

export default userDb.model<UserInterface>("User", userSchema);
