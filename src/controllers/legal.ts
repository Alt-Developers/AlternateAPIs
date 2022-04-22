import { RequestHandler } from "express";
import License from "../models/legal/License";
import newError from "../utilities/newError";
import validationErrCheck from "../utilities/validationErrChecker";

export const getLicense: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const licneseCode = req.params.code;

    const license = await License.findOne({ code: licneseCode });
    if (!license)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately. CODE[LIC0001]",
        "important"
      );

    return res.json({
      name: license.name,
      content: license.content,
    });
  } catch (error) {
    next(error);
  }
};
