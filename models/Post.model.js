const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://miniprojectUser:mini2551@cluster0.t3mxm.mongodb.net/miniPrject"
);

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  content: String,
  Likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

module.exports = mongoose.model("post", postSchema);
