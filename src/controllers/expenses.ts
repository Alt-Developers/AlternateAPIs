import { RequestHandler } from "express";
import Expenses from "../models/expenses/expenses";
import User from "../models/authentication/user";
import { UserInterface } from "../models/types";
import { validationResult } from "express-validator";
import newError from "../utilities/newError";

export const addTransaction: RequestHandler = async (req, res, next) => {
  try {
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      const errMsg = `Validation Error: ${validationError.array()[0].msg}.`;
      return newError(422, errMsg);
    }
    const userId = req.userId;
    const amount = req.body.amount;
    const name = req.body.name;
    const detail = req.body.detail;
    let type = "income";
    if (amount < 0) {
      type = "expenses";
    }

    const user = await User.findById(userId);

    if (!user) return newError(404, "User not found.");

    let thisTransaction;
    if (!detail) {
      thisTransaction = new Expenses({
        name: name,
        amount: amount,
        createdBy: userId,
        type: type,
      });
    } else if (detail) {
      thisTransaction = new Expenses({
        name: name,
        amount: amount,
        createdBy: userId,
        detail: detail,
        type: type,
      });
    }

    await thisTransaction?.save();
    user.expenses?.push(thisTransaction?._id);
    await user.save();

    res.status(200).json({
      message: "Successfully Created a transaction.",
      transactionName: thisTransaction?.name,
      transaction: [
        thisTransaction?._id,
        thisTransaction?.name,
        thisTransaction?.amount,
        thisTransaction?.createdAt,
      ],
    });
  } catch (err) {
    next(err);
  }
};

export const getTransactions: RequestHandler = async (req, res, next) => {
  const userId = req.userId;
  const page = +req.params.page || 1;
  const perPage = +req.params.limit || 5;

  const transactions: any[] = [];

  const totalItems = await Expenses.find().countDocuments();

  const expenses = await Expenses.find({ createdBy: userId })
    .skip((+page - 1) * perPage)
    .limit(perPage);

  const lastPage = Math.round(totalItems / perPage);

  expenses.forEach((transaction) => {
    if (!transaction.detail) {
      transactions.push([
        transaction._id,
        transaction.name,
        transaction.amount,
        transaction.createdAt,
      ]);
    }
    if (transaction.detail) {
      transactions.push([
        transaction._id,
        transaction.name,
        transaction.amount,
        transaction.createdAt,
        transaction.detail,
      ]);
    }
  });

  res.status(200).json({
    transactions: transactions,
    allTransactions: totalItems,
    lastPage: lastPage,
    currentPage: page,
  });
};

export const deleteTransaction: RequestHandler = async (req, res, next) => {
  // Delete the transaction by ID
  try {
    const transactionId = req.params.transactionId;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return newError(404, "user not found.");
    const filtered = user.expenses?.filter((cur) => {
      return cur.toString() !== transactionId.toString();
    });

    user.expenses = filtered;

    user.save();

    const transaction = await Expenses.findById(transactionId);

    if (!transaction) return newError(404, "Transaction not found.");

    if (transaction.createdBy.toString() !== userId.toString())
      return newError(403, "Not Authorized. / Forbidden.");

    const deletedTransaction = await Expenses.findByIdAndDelete(transactionId);

    res.json({
      message: "Deleted a transaction.",
      transactionName: deletedTransaction?.name,
      transactionId: deletedTransaction?._id,
    });
  } catch (err) {
    next(err);
  }
};
