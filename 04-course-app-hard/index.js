const express = require("express");
const app = express();
const mongoose = require("mongoose");
const SECRET = "my-secret-key";
const jwt = require("jsonwebtoken");

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
});

const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Course = mongoose.model("Course", courseSchema);

mongoose.connect(
  "mongodb+srv://skmanoj322:1234@cluster0.lzqieez.mongodb.net/courses",
  { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" }
);
const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      // console.log("sad", user);
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
// Admin routes
app.post("/admin/signup", async (req, res) => {
  // logic to sign up admin
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (admin) {
    return res.status(403).json({ message: "admin already exists" });
  } else {
    const newAdmin = new Admin({ username, password });
    await newAdmin.save();
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin created sucessfully", token });
  }
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1h",
    });
    return res.json({ message: "Admin created sucessfully", token });
  }
  res.status(403).json({ message: "Invalid username or password" });
});

app.post("/admin/courses", authenticateJwt, async (req, res) => {
  // logic to create a course
  const course = new Course(req.body);
  await course.save();
  res.json({ message: "Course created successfully", courseId: course.id });
});

app.put("/admin/courses/:courseId", async (req, res) => {
  // logic to edit a course
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
    new: true,
  });
  if (course) {
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

app.get("/admin/courses", authenticateJwt, async (req, res) => {
  // logic to get all courses
  const course = await Course.findOne({ username: req.user.username });
  res.json({ course });
});

// User routes
app.post("/users/signup", async (req, res) => {
  // logic to sign up user
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: "user already exists" });
  } else {
    const newUser = new User({ username, password });
    newUser.save();
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User created sucessfully", token });
  }
});

app.post("/users/login", (req, res) => {
  // logic to log in user
  const { username, password } = req.headers;
  const user = User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1h",
    });
    return res.json({ message: "User logged  sucessfully", token });
  }
  res.status(403).json({ message: "Invalid username or password" });
});

app.get("/users/courses", authenticateJwt, async (req, res) => {
  // logic to list all courses
  const courses = await Course.find({ published: true });
  res.json({ courses });
});

app.post("/users/courses/:courseId", authenticateJwt, async (req, res) => {
  // logic to purchase a course
  try {
    const course = await Course.findById(req.params.courseId);
    console.log(course);

    if (course) {
      console.log("username", req.user);
      const user = await User.findOne({ username: req.user.username });

      if (user) {
        user.purchasedCourses.push(course);
        await user.save();
        res.json({ message: "Course purchased successfully" });
      } else {
        res.status(403).json({ message: "User not found" });
      }
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/users/purchasedCourses", authenticateJwt, async (req, res) => {
  // logic to view purchased courses
  const user = await User.findOne({ username: req.user.username }).populate(
    "purchasedCourses"
  );
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
