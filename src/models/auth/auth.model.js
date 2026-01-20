import mongoose from "mongoose";
import { ROLE_VALUES, TOKEN_TYPES } from "../../constants/enums/index.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import { REGEX_PATTERNS } from "../../constants/regex/regexPatterns.js";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../../configs/env.js";
import { generateToken } from "../../utils/jwt.js";

//SINGLE auth source
const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function (v) {
          return REGEX_PATTERNS.EMAIL.STANDARD.test(v);
        },
        message: (props) => `${props.value} is not a valid email format`,
      },
    },

    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (v) {
          return REGEX_PATTERNS.PHONE.INTERNATIONAL.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },

    password: {
      // add validation
      type: String,
      // required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ROLE_VALUES,
      required: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
authSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password);
    console.log(this.password);
  }
});

authSchema.methods.comparePassword = async function (password) {
  return await comparePassword(password, this.password);
};

authSchema.methods.generateAccessToken = function () {
  return generateToken(
    { authId: this._id, email: this.email, role: this.role },
    ACCESS_TOKEN_SECRET,
    TOKEN_TYPES.ACCESS
  );
};

authSchema.methods.generateRefreshToken = function () {
  return generateToken(
    { authId: this._id, email: this.email, role: this.role },
    REFRESH_TOKEN_SECRET,
    TOKEN_TYPES.REFRESH
  );
};

const Auth = mongoose.model("Auth", authSchema);

export default Auth;
