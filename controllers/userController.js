const User = require("../models/User");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");

// register user
module.exports.register = async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    res.json({ msg: "User Already Exists!" });


    throw new Error("User Already Exists!");
  }
};


//For user login with email and password that generate token for authorization
module.exports.loginUserCtrl = async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email: email });

  if (findUser && await findUser.isPasswordMatched(password)) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(findUser._id, {
      refreshToken: refreshToken,
    }, { new: true });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.json({
      _id: findUser._id,

      token: generateToken(findUser._id)
    });
  } else {
    throw new Error("Invalid Credentials!");
  }
};

// add User 
module.exports.createUser = async (req, res) => {
  const { name, phone, email } = req.body;
  try {
    const userExists = await User.findOne({ $or: [{ phone }, { email }] });
    if (userExists) {
      res.status(400);
      throw new Error('User with this phone number or email already exists');
    }
    const user = await User.create({ name, phone, email });
    res.status(201).json(user);
  } catch (error) {
    throw new Error(error);
  }
};

// Update User
module.exports.updateUser = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const { name, phone, email } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    await user.save();
    res.json(user);
  } catch (error) {
    throw new Error(error);
  }
};

// Delete User
module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    throw new Error(error);
  }
};

// Get All Users
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    throw new Error(error);
  }
};

// Get Single User
module.exports.getUser = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  } catch (error) {
    throw new Error(error);
  }
};

// Search Users by Name
module.exports.searchUserByName = async (req, res) => {
  const { name } = req.query;
  try {
    const users = await User.find({ name: new RegExp(name, 'i') });
    res.json(users);
  } catch (error) {
    throw new Error(error);
  }
};



module.exports.follow = async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const friend = await User.findById(req.params.friendId);
    if (!friend.followers.includes(req.body.userId)) {
      await friend.updateOne({ $push: { followers: req.body.userId } });
      await currentUser.updateOne({
        $push: { following: req.params.friendId },
      });
      res.status(200).json({
        msg: "User has been followed.",
        following: currentUser.following,
      });
    } else {
      res.status(403).json("You already follow this user.");
    }
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
};

module.exports.unFollow = async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const friend = await User.findById(req.params.friendId);
    if (friend.followers.includes(req.body.userId)) {
      await friend.updateOne({ $pull: { followers: req.body.userId } });
      await currentUser.updateOne({
        $pull: { following: req.params.friendId },
      });
      res.status(200).json({
        msg: "User has been unfollowed.",
        following: currentUser.following,
      });
    } else {
      res.status(403).json("You already unfollowed this user.");
    }
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
};

// get specific user follower. 

module.exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const followers = await Promise.all(
      user.followers.map((followersId) => {
        return User.findById(followersId);
      })
    );
    // console.log(followers);
    let followersList = [];
    followers.map((follower) => {
      const { _id, username, profilePicture } = follower;
      followersList.push({ _id, username, profilePicture });
    });
    res.status(201).json({ followers: followersList });
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

// get specific user following. 

module.exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const following = await Promise.all(
      user.following.map((followingId) => {
        return User.findById(followingId);
      })
    );
    // console.log(followers);
    let followingList = [];
    following.map((following) => {
      const { _id, username, profilePicture } = following;
      followingList.push({ _id, username, profilePicture });
    });
    res.status(201).json({ following: followingList });
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

























