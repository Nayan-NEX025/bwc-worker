import mongoose, { Schema } from "mongoose";
import {
  ENQUIRY_STATUS,
  ENQUIRY_STATUS_VALUES,
} from "../../constants/enums/index.js";
import { REGEX_PATTERNS } from "../../constants/regex/regexPatterns.js";

const enquirySchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          // Indian mobile number OR international pattern
          return REGEX_PATTERNS.PHONE.INTERNATIONAL.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return REGEX_PATTERNS.EMAIL.STANDARD.test(v);
        },
        message: (props) => `${props.value} is not a valid email format`,
      },
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [200, "Message cannot exceed 200 characters"],
    },

    status: {
      type: String,
      enum: ENQUIRY_STATUS_VALUES,
      default: ENQUIRY_STATUS.NEW,
      index: true,
    },
  },
  { timestamps: true }
);

enquirySchema.index({ fullName: "text", message: "text" });

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;
