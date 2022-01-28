import { validationResult } from "express-validator";
import { deleteFile } from "./fileHelper";
import newError from "./newError";

const validationErrCheck = (req: any) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return;

  // console.log(req.file, req.file.path.replace("\\", "/"));
  if (req.file) {
    // deleteFile();
  }
  // console.log(errors.array());

  newError(
    422,
    `Validation Error | at : ${errors.array()[0].param} | reason : ${
      errors.array()[0].msg
    }`
  );
};

export default validationErrCheck;
