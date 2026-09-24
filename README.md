# 💰 Expense Tracker & Financial Hub

A modern, full-stack **Expense Tracker** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **MongoDB (Mongoose)**. Designed with sleek dark aesthetics, interactive multi-chart visual analytics, a dedicated rich note-taking system with a single-line formatting toolbar, and a mobile-friendly touch/stylus handwriting sketchpad.

---

## ✨ Features

### 🔐 User Authentication & Personal Data Isolation
- **Secure Register & Login**: Fast sign up and sign in using `bcryptjs` password hashing and secure HTTP-Only JWT cookies.
- **Strict Data Privacy**: Zero shared or demo data. Every single transaction, chart, and note is strictly linked to each user's unique account.
- **Multi-user Ready**: Different users on the same instance only ever see their own personal data.

### 📊 Expense & Income Tracking
- **Income & Expense Management**: Easily record, edit, and delete transactions with amounts, categories, dates, tags, and notes.
- **Categorization**: Food & Dining, Transportation, Housing & Rent, Utilities, Entertainment, Shopping, Health & Fitness, Education, Salary, Freelance & Business, Investments, and more.
- **Payment Channels**: Cash, Credit Card, Debit Card, Online / UPI, Bank Transfer.
- **Link Notes to Expenses**: Connect your receipts, grocery checklists, or tax notes directly to transactions.
- **Search, Filter & Sort**: Real-time filtering by category, transaction type, date ranges, and full-text keyword search.

### 📈 Multiple Charts & Visual Analytics
- **Spending Timeline (Area Chart)**: Smooth gradient curve tracking daily inflow and outflow over time.
- **Category Breakdown (Donut Chart)**: Interactive percentage breakdown of spending by category with colored badges.
- **Cash Flow Comparison (Bar Chart)**: Monthly income vs. expenses side-by-side comparison.
- **Payment Channels (Horizontal Bar Chart)**: Distribution of spending across payment methods.
- **Time Range Selector**: View 7 Days, 30 Days, 90 Days, This Year, or All Time.

### 📝 Rich Notes & Mobile Handwriting ("Write Down Anything")
- **Single-Line Formatting Toolbar**:
  - Headings: `H1`, `H2`, `H3`, Normal text (`P`)
  - Typography: **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~
  - Text Color Picker: Palette of tailored colors
  - Highlighter: Highlight text in yellow, green, blue, pink
  - Lists: Bulleted lists, numbered lists, blockquotes
- **Mobile Touch Handwriting & Sketchpad**:
  - Full HTML5 touch-optimized canvas with zero page scrolling while drawing (`touch-action: none`).
  - Write notes, math calculations, receipt diagrams, signatures, or freehand sketches using your finger or stylus.
  - Multi-color pens, variable stroke widths (Fine, Medium, Marker), eraser, undo, and canvas clear.
  - Saves vector PNG drawings directly attached to your note cards.
- **Note Categories & Organization**:
  - Categories: *Budget Planning*, *Receipt & Bills*, *Shopping List*, *Financial Goals*, *Tax & Accounting*, *Investment Idea*, *General*.
  - Pin important notes to the top.
  - Color-accented note cards with glassmorphism styling.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- Local MongoDB running on `localhost:27017` (or a MongoDB Atlas connection URI)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
A `.env.local` file is already pre-configured for local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/expense_tracker
NEXT_PUBLIC_CURRENCY_SYMBOL=$
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to create your account and start tracking your personal expenses!

---

## ☁️ Deploying to Vercel

This project is fully optimized for **Vercel Serverless** deployment with cached MongoDB connections.

1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **"New Project"** -> **Import Git Repository**.
3. Under **Environment Variables**, add:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/expense_tracker?retryWrites=true&w=majority
     ```
   - *(Optional)* `NEXT_PUBLIC_CURRENCY_SYMBOL`: `$`
4. Click **Deploy**. Vercel will build and deploy your project automatically with zero configuration.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
