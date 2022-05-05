import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { DateTime, Settings } from "luxon";
import path from "path";
import { Request } from "express";
Settings.defaultZone = "utc+7";

export const docFileFilter = (req: any, file: any, cb: any) => {
  console.log("Mime Type:", file.mimetype);

  const filetypes = /png|jpg|jpeg|JPG/; // filetypes you will accept
  const mimetype = filetypes.test(file.mimetype); // verify file is == filetypes you will accept
  const extname = filetypes.test(path.extname(file.originalname)); // extract the file extension
  // if mimetype && extname are true, then no error
  if (mimetype && extname) {
    return cb(null, true);
  }
  // if mimetype or extname false, give an error of compatibilty
  return cb("ไม่รองรับรูปแบบไฟล์|รูปแบบไฟล์ที่คุณอัพโหลดไม่รองรับ");
};

export const docFileStorage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    const pdfREG = /pdf/;
    if (file.mimetype.startsWith("image")) {
      if (
        req.path === "/timetables/newIcon" ||
        req.path === "/timetables/setNewHoliday"
      ) {
        cb(null, "documents");
      } else {
        cb(null, "images");
      }
    } else {
      req.uploadError = true;
    }
  },
  filename: (req, file, cb) => {
    const sanitizedOriginalName = file.originalname.replace(/ /g, "_");
    const dateAdded = DateTime.local();
    cb(
      null,
      `${dateAdded.day}${
        dateAdded.month < 10 ? "0" + dateAdded.month : dateAdded.month
      }${dateAdded.year}-${uuidv4()}.${
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
