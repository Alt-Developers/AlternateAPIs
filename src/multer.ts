import path from "path";
import multer from "multer";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

export const docFileFilter = (req: any, file: any, cb: any) => {
  // console.log("Mime Type:", file.mimetype);

  const filetypes = /png|jpg|jpeg|JPG/; // filetypes you will accept
  const mimetype = filetypes.test(file.mimetype); // verify file is == filetypes you will accept
  const extname = filetypes.test(path.extname(file.originalname)); // extract the file extension
  // if mimetype && extname are true, then no error
  if (mimetype && extname) {
    return cb(null, true);
  }
  // if mimetype or extname false, give an error of compatibilty
  return cb("File Type unsupported");
};

export const docFileStorage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    const pdfREG = /pdf/;
    if (file.mimetype.startsWith("image")) {
      cb(null, "images");
    }
  },
  filename: (req, file, cb) => {
    const sanitizedOriginalName = file.originalname.replace(/ /g, "_");
    const dateAdded = Date.now();

    cb(
      null,
      `${dateAdded}-${uuidv4()}${
        file.mimetype.endsWith("png")
          ? ".png"
          : file.mimetype.endsWith("jpg")
          ? ".jpg"
          : file.mimetype.endsWith("jpeg")
          ? ".jpeg"
          : ".pdf"
      }`
    );
  },
});
