# Belhar Connect Hub

Build a responsive marketing + web-app website called **Connectly** — a community job marketplace connecting people in Belhar, Cape Town who need help ("Community Members") with local people looking for work ("Workers"). Tagline: **"Connect. Hire. Earn."**

## 1. Brand & Logo

Design a logo for **Connectly** first, then apply it consistently across the site (navbar, favicon, footer).

- Logo concept: a simple, modern mark suggesting **connection between people** — e.g. two overlapping abstract figures, a handshake reduced to clean geometric shapes, or two linked nodes/dots forming a subtle "C". Should feel warm, trustworthy, and community-oriented — not corporate or cold.

- Should work as a small square icon (favicon/app icon) as well as a full horizontal lockup (icon + "Connectly" wordmark).

- Wordmark typeface: bold, rounded-geometric sans-serif (Montserrat or similar) — friendly but confident.

- Primary logo color: the deep trust-green below, on a white or light background. Provide a reversed (white) version for use on the dark hero section.

## 2. Color palette

| Role | Hex |

|---|---|

| Primary (trust green) | `#2D6A4F` |

| Primary dark (hover/gradients) | `#1F4E39` |

| Secondary (warm orange accent) | `#F4A261` |

| Background | `#F8F9FA` |

| Surface / cards | `#FFFFFF` |

| Text (main) | `#1A1A2E` |

| Text (muted) | `#6B7280` |

| Borders | `#E0E0E0` |

## 3. Typography

- Headings: **Montserrat**, 600–800 weight

- Body/UI: **Inter**, 400–600 weight

## 4. Design system / component style

- 8px spacing grid throughout

- Cards: white background, 12px corner radius, soft shadow `0 2px 8px rgba(0,0,0,0.08)`

- Buttons: 48px height, 12px radius, primary buttons use a green gradient (`#2D6A4F` → `#1F4E39`) with white text; secondary buttons are outlined in green on white

- Inputs: 48px height, light grey border (`#E0E0E0`), border turns green on focus

- Status/skill tags: small pill badges with tinted backgrounds (green for "Open/Hired", blue for "In Progress", grey for "Completed", orange/red tint for "Urgent")

- Rounded, friendly, high-contrast, generous white space — should feel trustworthy and approachable for a community audience, not "techy" or corporate

## 5. Site structure & pages

**Public marketing pages:**

- **Home** — hero with the Connectly logo, tagline "Connect. Hire. Earn.", two prominent CTA cards ("I need help — Post a Job" for Community Members, "I want to work — Find Jobs" for Workers), a "How it works" 3-step section, featured job categories (Gardener, Cleaner, Tutor, Handyman, Caretaker, Painter, Electrician, Plumber), and social proof/testimonials from Belhar community members

- **Sign Up** — two paths: Community Member signup (name, email, phone, password, location pre-filled "Belhar, Cape Town", terms checkbox) and Worker signup (same fields plus a multi-select skills chip picker and an experience-level dropdown: Entry Level / Intermediate / Expert)

- **Log In** — email/phone + password, "Forgot password?", social login buttons, toggle between logging in as a Community Member or Worker

- **About / How it works**

**App-style pages (behind login, can be simplified web dashboards rather than a mobile shell):**

- **Community Member Dashboard** — stats (jobs posted, active jobs, workers hired), a prominent "Post a New Job" CTA, category quick-filters, recent job posts as cards

- **Post a Job form** — title, category, description (200 char limit), budget (R), date/time needed, location, photo upload, "urgent job" toggle

- **Job Details (member view)** — description, budget, location/map, list of applicants with ratings and "Accept Worker" / "Message" actions

- **My Jobs** — tabs for Open / In Progress / Completed, with "Mark Complete" action

- **Worker Dashboard** — availability toggle, stats (completed jobs, total earned, rating), recommended jobs, "My Applications" summary

- **Find Jobs** — search + category filter chips, job cards with client rating, budget, distance, "Apply Now" and save/heart icon

- **Job Details (worker view)** — description, budget, client info, "Apply Now" / "Message Client"

- **My Applications** — tabs for Applied / Shortlisted / Hired / Rejected

- **Messages / Chat** — conversation list with unread badges; individual chat view with sent (green, right-aligned) and received (grey, left-aligned) bubbles

- **Profile** (both roles) — avatar, rating, skills or jobs-posted stats, bio, reviews, settings (edit profile, change password, notifications, language, logout)

- **Earnings (Worker)** — total earnings, weekly bar chart, transaction list, "Withdraw Earnings"

- **Notifications** — list with icons, unread indicators, "mark all as read"

- **Settings** — account, notification toggles, dark mode toggle, support links, logout

## 6. Content tone

Use realistic, specific placeholder content — not lorem ipsum. Reference real Belhar streets/areas (e.g. Belhar Ext 15, Symphony Way, Modderdam Road, Voortrekker Road) and realistic South African names for sample workers/clients. Prices in Rand (R).

## 7. Technical notes

- Fully responsive (mobile-first, but this is a website — not a fixed phone-frame mockup)

- Interactive prototype: buttons/links should navigate between the pages above so it can be clicked through end-to-end

- Keep the whole app in the Connectly brand and color system defined above — no default template colors

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/75d04651-d849-47a8-9e6f-6794bc88293f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Email authentication

Sign-up, email confirmation, sign-in and password recovery use the connected Supabase Auth project. In the Supabase dashboard, enable email confirmations under **Authentication → Providers → Email**, configure a production SMTP sender under **Authentication → SMTP Settings**, and add the local and deployed callback URLs under **Authentication → URL Configuration → Redirect URLs** (for local development, `http://localhost:8080/login`). Set the deployed app URL as the Site URL. Without confirmation enabled and an email sender configured, the app cannot deliver confirmation emails.
