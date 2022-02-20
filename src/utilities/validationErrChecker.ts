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

  newError(
    422,
    `${errors.array()[0].msg.split("|")[0]}|${
      errors.array()[0].msg.split("|")[1]
    }`,
    "validation",
    errors.array()[0].param
  );
};

export default validationErrCheck;
