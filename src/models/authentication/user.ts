import { model, Types, Schema, connection } from "mongoose";
import { UserInterface } from "../types/modelType";

const userSchema = new Schema(
  {
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    name: { type: String, require: true },
    username: { type: String, require: true },
    avatar: { type: String, require: true },
    accType: { type: String, require: true },
    preferredColor: { type: String, require: false },
    timetables: {
      modalId: { type: Types.ObjectId },
      primaryClass: [{ type: Types.ObjectId }],
      starred: [{ type: Types.ObjectId }],
    },
    passwordLastChanged: { type: String, require: false },
    status: { type: String, require: true },
  },
  { timestamps: true }
);

const db = connection.useDb("auth");

export default db.model<UserInterface>("User", userSchema);
