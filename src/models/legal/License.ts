import { ObjectId } from "mongodb";
import { Schema, Types, connection, model } from "mongoose";
import { codeInterface, LicenseInterface } from "../types";

const licenseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const db = connection.useDb("legal");

export default db.model<LicenseInterface>("License", licenseSchema);
