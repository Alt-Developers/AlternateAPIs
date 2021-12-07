import express, { Request, Response, NextFunction } from "express";
import { Document, ObjectId } from "mongoose";

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

export interface Player extends Document {
  realName: string;
  codeName: string;
  score: number;
}

export interface User extends Document {
  email: string;
  password: string;
  username: string;
  DOB?: Date;
  system13?: { players: ObjectId[] };
}
