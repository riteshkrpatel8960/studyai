import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import Student from "./models/Student.js";
import Question from "./models/Question.js";
import { sendOTPEmail } from "./utils/mailer.js";
import connectDB from "./db.js";



dotenv.config();
connectDB();




// ---------------- BASIC SETUP ----------------

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));   // serve html files
app.use(cors());
app.use(express.json());


// ---------------- TEMP DATABASE ----------------


app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Student.create({
      name,
      email,
      password: hashedPassword
    });

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ---------------- LOGIN ----------------

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });

    // ❌ Email galat
    if (!student) {
      return res.json({ status: "fail", msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    // ❌ Password galat
    if (!isMatch) {
      return res.json({ status: "fail", msg: "Invalid password" });
    }

    // ✅ Login success
    res.json({
      status: "ok",
      userId: student._id,
      name: student.name,
      email: student.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", msg: "Login error" });
  }
});


// ---------------- AI ASK (GROQ) ----------------

app.post("/ask", async (req, res) => {
  try {
    const question = req.body.question;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are a friendly teacher. Always reply in clear English. Never use Hindi. Explain with definition, formula and one example. Do not create questions."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      }
    );

    const data = await response.json();

    let answer = "";

    if (data.choices && data.choices.length > 0) {
      answer = data.choices[0].message.content || "";
    }

    if (!answer) {
      console.log("Groq raw response:", data);
      answer = "AI response empty";
    }

    res.json({ answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      answer: "AI error, please try again later."
    });
  }
});

// ---------------- AI EXAM GENERATOR ----------------

app.post("/exam", async (req, res) => {
  try {
    const { topic, course } = req.body;

    const examPrompt = `
You are an exam paper generator.
Create a ${course} level exam from this topic:
"${topic}"
Include MCQ and numerical questions with answers.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You generate exam papers only." },
            { role: "user", content: examPrompt }
          ]
        })
      }
    );

    const data = await response.json();
    res.json({ paper: data.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ paper: "Exam generation failed" });
  }
});

// ---------------- DUMMY API ----------------

app.post("/api/generate", (req, res) => {
  let topic = req.body.topic;

  res.json({
    q1: "What is " + topic + "?",
    a1: topic + " is a technology used in computers.",
    q2: "Who is the father of " + topic + "?",
    a2: "Dennis Ritchie"
  });
});
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
    

    // Save OTP + expiry (5 minutes)
    student.resetOTP = await bcrypt.hash(otp, 10);
    student.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await student.save();

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});
app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const student = await Student.findOne({ email });
    if (!student || !student.resetOTP || !student.otpExpiry) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (student.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, student.resetOTP);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    student.password = await bcrypt.hash(newPassword, 10);
    student.resetOTP = undefined;
    student.otpExpiry = undefined;
    await student.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
  console.error("FORGOT PASSWORD ERROR 👉", err);
  res.status(500).json({
    message: err.message || "Something went wrong"
  });
}

});

app.get("/api/questions", async (req, res) => {
  try {

    const { exam, subject, topic, paperSet } = req.query;

    let filter = {};

    if (exam) filter.exam = exam;
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (paperSet) filter.paperSet = Number(paperSet);

    const questions = await Question.find(filter);

    res.json(questions);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Questions fetch failed"
    });

  }
});


app.get("/", (req, res) => {
  res.send("StudyAI Backend Running 🚀");
});

// ---------------- START SERVER (LAST LINE) ----------------

app.listen(3000, () => {
  console.log("✅ StudyAI server running on http://localhost:3000");
});


