const { model, Schema } = require("mongoose");

const nestedcommentSchema = new Schema(
  {
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    comment: { type: String, required: true },
    isPositive: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = model("NestedComment", nestedcommentSchema);
