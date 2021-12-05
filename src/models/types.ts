import express, { Request, Response, NextFunction } from "express";

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

export interface Count {
  apiName: string;
  count: number;
}

export interface Player {
  realName: string;
  codeName: string;
  score: number;
}
