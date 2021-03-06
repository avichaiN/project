const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");

// Connection to DB
mongoose.connect(`${process.env.DATABASE_URL}`, {
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

// Routes
const authRouter = require("./s-routers/authRoute");
const categoryRouter = require("./s-routers/categoryRoute");
const adminRouter = require("./s-routers/adminRoute");
const updateUserDataRouter = require("./s-routers/updateUserDataRoute");
const postRouter = require("./s-routers/postRoute");
const commentsRouter = require("./s-routers/commentsRoute");

//Global Functions
const checkUserTokenLogin = require("./s-routers/gFunctions/checkUserTokenLogin");

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", authRouter);

app.get("/", checkUserTokenLogin, (req, res) => {
  // if fails to go in here (no valid token) goes to index.html-- else- goes to categoy page.
  res.sendFile(path.join(__dirname, "./public", "Categories.html"));
});

app.use("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

app.use("/category", categoryRouter);

app.use("/admin", adminRouter);

app.use("/updateUserData", updateUserDataRouter);

app.use("/posts", postRouter);

app.use("/comments", commentsRouter);



app.use(express.static(path.join(__dirname, "public")));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "Categories.html"));
})

app.listen(port, () => console.log(`Server Live On Port: ${port}`));
