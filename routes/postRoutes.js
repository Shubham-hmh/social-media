
const express = require('express');
const { 
  createPost, updatePost,deletePost,getPostsByTags,getPostsByText,getTotalPosts,likePost,unlikePost,postComment,deletenestedComment,deleteComment,nestedPostComment,getPostComments,fetchPosts,
  fetchPost,
  getPostAllType,
  modifyComment,
  likeComment

} = require('../controllers/postController');
const auth = require("../utils/auth");

const {uploadPhoto} = require('../utils/cloudinary'); // Assuming multer setup for Cloudinary


const router = express.Router();


// Update a post
router.put('/:id',auth, updatePost);

// Delete a post
router.delete('/:id',auth, deletePost);

// Get posts based on tags
router.get('/hash', getPostsByTags);

// Get posts based on text
router.get('/search', getPostsByText);
router.post(
  '/create',
  auth,
  uploadPhoto.array('images', 5), 
  createPost
);
router.post("/postComment", auth, postComment);

router.get("/totalPosts/:id", auth, getTotalPosts);

router.get("/post/allTypes", auth ,getPostAllType);

// Appriciate Post using ID
router.post("/postAppriciate/:id", auth, likePost);
// UnAppriciate Post using ID
router.post("/postunAppriciate/:id", auth, unlikePost);
// Delete specific comment from the post
router.post("/deleteComment", deleteComment);
// Delete nested comments
router.post("/deletenestedComment", deletenestedComment);
// //POTS THE NESTED COMMENTS
router.post("/nestedComment", auth, nestedPostComment);
router.get("/getComments/:id", auth, getPostComments);

//get single user's all post with comments. 
router.get("/posts/:userId/:page", auth,  fetchPosts);
// Fetch Post with post ID(Individual Post)
router.get("/post/:id", auth ,fetchPost);
// Like or Unlike a comment
router.post('/like/:commentId', likeComment);
router.post('/modify/:commentId', modifyComment);

module.exports = router;

