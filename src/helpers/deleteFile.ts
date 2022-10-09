import fs from "fs";

export default (filePath: string) => {
  if (filePath.split("/").includes("default.png")) return;

  fs.stat(filePath, (err, stat) => {
    if (!err) {
      fs.unlink(filePath, (err) => {
        if (err) {
          throw err;
        }
      });
      return 0;
    } else if (err.code === "ENOENT") {
      return 0;
    } else {
      return err;
    }
  });
};
