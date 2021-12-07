import { Schema, model, connection } from "mongoose";

const countSchema: Schema = new Schema({
  apiName: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
});

const system13Db = connection.useDb("system13");

export default system13Db.model("Count", countSchema);
