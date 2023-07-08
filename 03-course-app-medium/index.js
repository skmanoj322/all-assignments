const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
const secretKey = "superS3cr3t1";

const generateJwt = (user) => {
  const payload = { user: user };
  return jwt.sign({ user: user }, secretKey, { expiresIn: "1h" });
};
const authentecate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const { username, password } = req.body;
  const userExist = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (userExist) {
    return res.json({ message: "user already exists" });
  }
  ADMINS = [...ADMINS, req.body];
  generateJwt(username);
  res.status(200).json({ message: "updated sucessfully" });
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.headers;
  const user = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (user) {
    const token = generateJwt(username);
    return res.json({ message: "Logged in successfully", token: token });
  }
  res.status(400).json({ message: "unAutherized" });
  // logic to log in admin
});

app.post("/admin/courses", authentecate, (req, res) => {
  // logic to create a course
  const course = req.body;
  course.id = Date.now();
  COURSES = [...COURSES, course];
  res.json({ message: "Course created successfully", courseId: course.id });
});

app.put("/admin/courses/:courseId", (req, res) => {
  // logic to edit a course
});

app.get("/admin/courses", (req, res) => {
  // logic to get all courses
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
});

app.post("/users/login", (req, res) => {
  // logic to log in user
});

app.get("/users/courses", (req, res) => {
  // logic to list all courses
});

app.post("/users/courses/:courseId", (req, res) => {
  // logic to purchase a course
});

app.get("/users/purchasedCourses", (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
