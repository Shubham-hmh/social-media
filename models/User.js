const { model, Schema } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
// User Model
const bcrypt=require("bcrypt");

const userSchema = new Schema(
  {
    isAdmin: {
      type: Boolean,
      default: false,
    },

  
    name: {
      type: String,
      required: true,
    },
  
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
          validator: (value) => {
              return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
          },
          message: props => `${props.value} is not a valid email address!`
      }
    },
    phone: {
      type: String,
      default: null,
    },
 
    password: {
      type: String,
      default: uuidv4,
    },
  
    expireAt: {
      type: Date,
    },
    profilePicture: {
      type: String,
    },
   
    likedPost: {
      type: [String],
    },

    Post: {
      type: [String],
    },

    following: {
      type: Array,
    },
    followers: {
      type: Array,
    },
  
    isPassword: {
      type: Boolean,
      default: false,
    },
  
    creationDate: {
      type: Date,
      default: Date.now,
  },
  },
  { timestamps: true }
);

userSchema.index({ username: 1 });
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 10 });


userSchema.pre("save",async function (next){
  if(!this.isModified("password")){
      next();
  }
  const salt =await bcrypt.genSaltSync(10);
  this.password=await bcrypt.hash(this.password,salt);

});

userSchema.methods.isPasswordMatched =async function (enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password);
}

const user = model("user", userSchema);


user.on("index", (error) => {
  error && console.log("user index", error);
});

module.exports = user;
