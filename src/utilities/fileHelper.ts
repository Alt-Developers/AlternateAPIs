import fs from "fs";
import { ErrorInterface } from "../models/types";

export function deleteFile(filePath: string) {
  console.log(filePath);
  //@ts-ignore
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
}
