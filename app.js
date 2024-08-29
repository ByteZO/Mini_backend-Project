const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const UserModel = require("./models/User.model");
const PostModel = require("./models/Post.model");
const jwt = require("jsonwebtoken");
const { nextTick } = require("process");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
express.static(path.join(__dirname, "public"));
app.use(cookieParser());

const checkloggedIn = (req, res, next) => {
  if (req.cookies.token === "") {
    res.redirect("/login");
  } else {
    const userData = jwt.verify(req.cookies.token, "huhu");

    req.user = userData;
    next();
  }
};

const goToProfile = (req, res, next) => {
  if (req.cookies.token === "") {
    next();
  } else res.redirect("/profile");
};

app.get("/", goToProfile, (req, res) => {
  res.render("index");
});

app.post("/register", async (req, res) => {
  const { name, userName, age, email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (user) res.status(500).send("User is already registered");
  else {
    bcrypt.genSalt(5, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        console.log("hash : ", hash);

        const newUser = await UserModel.create({
          name,
          age,
          userName,
          email,
          password: hash,
        });
        const token = jwt.sign({ email, userId: newUser._id }, "huhu");
        console.log("token : ", token);

        res.cookie("token", token);
        res.status(200).redirect("/profile");
      });
    });
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) res.status(404).send("this User Dose not exist");
  else {
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        const token = jwt.sign({ email, userId: user._id }, "huhu");
        console.log("token : ", token);

        res.cookie("token", token);
        res.status(200).redirect("/profile");
      } else res.redirect("/login");
    });
  }
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/profile", checkloggedIn, async (req, res) => {
  const user = await UserModel.findOne({ email: req.user.email }).populate(
    "post"
  );

  console.log(user);

  res.status(200).render("profile", { user });
});

app.post("/post", checkloggedIn, async (req, res) => {
  const user = await UserModel.findOne({ email: req.user.email });
  const { content } = req.body;

  const post = await PostModel.create({
    user: user._id,
    content: content,
  });

  user.post.push(post._id);
  await user.save();

  console.log(post);

  res.status(200).redirect("/profile");
});

app.get("/likes/:id", checkloggedIn, async (req, res) => {
  const post = await PostModel.findOne({ _id: req.params.id }).populate("user");

  if (post.Likes.indexOf(req.user.userId)) {
    post.Likes.push(req.user.userId);
  } else {
    post.Likes.splice(post.Likes.indexOf(req.user.userId, 1));
  }
  await post.save();

  res.redirect("/profile");
});

app.get("/edit-post/:Id", checkloggedIn, async (req, res) => {
  const post = await PostModel.findOne({ _id: req.params.Id }).populate("user");
  res.render("editPost", { post });
});

app.post("/update-post/:Id", checkloggedIn, async (req, res) => {
  const post = await PostModel.findOneAndUpdate(
    { _id: req.params.Id },
    {
      content: req.body.content,
    }
  );

  res.redirect("/profile");
});

app.listen(3000);
