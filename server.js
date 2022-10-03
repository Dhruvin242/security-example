const https = require("https");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const PORT = 5000;
require("dotenv").config();
require("./auth");

function isLogin(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

const app = express();
app.use(session({ secret: process.env.secretkey }));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get(
  "/Register",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/proctected",
    failureRedirect: "/auth/fail",
  })
);

app.get("/proctected", isLogin, (req, res) => {
  res.render("login", {
    username: req.user.displayName,
    useremail:req.user.email,
    userphoto:req.user.picture,
  });
  console.log(req.user);
});

app.get("/auth/fail", (req, res) => {
  res.send("You are fail to login!....");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy();
    res.redirect("/");
  });
});

https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(PORT, () => console.log(`Server is runnig on port on ${PORT}`));
