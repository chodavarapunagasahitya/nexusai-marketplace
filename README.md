# NexusAI: AI Content Creator Marketplace 🚀

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/chodavarapunagasahitya/nexusai-marketplace)

An intelligent, full-stack marketplace connecting businesses, brands, founders, and students with high-caliber AI content creators (short-form video directors, prompt architects, generative 3D artists, and executive ghostwriters). NexusAI integrates automated project escrow workflows, real-time multi-modal AI generation, semantic creator matching, and two groundbreaking unique features.

---

## 🌟 Unique Platform Innovations

### 🛡️ Feature 1: AI Content Authenticity & Originality Assistant
A dedicated intelligence module that inspects generated or uploaded content for:
- **Internal Database & Pattern Similarity:** Detects formulaic phrases and repetitive syntactic cadences commonly produced by low-entropy AI outputs.
- **Generic Cliché Detection:** Identifies overused filler phrases (e.g., *"in today's fast-paced digital world"*, *"testament to"*, *"game-changer"*).
- **Missing Empirical Citations:** Flags unverified percentages, study references, and metrics, suggesting attribution standards.
- **Distinctive Rewrite Generator:** Transforms generic text into authoritative, active-voice copy.
- **Transparent Ethical Disclosure:** Clearly states that analysis provides heuristic similarity and distinctiveness scores based on platform patterns rather than definitive proof of human authorship.

### 📡 Feature 2: Creator Skill Evolution & Opportunity Radar
An advanced career-scaling engine for creators:
- **6-Vector Competency Matrix:** Evaluates *Generative Tool Mastery*, *Retention & Hook Engineering*, *Prompt Architecture*, *Multi-Modal Direction*, *Commercial Polish & Grading*, and *Enterprise Content Strategy* against real-time buyer demand vectors.
- **Surging Skills Catalog:** Surfaces high-yield emerging content skills (e.g. *Runway Gen-3 Camera Constraints*, *Interactive Spline 3D Embeds*, *SEO Semantic Entity Clusters*).
- **Forecasted Project Opportunities:** Predicts matching client briefs and estimated contract budgets (explicitly labeled as **Marketplace Estimates**).
- **Personalized 4-Week Learning Roadmap:** Step-by-step weekly milestone action items with estimated hours to achieve production-grade mastery.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide Icons, React Router DOM v6 |
| **Backend** | Node.js, Express 4, JWT (`jsonwebtoken`), `bcryptjs`, REST API |
| **Database** | MongoDB via Mongoose + Resilient persistent local fallback store (works out of the box with zero setup) |
| **Styling** | Luxury Warm Obsidian (`#0c0a09`, `#1c1917`) & Electric Orange (`#f97316`) / Amber (`#f59e0b`) accents |
| **Live External APIs** | Real-time Forex Exchange Rates (open.er-api.com), Dev.to Live AI Trends Feed, Google Gemini 1.5 Flash LLM Studio |

---

## 👥 User Roles & 1-Click Demo Accounts

The platform includes a **1-Click Instant Demo Role Switcher** in the top navigation bar and authentication page:

| Role | Demo Account Email | Name | Capabilities |
| :--- | :--- | :--- | :--- |
| **Client** | `client@techflow.com` | Sarah Chen | Post projects, search creators, run Smart AI Matching, generate content in Studio, verify authenticity, release milestone payments. |
| **Creator** | `elena@creator.io` | Elena Vance | Accept/decline project briefs, manage production sprints, upload deliverables, view earnings analytics, explore Skill Radar. |
| **Admin** | `admin@nexusai.io` | Alex Rivera | Manage user accounts (activate/suspend), resolve reported content flags, monitor platform metrics and activity logs. |

*(All demo accounts use password `password123`)*

---

## 📑 12 Required Platform Pages

