const { model, Schema } = require("mongoose");

// Complete Post Model
const postSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    images: [{
      type: String
    }],
    
    hashtags: [{
      type: String
    }],

    appreciate: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    improve: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],

  
    image: {
      type: Array,
    },
 
  
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
   
 

    likes: [
 
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },

    ],

    type: {
      type: String,
    },

 
    createdOn: {
      type: Date,
      default: Date.now,
    },

  },
  { timestamps: true }
);

postSchema.index({ category: 1 });

const Post = new model("post", postSchema);

Post.on("index", (error) => {
  error && console.log("post index", error);
});

module.exports = Post;
