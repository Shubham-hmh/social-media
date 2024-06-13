
const fs = require("fs");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const NestedComment = require("../models/NestedComment");
const {cloudinaryUploadImg} = require('../utils/cloudinary');



// create post 
module.exports.createPost = async (req, res) => {
  // const { text, hashtags, userId} = req.body;
  // const errors = [];
  // // Validation
  // if (!text || text.trim() === "") {
  //   errors.push({ msg: "Text field is required" });
  // }
  // if (req.files.length <= 0) {
  //   errors.push({ msg: "Please upload a valid image file" });
  // }
  // if (!Array.isArray(hashtags) || hashtags.length === 0) {
  //   errors.push({ msg: "At least one hashtag is required" });
  // }

  // if (errors.length !== 0) {
  //   return res.status(400).json({ errors });
  // }


 

  // try {
  //   // Upload images to Cloudinary
  //   const uploader = (path) => cloudinaryUploadImg(path, "posts");
  //   const urls = [];
  //   const files = req.files;
  //   for (const file of files) {
  //     const { path } = file;
  //     const newpath = await uploader(path);
  //     urls.push(newpath.url);
  //     fs.unlinkSync(path);
  //   }

  //   // Create post entry
  //   const newPost = new Post({
  //     text,
  //     hashtags,
  //     createdOn: new Date(),
  //     userId,
  //     images: urls,
   
  //   });

  //   // Save post to database
  //   await newPost.save();

  //   // Update user's posts
  //   const user = await User.findById(userId);
  //   if (user) {
  //     user.Post.push(newPost._id);
  //     await user.save();
  //   }

  //   res.status(201).json({
  //     msg: "Post created successfully",
  //     post: newPost
  //   });
  // } catch (error) {
  //   console.error("Error creating post:", error);
  //   res.status(500).json({ errors: [{ msg: error.message }] });
  // }


  const { text, hashtags, userId } = req.body;
  const errors = [];
  
  console.log("Received create post request:", { text, hashtags, userId, files: req.files });

  // Validation
  if (!text || text.trim() === "") {
    errors.push({ msg: "Text field is required" });
  }
  if (!req.files || req.files.length <= 0) {
    errors.push({ msg: "Please upload a valid image file" });
  }
  if (!Array.isArray(hashtags) || hashtags.length === 0) {
    errors.push({ msg: "At least one hashtag is required" });
  }

  if (errors.length !== 0) {
    console.log("Validation errors:", errors);
    return res.status(400).json({ errors });
  }

  try {
    console.log("Uploading images to Cloudinary...");
    const uploader = (path) => cloudinaryUploadImg(path, "posts");
    const urls = [];
    const files = req.files;

    for (const file of files) {
      const { path } = file;
      console.log(`Uploading file: ${path}`);
      const newpath = await uploader(path);
      console.log(`Uploaded file URL: ${newpath.url}`);
      urls.push(newpath.url);
      fs.unlinkSync(path);
      console.log(`Deleted local file: ${path}`);
    }

    console.log("Creating new post entry...");
    const newPost = new Post({
      text,
      hashtags,
      createdOn: new Date(),
      userId,
      images: urls,
    });

    console.log("Saving new post to database...");
    await newPost.save();

    console.log("Updating user's posts...");
    const user = await User.findById(userId);
    if (user) {
      user.Post.push(newPost._id);
      await user.save();
    }

    console.log("Post created successfully:", newPost);
    res.status(201).json({
      msg: "Post created successfully",
      post: newPost
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ errors: [{ msg: "Internal server error. Please try again later." }] });
  }
};


// update post 
module.exports.updatePost =async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
      const updatedPost = await Post.findByIdAndUpdate(
          id,
          { $set: req.body },
          { new: true }
      );

      res.json(updatedPost);
  } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//delete post 
module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
      const deletedPost = await Post.findByIdAndDelete(id);
      res.json({ msg: "Post deleted successfully", post: deletedPost });
  } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//fetch post by hashtags

module.exports.getPostsByTags = async (req, res) => {
  const { tags } = req.query;

  try {
      const posts = await Post.find({ hashtags: { $in: tags } }).populate({
        path: "userId",
        model: "user",
      })
      .populate({
        path: "comments",
        model: "Comment",
      });
      res.json(posts);
  } catch (error) {
      console.error("Error fetching posts by tags:", error);
      res.status(500).json({ errors: [{ msg: error.message }] });
  }
};


