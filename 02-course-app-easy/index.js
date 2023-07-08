const express = require("express");
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const userExist = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (userExist) {
    next();
  } else {
    res.status(404).send("invalid user name password");
  }
};
const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(
    (a) => a.username === username && a.password === password
  );

  if (user) {
    next();
  } else {
    res.json({ message: "unautharized user" });
  }
};
// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const userExist = ADMINS.find((a) => a.username === admin.username);
  if (!userExist) {
    ADMINS = [...ADMINS, admin];
    return res.status(200).json(admin);
  }
  res.status(400).send("user already exists");
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  // logic to log in admin
  res.json({ message: "Logged in successfully" });
});

app.post("/admin/courses", adminAuthentication, (req, res) => {
  // logic to create a course
  const course = req.body;
  course.id = Date.now();
  COURSES = [...COURSES, course];
  res.json({ message: "Course created successfully", courseId: course.id });
});

app.put("/admin/courses/:courseId", adminAuthentication, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((a) => a.id === courseId);
  console.log(course);
  if (course) {
    Object.assign(course, req.body);
    return res.json({ message: "Course updated successfully" });
  }
  res.json({ message: "element not" });
});

app.get("/admin/courses", adminAuthentication, (req, res) => {
  // logic to get all courses

  res.json({ cources: COURSES });
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
  const user = USERS.find((a) => a.username === req.body.username);
  const userDetail = req.body;
  if (user) {
    return res.json({ message: "user already exist" });
  }
  USERS = [...USERS, userDetail];
  res.json({ message: "User created successfully" });
});

app.post("/users/login", userAuthentication, (req, res) => {
  // logic to log in user
  res.json({ message: "login sucessfull" });
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
