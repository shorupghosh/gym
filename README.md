# 🏋️ Titan Gym Management SaaS

A modern, high-performance gym management platform built with **React**, **TypeScript**, and **Supabase**. This application streamlines gym operations with real-time analytics, automated member check-ins via QR codes, and a professional administrative dashboard.

![Titan Gym Dashboard](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 🌟 Key Features

### 🛡️ Administrative Suite
- **Interactive Dashboard:** Real-time visibility into active members, daily check-ins, and revenue metrics.
- **Smart Member Management:** Full CRUD operations with membership history tracking and automated status updates (Active/Expired).
- **QR Attendance System:** High-speed scanner (manual & camera-based) with real-time feedback and attendance heatmaps.
- **Advanced Analytics:** Visualize revenue growth, attendance trends, and member distribution with Recharts.
- **In-App Communications:** Broadcast notifications to all members or send targeted messages for individual follow-ups.

### 👤 Member Experience
- **Personalized Dashboard:** Members can see their workout logs, food intake (calories/macros), and check-in history.
- **Digital QR Key:** Quick and contactless gym entry using mobile-generated QR codes.
- **Goal Tracking:** Visual progress bars for nutrition and workout consistency.

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS 4, Motion, Lucide Icons.
- **Backend/Database:** Supabase (PostgreSQL, Real-time, Auth).
- **State Management:** React Context API with custom hooks (`useGym`).
- **Charts:** Recharts.
- **QR Scanning:** html5-qrcode.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Supabase Account** (Free tier works perfectly)

### 2. Installation
```bash
git clone https://github.com/your-username/titan-gym.git
cd titan-gym
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_api_key
```

### 4. Database Setup
Copy the SQL from `supabase_schema.md` (if provided) or initialize your Supabase instance with the following tables:
- `members`
- `membership_history`
- `plans`
- `attendance`
- `notifications`

### 5. Running the App
```bash
npm run dev
```

## 🔐 Security & Repository Standards
- **Secrets Management:** Environment variables are strictly managed via `.env` (omitted from version control).
- **Data Privacy:** Local SQLite databases are excluded from the repository to prevent leakage of PII (Personally Identifiable Information).
- **Code Quality:** TypeScript is enforced with strict mode for type safety.

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
