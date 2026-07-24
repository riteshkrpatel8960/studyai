import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  exam: String,
  year: Number,
  subject: String,
  topic: String,
  question: String,
  options: [String],
  answer: String,
  image: String
});

export default mongoose.model("Question", questionSchema);