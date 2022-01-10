import { validationResult } from "express-validator";
import newError from "./newError";

const validationErrCheck = (req: any) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return;

  console.log(errors.array());

  newError(422, `Validation Error: ${errors.array()[0].msg}`);
};

export default validationErrCheck;
