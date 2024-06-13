

const app = require("express");
const auth = require("../utils/auth");
const router = app.Router();
const {

  register,
  loginUserCtrl,
  getUser,createUser,updateUser,deleteUser,

  searchUserByName,

  getAllUsers,
 
  follow,
  unFollow,
  getFollowers,
  getFollowing,

 

} = require("../controllers/userController");


//register
router.post("/register",  register);
// login route
router.post("/login", loginUserCtrl);


//add user functionality ,name,phone,email e
router.post('/add',auth, createUser);

// Route to delete a user by ID
router.delete('/user/:id', auth, deleteUser);
// Route to update a user by ID
router.put('/user/:id', auth, updateUser);


// Route to get all users
router.get('/', auth, getAllUsers);

// Route to get a single user by ID
router.get('/user/:id', auth, getUser);

// Route to search users by name
router.get('/search', auth, searchUserByName);

// follow someone
router.post("/:friendId/follow",auth, follow);
//Unfollow someone
router.post("/:friendId/unfollow",auth, unFollow);
// //getFollowers
router.get("/followers/:userId", auth, getFollowers);
//getFollowing
router.get("/following/:userId", auth, getFollowing);


module.exports = router;
