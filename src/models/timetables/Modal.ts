import { Schema, Types, connection, model, ObjectId } from "mongoose";
import { ModalDataInterface } from "../types/modelType";

const ModalSchema = new Schema({
  modalName: { type: String, required: true },
  displayMode: { type: String, required: true },
  displayTo: { type: String, required: false },
  header: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
});

export default connection
  .useDb("timetables")
  .model<ModalDataInterface>("Modal", ModalSchema);