//fetch post by text
module.exports.getPostsByText = async (req, res) => {
  const { searchText } = req.query;

  try {
      const posts = await Post.find({ text: { $regex: searchText, $options: "i" } }).populate({
        path: "userId",
        model: "user",
      })
      .populate({
        path: "comments",
        model: "Comment",
      });
      ;
      res.json(posts);
  } catch (error) {
      console.error("Error fetching posts by text:", error);
      res.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//fetching all the posts created by a particular user
module.exports.fetchPosts = async (req, res) => {
  const { userId, page } = req.params;
  try {
    const limit = 3;
    const result = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit * 1)
      .populate({
        path: "userId",
        model: "user",
      })
      .populate({
        path: "comments",
        model: "Comment",
        populate: [
          {
            path: "userId",
            model: "user",
          },
          {
            path: "child",
            model: "NestedComment",
            populate: {
              path: "userId",
              model: "user",
            },
          },
        ],
      });

    let filteredPosts = result;

    if (filteredPosts.length > 0) {
      

      res.status(201).json({ msg: "success", posts: filteredPosts });
    } else {
      res.status(200).json({ msg: "No posts" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal error" });
  }
};

//get total posts count of a user
module.exports.getTotalPosts = async (req, res) => {
  try {
    const totalPosts = await Post.find({ userId: req.params.id }).count();
    res.status(200).json({ totalPosts });
  } catch (error) {
    res.status(500).json({ msg: "Internal error" });
  }
};

// Appriciate/like a Particular Post
module.exports.likePost = async (req, res) => {
  const postId = req.params.id;
  const { userId, type } = req.body;
  try {
    let post = await Post.findById(postId).populate("userId", "--password");
    post.appreciate = post.appreciate || [];
    post.improve = post.improve || [];
    let flag = type == "appreciate";
    if (flag) {
      post.appreciate.push(userId);
    } else {
      post.improve.push(userId);
    }
    await post.save();

  
    return res.status(200).json(post);
  } catch (e) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Unappriciate/unlike a Particular Post
module.exports.unlikePost = async (req, res) => {
  try {
    console.log("unlikePost running...");
    const postId = req.params.id;
    const userId = req.body.userId;
    const type = req.body.type;

    var post;
    if (type == "unappreciate") {
      post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { appreciate: userId },
        },
        { new: true }
      );

    } else {
      post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { improve: userId },
        },
        { new: true }
      );
    }
    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// Delete reply of parent comment 
module.exports.deletenestedComment = async (req, res) => {
  const { parentId, cmtID } = req.body;
  try {
    console.log(parentId);
    console.log(cmtID);
    const nestedCmt = await Comment.findByIdAndDelete(cmtID);
    const updatedCmt = await Comment.findByIdAndUpdate(
      parentId,
      {
        $pull: { child: cmtID },
      },
      { new: true }
    );
    console.log(nestedCmt);
    console.log(updatedCmt);
    res.status(200).json({ success: true, updatedCmt });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//It is basically reply of comment. so that it is considered as a parent comment or child comment. 
module.exports.nestedPostComment = async (req, res) => {
  const { parentId, comment, isPositive, userId } = req.body;
  try {
    // creating nested comment
    console.log("parentid", parentId);
    const nestedCmt = await NestedComment.create({
      parent: parentId,
      comment: comment,
      isPositive,
      userId,
    });

    // adding nested comment to the parent comment
    const newdoc = await Comment.findByIdAndUpdate(
      parentId,
      { $push: { child: nestedCmt?._id } },
      { new: true }
    );

    const cmt = await NestedComment.findById(nestedCmt._id)
      .populate("parent")
      .populate("userId");
    console.log(cmt);
    res.status(200).json({ success: true, cmt });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Post Comment on a particular post
module.exports.postComment = async (req, res) => {
  const { post, user, comment, isPositive } = req.body;
  try {
    const postt = await Post.findById(post._id).populate("userId");
    console.log("control reached", comment);
    const cmntt = await Comment.create({
      postId: postt._id,
      userId: user._id,
      userProfilePic: user.profilePicture,
      comment,
      isPositive,
    });

 


    postt.comments = postt.comments || [];
    postt.comments.unshift(cmntt._id);
  
    await postt.save();

  

    const cmnt = await Comment.findById(cmntt._id).populate("userId");
   
    return res.status(200).json({ success: true, cmnt, postt });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Fetching comments on each Post
module.exports.getPostComments = async (req, res) => {
  const { id } = req.params;
  const page = req.query.page;
  console.log(page, "India");
  try {
    const post = await Post.findById(id).populate({
      path: "comments",
      model: "Comment",
      populate: [
        {
          path: "userId",
          model: "user",
        },
        {
          path: "child",
          model: "NestedComment",
          populate: {
            path: "userId",
            model: "user",
          },
        },
      ],
    });
    const comments = post.comments.slice((page - 1) * 10, page * 10);
    if (comments.length) return res.status(200).json({ comments });
    return res.status(201).json({ msg: "no more comments found." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

//functionality for deletion of specific comment
module.exports.deleteComment = async (req, res) => {
  try {
    const id = req.body.postId;
    const commentId = req.body.commentId;
    console.log("checking", id, commentId);
    const comment = await Comment.findByIdAndDelete(commentId);
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $pull: { comments: commentId },
      },
      { new: true }
    );
    await NestedComment.deleteMany({ parent: commentId });
    res.json({ post, commentId, flag: true });
  } catch (error) {
    console.log("delete cmnt catch", error);
    return res.status(400).json({ error });
  }
};

//get single post with comments
module.exports.fetchPost = async (req, res) => {
  // console.log(req);
  const id = req.params.id;
  try {
    const post = await Post.findOne({ uniqueId: id })
      .populate({
        path: "userId",
        model: "user",
      })
      .populate({
        path: "comments",
        model: "Comment",
        populate: {
          path: "userId",
          model: "user",
        },
        populate: {
          path: "child",
          model: "NestedComment",
        },
      });
    if (post) {
      res.status(200).json({ success: true, post });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};


//get all post data. 
module.exports.getPostAllType = async (req, res) => {
  try {
    const post = await Post.find()
      .populate({
        path: "userId",
        model: "user",
      })
      .populate({
        path: "comments",
        model: "Comment",
      });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Modify a Comment on a particular post
module.exports.modifyComment = async (req, res) => {
  const { commentId, newComment } = req.body;
  try {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { comment: newComment },
      { new: true }
    );
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    return res.status(200).json({ success: true, comment });
  } catch (error) {
    console.error("Error modifying comment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Like or Unlike a Comment on a particular post
module.exports.likeComment = async (req, res) => {
  const { commentId, userId } = req.body;
  try {
    let comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    // Check if the user has already liked the comment
    const index = comment.likes.indexOf(userId);
    if (index === -1) {
      // If user hasn't liked, add like
      comment.likes.push(userId);
    } else {
      // If user has liked, remove like
      comment.likes.splice(index, 1);
    }
    await comment.save();
    return res.status(200).json({ success: true, comment });
  } catch (error) {
    console.error("Error liking/unliking comment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




