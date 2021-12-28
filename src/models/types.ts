import express, { Request, Response, NextFunction } from "express";
import { Document, ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      [key: string]: any;
    }
  }
  interface Error {
    statusCode: number;
  }
}

export type ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => any;

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => any;

export interface Count extends Document {
  apiName: string;
  count: number;
}

export interface PlayerInterface extends Document {
  realName: string;
  codeName: string;
  score: number;
  createdBy: ObjectId;
}

export interface UserInterface extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  DOB?: Date;
  system13?: ObjectId[];
  expenses?: ObjectId[];
}

export interface UnlockedObjectInterface extends Object {
  [key: string]: any;
}

export interface ExpensesInterface extends Document {
  name: string;
  type: string;
  amount: number;
  detail?: string;
  createdBy: ObjectId;
  createdAt: Date;
}
