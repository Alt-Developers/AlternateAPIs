import { model, Schema, connection } from "mongoose";
import { ExpensesInterface } from "./types";

const expensesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    detail: {
      type: String,
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const userDb = connection.useDb("Expenses");

export default userDb.model<ExpensesInterface>("Expenses", expensesSchema);
