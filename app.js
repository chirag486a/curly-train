const express = require("express");
const app = express();
const mongoose = require("mongoose");
let validator = require("email-validator");
const User = require("./model/Users");
const cookieParser = require("cookie-parser");
require('dotenv').config();


const PORT = 3000;
const mongoDbUri = process.env.DB_URI

app.set("view engine", "ejs");

(async function () {
  try {
    await mongoose.connect(mongoDbUri);
    console.log("Db connection success");
  } catch (err) {
    console.log(`something went wrong with db connection`);
  }
})();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index", {
    partial: "welcome",
    title: "Welcome",
  });
});
app.get("/register", (req, res) => {
  res.render("index", {
    partial: "register",
    title: "Register your account",
  });
});
app.post("/register", (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const err = [];

  if (!(password == confirmPassword)) {
    err.push("Password Donot match");
  }

  if (!validator.validate(email)) {
    err.push("Invalid Email");
  }

  if (err.length > 0) {
    res
      .status(400)
      .json({ success: false, error: err, data: null, redirect: null });
    return;
  }

  const newUser = new User({ firstName, lastName, email, password });
  newUser.save().then((user) => {
    console.log(user);
    res
      .status(201)
      .json({ success: true, redirect: "/login", data: user, err: null });
  });
});
app.get("/login", (req, res) => {
  res.render("index", {
    partial: "login",
    title: "Login to dashboard",
  });
});

app.post("/login", async (req, res) => {
  const loginUser = await User.findOne({ email: req.body.email });
  if (!loginUser) {
    res
      .status(404)
      .json({ status: "fail", message: ["Invalid email or password"] });
    return;
  }
  if (req.body.password && loginUser.password !== req.body.password) {
    res
      .status(404)
      .json({ status: "fail", message: ["Invalid email or password"] });
    return;
  }
  // One day to cookie to reset
  res.cookie("userId", loginUser._id.toString(), {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  console.log(loginUser);
  res
    .status(200)
    .json({
      status: "success",
      message: ["User validatation successfull"],
      data: { user: loginUser },
      redirect: "/dashboard",
    });
});
app.get("/dashboard", async (req, res) => {
  console.log(req.cookies.userId);
  if (!req.cookies.userId) {
    res.render("index", {
      partial: "welcome",
      title: "Welcome",
    });
    return;
  }
  const currentUser =  await User.findById(req.cookies.userId);
  console.log(currentUser)

  res.render("index", {
    partial: "dashboard",
    title: "Welcome to Dashboard",
    firstName: currentUser.firstName ? currentUser.firstName : 'Guest'
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie();
  res.render("index", {
    partial: "welcome",
    title: "Welcome to Dashboard",
  })
  
})

app.get("*", (req, res) => {
  res.render('index', {
    partial: 'noImplementation',
    title: 'Ops'
  })
})

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
