import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null },
    // Set when a password reset is requested. We store only a hash of the
    // token (never the raw token) and an expiry; both are cleared on use.
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // UI preferences (Settings page). All have sensible defaults so existing
    // users keep the original look until they change anything.
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    monogramColor: { type: String, default: "#875cf5" }, // theme purple
    monogramCase: { type: String, enum: ["upper", "lower"], default: "upper" },
    monogramTextSize: {
      type: String,
      enum: ["sm", "md", "lg"],
      default: "md",
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare a plaintext password against the stored hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);
