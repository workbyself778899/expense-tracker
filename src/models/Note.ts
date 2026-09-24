import mongoose, { Schema, Document, Model } from "mongoose";

export interface INoteDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string; // HTML formatted string
  plainText?: string;
  category: string;
  color: string;
  isPinned: boolean;
  handwritingDataUrl?: string; // Canvas base64 data for drawings / stylus handwriting
  tags: string[];
  linkedExpenseId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INoteDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: 150,
      default: "Untitled Note",
    },
    content: {
      type: String,
      default: "",
    },
    plainText: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    color: {
      type: String,
      default: "indigo",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    handwritingDataUrl: {
      type: String, // base64 representation of handwritten canvas sketch
    },
    tags: {
      type: [String],
      default: [],
    },
    linkedExpenseId: {
      type: Schema.Types.ObjectId,
      ref: "Expense",
    },
  },
  {
    timestamps: true,
  }
);

NoteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
NoteSchema.index({ userId: 1, category: 1 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).Note;
}

const Note: Model<INoteDocument> =
  mongoose.models.Note || mongoose.model<INoteDocument>("Note", NoteSchema);

export default Note;
