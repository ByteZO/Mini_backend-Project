const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://miniprojectUser:mini2551@cluster0.t3mxm.mongodb.net/miniPrject"
);

const userSchema = mongoose.Schema({
  userName: String,
  name: String,
  email: String,
  age: Number,
  password: String,
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