1. **Landing Page (`/`):** Hero with gradient glow, live statistics counter, featured creator cards, workflow stepper, and CTA buttons.
2. **Sign Up & Login (`/auth`):** Tabbed authentication, role selection (Client vs Creator), and 1-click instant demo logins.
3. **Client Dashboard (`/dashboard/client`):** KPI cards (Active Sprints, Total Invested, Completed Projects), Smart Matchmaker quick prompt, deliverables tracker.
4. **Creator Dashboard (`/dashboard/creator`):** Revenue analytics, incoming project proposals pipeline, deliverable checklist, and mini Skill Radar preview.
5. **AI Content Generation Studio (`/studio`):** Multi-modal generation for Social Media Captions, Blog Posts, Marketing Copy, Video Scripts, and Product Descriptions with editable output canvas, history drawer, and authenticity bridge.
6. **Creator Discovery & Marketplace (`/marketplace`):** Filter by category, budget slider, rating, availability, and language. Includes a **Favorites** tab and **Smart AI Matchmaker** tab.
7. **Creator Profile & Portfolio (`/creator/:id`):** Cover banner, verified badges, portfolio item gallery with lightbox preview, service package tiers, and client reviews.
8. **Project Details & Collaboration (`/projects/:id`):** Workflow status stepper (`Requested` → `Accepted` → `In Progress` → `Under Review` → `Completed`), deliverables toggle, attached files, revision requests with feedback, and embedded chat thread.
9. **Messages & Notifications (`/messages`):** Real-time messaging hub between clients and creators with file attachments and platform notifications panel.
10. **Analytics Dashboard (`/analytics`):** Monthly earnings trajectory chart, deliverable status distribution, and personalized AI tips for creators.
11. **Admin Dashboard (`/admin`):** Platform metrics, user account moderation table (activate/suspend), and reported content review queue.
12. **User Settings (`/settings`):** Public profile details, creator rate calibration, optional AI API key configuration, and notification preferences.
13. **Authenticity Assistant Deep Dive (`/authenticity`):** Full-screen text inspection canvas, originality meter, flagged clichés, and distinctive rewrite generator.
14. **Skill Opportunity Radar Deep Dive (`/skill-radar`):** 6-vector competency matrix, surging skills catalog, and 4-week learning roadmap.

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18+) and npm installed.

### 1. Clone & Setup Workspace
```bash
cd C:\Users\chsah\.gemini\antigravity\scratch\ai-creator-marketplace
```

### 2. Configure Backend Environment
The backend includes a pre-configured `.env` and `.env.example`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=supersecret_nexus_ai_jwt_key_2026
MONGO_URI=mongodb://localhost:27017/nexus_ai_creator_marketplace
# Optional: GEMINI_API_KEY= or OPENAI_API_KEY=
```
> **Note on Database:** If MongoDB is running locally, Mongoose connects and seeds collections automatically. If MongoDB is absent or offline, NexusAI seamlessly transitions to its built-in persistent storage engine with rich realistic seed data. Zero crashes, zero external setup blockers!

### 3. Run the Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs at: `http://localhost:5000`*
*Healthcheck: `http://localhost:5000/api/health`*

### 4. Run the Frontend Development Server
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 📡 Backend API Endpoints Reference

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | POST | Register new Client or Creator account |
| `/api/auth/login` | POST | Authenticate with email and password |
| `/api/auth/demo-login` | POST | 1-Click demo authentication (`client`, `creator`, `admin`) |
| `/api/auth/me` | GET | Retrieve authenticated user profile |
| `/api/creators` | GET | List and filter creators (category, budget, rating, availability) |
| `/api/creators/:id` | GET | Retrieve creator profile, portfolio, packages, and reviews |
| `/api/creators/favorite/:id` | POST | Toggle creator in client's favorites list |
| `/api/ai/generate` | POST | Generate content across 5 deliverable formats |
| `/api/ai/history` | GET | List previously generated studio content |
| `/api/ai/save` | POST | Save studio generation to history |
| `/api/ai/match-creators` | POST | Smart AI Creator Matching with score & rationale |
| `/api/authenticity/analyze` | POST | Unique Feature 1: Heuristic originality & cliché scan |
| `/api/skill-radar/:id` | GET | Unique Feature 2: Creator skill radar & roadmap |
| `/api/projects` | GET / POST | List user projects / Propose new project milestone |
| `/api/projects/:id/status` | PUT | Transition status (`Requested` → `Accepted` → `In Progress` → `Under Review` → `Completed`) |
| `/api/projects/:id/revision` | POST | Submit deliverable revision request with notes |
| `/api/projects/:id/files` | POST | Attach file or delivery asset |
| `/api/messages/conversations` | GET | List active user message threads |
| `/api/messages` | POST | Send message in project or direct chat |
| `/api/analytics/creator/:id` | GET | Creator revenue, performance, and recommendations |
| `/api/admin/stats` | GET | Platform macro statistics |
| `/api/admin/users/:id/status` | PUT | Ban or reactivate user account |
| `/api/admin/reports/:id` | PUT | Moderate reported content item |

---

## 🎨 Theme & Design Philosophy
- **Colors:** Deep Navy (`#060714`, `#0b0c22`, `#101231`) paired with radial purple and violet gradients (`#7928ca`, `#8b5cf6`, `#b5179e`).
- **Surface Elevation:** Subtle glassmorphism cards (`backdrop-blur-md`, `border-purple-900/30`, `shadow-glow-sm`).
- **Typography:** Plus Jakarta Sans & JetBrains Mono for a crisp modern developer & SaaS aesthetic.
- **Responsiveness:** Fluid grid and flexbox arrangements tested on desktop, tablet, and mobile viewport widths.
