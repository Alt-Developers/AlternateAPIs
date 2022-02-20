import express, { Request, Response, NextFunction } from "express";
import { SetProfilingLevelOptions, Timestamp } from "mongodb";
import { Document, ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      [key: string]: any;
    }
  }
  interface Error {
    statusCode: number;
    type?: string;
    header?: string;
    location?: string;
    modal?: boolean;
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
  preferredColor: string;
  timetables?: {
    preferredColor: string;
    primaryClass: ObjectId;
    starred: ObjectId[];
    created: ObjectId[];
  };
  preferredConfig: {
    language: string;
    dateTime: string;
    showCovid: string;
  };
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

export interface TimetableContentInterface extends Object {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
}

export interface TimetableInterface extends Document {
  classNo: string;
  program: string;
  defaultColor: string;
  timetableContent: TimetableContentInterface;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassesInterface extends Document {
  classNo: string;
  program: string;
  timetable: ObjectId;
  primaryClassOf: ObjectId[];
  defaultColor: string;
}

export interface codeInterface extends Document {
  programCode: string;
  programName: string;
  classCode: {
    EN: Object;
    TH: Object;
  };
}

export interface UniversalCodeInterface extends Document {
  universalCodes: {
    EN: Object;
    TH: Object;
  };
}
