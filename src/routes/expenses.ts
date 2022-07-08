// import { Router } from "express";
// import * as expensesController from "../controllers/expenses";
// import dCrypt from "../middleware/isAuth";
// import { body } from "express-validator";

// const router = Router();

// router.post(
//   "/addTransaction",
//   dCrypt,
//   [
//     body(
//       "amount",
//       "This filed [amount] is required to be filled and must be a number"
//     )
//       .isNumeric()
//       .not()
//       .isEmpty(),
//     body("name", "This filed [Name] must be filled").not().isEmpty(),
//   ],
//   expensesController.addTransaction
// );
// router.get("/getTransactions", dCrypt, expensesController.getTransactions);

// router.delete(
//   "/deleteTransaction/:transactionId",
//   dCrypt,
//   expensesController.deleteTransaction
// );

// export default router;
