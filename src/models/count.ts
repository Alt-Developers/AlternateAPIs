import { Schema, model } from "mongoose";

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

export default model("Count", countSchema);
