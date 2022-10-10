import { Document, ObjectId } from "mongoose";

export type AvaliableSchool =
  | "ASSUMPTION"
  | "NEWTON"
  | "ESSENCE"
  | "ESSENCEP"
  | "SATHIT_PRATHUMWAN"
  | "ASSUMPTION_THON"
  | string;

export interface UserInterface {
  email: string;
  password: string;
  name: string;
  username: string;
  avatar: string;
  accType: "developer" | "user";
  preferredColor?: string;
  timetables: {
    modalId: ObjectId[];
    primaryClass: ObjectId;
    starred: ObjectId[];
  };
  passwordLastChanged: Date;
  status: "active" | "suspend";
  passwordR?: {
    token: string;
    exp: Date;
  };
}
