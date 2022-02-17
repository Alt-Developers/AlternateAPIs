import { validationResult } from "express-validator";
import { deleteFile } from "./fileHelper";
import newError from "./newError";

const validationErrCheck = (req: any) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return;

  // console.log(req.file, req.file.path.replace("\\", "/"));
  if (req.file) {
    deleteFile(req.file.path);
  }
  // console.log(errors.array());

  newError(
    422,
    `Something Went Wrong|${errors.array()[0].msg}`,
    "Validation error",
    errors.array()[0].param
  );
};

export default validationErrCheck;
