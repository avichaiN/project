const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jwt-simple");
const saltRounds = 12;
const cookieParser = require("cookie-parser");
const path = require("path");

router.use(cookieParser());

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userFound = await User.findOne({
      $or: [{ username: username }, { email: username }],
    });

    hash = userFound.password;
    bcrypt.compare(password, hash, function (err, result) {
      if (result) {
        const token = jwt.encode(
          {
            id: userFound._id,
            role: userFound.role,
            username: userFound.username,
            name: userFound.firstName,
            time: new Date().getTime(),
          },
          process.env.SECRET
        );
        res.cookie("userLoggedIn", token, {
          maxAge: 7200000,
          httpOnly: true,
        });
        res.send({ status: "authorized" });
      } else {
        res.send({ status: "unauthorized" });
        res.end();
      }
    });
  } catch (e) {
    console.log(e);
    res.send({ status: "unauthorized" });
    res.end();
  }
});

router.post("/register", (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  const newUser = new User({
    email: email,
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: password,
  });

  bcrypt.hash(newUser.password, saltRounds, async function (err, hash) {
    try {
      newUser.password = hash;
      await newUser.save();

      const token = jwt.encode(
        {
          role: newUser.role,
          username: newUser.username,
          name: newUser.firstName,
          time: new Date().getTime(),
        },
        process.env.SECRET
      );
      res.cookie("userLoggedIn", token, {
        maxAge: 7200000,
        httpOnly: true,
      });
      res.send({ status: "authorized" });
    } catch (e) {
      console.log(e.message);
      res.send({ status: "unauthorized" });
      res.end();
    }
  });
});

router.get("/userInfo", (req, res) => {
  const token = req.cookies.userLoggedIn;
  if (token) {
    const decoded = jwt.decode(token, process.env.SECRET);

    res.send({ decoded });
  } else {
    res.send({ ok: false });
  }
});

router.get("/logout", (req, res) => {
  res.cookie("userLoggedIn", "", { expires: new Date(0) }); // this delete cookie (sets it to a date that is gone)
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});
router.get("/logout/user", (req, res) => {
  res.cookie("userLoggedIn", "", { expires: new Date(0) }); // this delete cookie (sets it to a date that is gone)

  res.send({ loggedout: true });
});
module.exports = [router];
