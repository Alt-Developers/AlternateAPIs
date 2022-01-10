import { model, Schema, connection } from "mongoose";
import { ExpensesInterface } from "../types";

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

const db = connection.useDb("expenses");

export default db.model<ExpensesInterface>("Expenses", expensesSchema);
