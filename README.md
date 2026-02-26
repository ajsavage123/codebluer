# Medhic - EMS Community App

A trusted, professional platform exclusively built for Emergency Medical Technicians (EMTs) and Paramedics to connect, share insights, compare compensation accurately, and seamlessly grow their clinical careers.

## 🚀 Vision

The EMS community is often fragmented, with critical information like localized salary data, certification tips, and clinical leadership discussions scattered across disparate groups. **MedicConnect** consolidates these necessary resources into one engaging, easy-to-use, professional hub tailored specifically for those on the frontlines of pre-hospital medicine.

## 🌟 Key Features

- **Specialized Discussion Rooms** - Join localized and topic-specific rooms (e.g., Salary Discussions, Career Advice, Clinical Leadership, Certifications).
- **Anonymous Salary Insights** - Safely share and compare granular compensation data filtered by location, certification level (EMT-B, AEMT, Medic), and role, ensuring fair market visibility.
- **Curated Career Tools** - Access specific calculators, continuing education resources, and localized protocols instantly.
- **Verified User Profiles** - Build a solid professional identity highlighting your specific certifications and clinical experience within the community.
- **Real-time Live Chat** - Engage in dynamic live discussions, Q&As, and casual debriefs with fellow EMS professionals.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui (Accessible, customizable components)
- **Backend & Authentication**: Supabase
- **Database**: PostgreSQL (Leveraging Row Level Security for strict data protection)
- **Routing**: React Router DOM

## 📂 Project Structure

```text
src/
├── components/       # Core Reusable UI components
│   ├── home/        # Home screen & trending feeds
│   ├── layout/      # Universal layout, Header, Bottom Navigation
│   ├── posts/       # Post rendering & interaction
│   ├── profile/     # User profile, badges, & avatars
│   ├── rooms/       # Real-time Chat logic (Live chats, Q&A formats, Threads)
│   ├── tools/       # Toolcards, calculators, and utilities
│   └── ui/          # Granular shadcn/ui design system primitives
├── contexts/        # Shared global state (AuthContext)
├── hooks/           # Custom React hooks containing abstracted logic
├── pages/           # High-level full-page components / routes
├── integrations/    # External service configurations (e.g., Supabase)
└── types/           # Strict TypeScript interfaces and definitions
```

## 📝 Recent Updates & Changelog

### Version 1.1 (Latest)
*   **Whitelabeling & Brand Identity:** Completely stripped out all boilerplate third-party tracking, meta tags, and placeholder branding (e.g., Lovable).
*   **Authentication Flow Refactor:** Migrated directly to standard Supabase Auth methods to allow for cleaner Google OAuth integration without intermediate wrappers.
*   **Iconography:** Deployed a custom brand-aligned SVG favicon, completely cementing a unique, sterile medical identity across all browser tabs.
*   **Repository Synchronization:** Actively synced changes to `ajsavage123/medcommunity` repo, ensuring a seamless, automated Vercel CI/CD deployment pipeline.

## 💻 Getting Started

### Prerequisites
- Node.js 18+ 
- npm (Node Package Manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ajsavage123/medcommunity.git
   ```

2. **Navigate to the core directory**
   ```bash
   cd medhic-main
   ```

3. **Install exact dependencies**
   ```bash
   npm install
   ```

4. **Initialize Local Development Server**
   ```bash
   npm run dev
   ```

## 🛡 License

This project is private and strictly proprietary to MedicConnect.
