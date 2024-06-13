const { model, Schema } = require("mongoose");

const commentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    userProfilePicture: { type: String },
    comment: { type: String, required: true },
    isPositive: { type: Boolean },
    child: [{ type: Schema.Types.ObjectId, ref: "NestedComment" }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true }
);

module.exports = model("Comment", commentSchema);
