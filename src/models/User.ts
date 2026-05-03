import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    language: { type: String, enum: ["pt", "en", "es"], default: "pt" },
    currency: { type: String, enum: ["BRL", "USD", "EUR"], default: "BRL" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
  }
);

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);
