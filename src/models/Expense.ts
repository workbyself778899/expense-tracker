import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpenseDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  date: Date;
  paymentMethod: string;
  notes?: string;
  tags?: string[];
  linkedNoteId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 120,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      default: "Food & Dining",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      default: "Cash",
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    linkedNoteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
    },
  },
  {
    timestamps: true,
  }
);

ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, type: 1 });
ExpenseSchema.index({ userId: 1, category: 1 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).Expense;
}

const Expense: Model<IExpenseDocument> =
  mongoose.models.Expense || mongoose.model<IExpenseDocument>("Expense", ExpenseSchema);

export default Expense;
