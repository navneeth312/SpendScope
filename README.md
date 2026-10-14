# SpendScope — Student Personal Finance & Budget Tracker

> A polished, responsive personal finance web app designed specifically for students. Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **localStorage** persistence, featuring real-time recalculations, subscription renewal alerts, smart purchase planning, and bilingual **English & Telugu (తెలుగు)** support.

---

## Table of Contents
1. [Overview](#overview)
2. [Key Capabilities & Architecture](#key-capabilities--architecture)
3. [Who Is SpendScope Created For? (12 Detailed Personas & What To Do)](#who-is-spendscope-created-for)
4. [Step-by-Step Guide: How to Use SpendScope](#step-by-step-guide-how-to-use-spendscope)
   - [1. Choosing Currency, Language & Theme](#1-choosing-currency-language--theme)
   - [2. Managing Demo Data](#2-managing-demo-data)
   - [3. Logging & Filtering Transactions](#3-logging--filtering-transactions)
   - [4. Category Budgets & Spending Caps](#4-category-budgets--spending-caps)
   - [5. Tracking Savings Goals & Adjusting Funds](#5-tracking-savings-goals--adjusting-funds)
   - [6. Managing Recurring Subscriptions](#6-managing-recurring-subscriptions)
   - [7. Using the Purchase Planner & Savings Calculator](#7-using-the-purchase-planner--savings-calculator)
   - [8. CSV Import, Export & Template Downloading](#8-csv-import-export--template-downloading)
   - [9. Student Financial Health Meter & Tips](#9-student-financial-health-meter--tips)
5. [Financial Principles & Ethical Transparency](#financial-principles--ethical-transparency)
6. [Tech Stack & Local Development](#tech-stack--local-development)

---

## Overview

Student life brings unique financial constraints: fluctuating part-time earnings, sporadic family allowances, fixed semester deadlines, shared dorm expenses, and an array of recurring digital tools (Spotify Student, GitHub Copilot, textbook rentals, streaming services). Traditional personal finance software is often overloaded with complex stock portfolios, mortgage tracking, and invasive bank credentials.

**SpendScope** provides a clean, privacy-first alternative tailored to student living:
- **Zero Invasiveness**: All data resides strictly inside your browser's `localStorage`. No bank account logins or external account scraping.
- **Student-First Categories**: Pre-tuned for dining hall passes, shared dorm rent, peer tutoring income, used textbooks, campus transit, and digital subscriptions.
- **Dual Language Support**: Seamless real-time toggle between **English** and **Telugu (తెలుగు)** for all visible UI elements, categories, alerts, and navigation.
- **Multicurrency**: Instant 1-click switcher supporting **$ (USD)**, **₹ (INR)**, **€ (EUR)**, and **£ (GBP)**.
- **Continuous Recalculation**: All balances, burn rates, visual donut charts, budget consumption meters, and goal milestones update instantly whenever an entry is added, edited, or removed.

---

## Key Capabilities & Architecture

| Module | Features & Capabilities |
| :--- | :--- |
| **Dashboard** | Total Income, Total Expenses, Net Balance, Savings Rate, Safe Daily Spend (`remaining / daysLeft`), Financial Health Score (0–100), Interactive SVG Donut Chart, Upcoming Subscriptions widget, and Recent Transactions feed. |
| **Transactions Manager** | Full CRUD (Create, Read, Update, Delete) for incomes and expenses. Real-time text search, type filtering (*All / Income / Expense*), category selection, sorting by date or amount, and filtered totals. |
| **Category Budgets** | Monthly spending limits for 8+ categories. Progress bars with color states (*Emerald* < 70%, *Amber* 80–100%, *Rose* > 100%). Over-budget alerts and a customized limit modal. |
| **Savings Goals** | Target amounts, current balances, visual progress bars, target dates, and days-remaining counters. Quick **+ Deposit / - Withdraw** modal with optional automated transaction logging. |
| **Subscription Tracker** | Monthly and annual commitment calculations, renewal countdowns, active/pause toggles, and payment frequency support (*monthly, yearly, quarterly*). |
| **Purchase Planner** | Future wishlist and capital planner with priority badges (*High, Medium, Low*), status flow (*Planning $\rightarrow$ Saving $\rightarrow$ Completed*), and an interactive monthly savings calculator. |
| **Data Portability** | 1-click CSV transaction export and robust CSV import modal with column validation, error logs, and a downloadable standard template. |
| **Bilingual UI** | Complete English and Telugu localization covering every screen, button, form label, tooltip, and empty state. |

---

## Who Is SpendScope Created For?

Here are **12 concrete user personas** representing diverse student profiles, along with specific guidance on **how to use** SpendScope and **what to do** in each scenario:

### 1. The College Freshman in Campus Dorms
- **Profile & Needs**: Moving away from home for the first time with a fixed monthly family allowance or semester meal stipend. Often overspends on late-night takeout, campus coffee, and college apparel in the first few weeks.
- **What To Do in SpendScope**:
  1. Set monthly limits in the **Budgets** tab for *Food & Dining* and *Entertainment*.
  2. Log daily cafeteria swipes or coffee purchases directly using the **Quick Add** button in the header.
  3. Monitor the **Safe Daily Spend** metric on the Dashboard so you know exactly how many dollars or rupees you have left per day.
  4. Create an *Emergency Student Cushion* goal in **Savings Goals** with a modest target ($300 / ₹15,000).

### 2. Off-Campus Roommates Splitting Rent & Utilities
- **Profile & Needs**: Living in a shared apartment where monthly rent, WiFi bills, and grocery runs must be meticulously accounted for.
- **What To Do in SpendScope**:
  1. Record your portion of the monthly rent in **Transactions** under *Rent & Housing* on the 1st of every month.
  2. Use the **Notes** field on grocery entries to tag shared purchases (e.g., *"Split with Karthik & Alex - Trader Joe's"*).
  3. Set a strict cap in **Budgets** for *Groceries* to prevent excessive grocery waste.
  4. Track the apartment WiFi subscription in the **Subscriptions** tab with its exact renewal date.

### 3. International Students Managing Currency & Part-Time Limits
- **Profile & Needs**: Studying abroad with strict legal work limits (e.g., 20 hours/week) while managing cross-border remittances and foreign exchange conversions.
- **What To Do in SpendScope**:
  1. Use the **Currency Selector** in the header to switch between `$`, `₹`, `€`, or `£` depending on whether you are budgeting for tuition payments or daily host-country expenses.
  2. Log your campus work hours/stipend under *Part-Time Job* in **Transactions**.
  3. Review the **Cashflow Overview** at the end of each month to ensure your local expenses never outpace your earnings and wire allowances.
  4. Export your logs via **Export CSV** each semester to keep records for financial aid or tax filings.

### 4. Working Students Balancing Campus Jobs & Tuition
- **Profile & Needs**: Balancing lab assistantships, peer tutoring gigs, or library shifts to pay for tuition, exam certifications, or living expenses.
- **What To Do in SpendScope**:
  1. Add each tutoring payment or hourly paycheck as **Income** under *Part-Time Job* with the date and payment method (*UPI/Cash*, *Bank Transfer*).
  2. In **Savings Goals**, set up a *"Next Semester Tuition Contribution"* goal and deposit funds into it as soon as your paycheck arrives.
  3. Check the **Savings Rate** card on the Dashboard to maintain a healthy 20%+ savings buffer.

### 5. Telugu-Speaking Students & Regional Language Learners (తెలుగు విద్యార్థులు)
- **Profile & Needs**: Students from Andhra Pradesh, Telangana, or regional backgrounds who feel more comfortable tracking their college finances in their mother tongue.
- **What To Do in SpendScope**:
  1. Click the **తెలుగు** button in the navigation bar to immediately translate the entire application into authentic Telugu.
  2. Review your dashboard in Telugu: మొత్తం ఆదాయం (Total Income), మొత్తం ఖర్చులు (Total Expenses), and మిగిలిన నిల్వ (Remaining Balance).
  3. Manage category budgets like ఆహారం & భోజనం (Food & Dining) and విద్య & పుస్తకాలు (Academics & Books) with native terminology.
  4. Set currency to **₹ (INR)** for effortless local rupee budgeting.

### 6. Computer Science & STEM Students Managing Software Subscriptions
- **Profile & Needs**: Students learning coding or engineering who subscribe to tools like GitHub Copilot, ChatGPT Plus, Claude Pro, LeetCode Premium, or cloud hosting (AWS / GCP).
- **What To Do in SpendScope**:
  1. Open the **Subscriptions** tab and log every developer tool, its monthly fee, and exact renewal date.
  2. Notice the **Monthly Recurring Cost** card: understand how three $10 tools aggregate into a $360 annual cost.
  3. Use the **Active/Inactive** toggle whenever a course ends so you remember to pause tools you no longer need.
  4. Review the **Student Tips** modal to verify if any of your tools are offered free under the *GitHub Student Developer Pack*.

### 7. Graduate Teaching Assistants (TAs) & PhD Researchers on Stipends
- **Profile & Needs**: Graduate students living on fixed bi-weekly university stipends who must budget for conference travel, research equipment, and journal publications.
- **What To Do in SpendScope**:
  1. Enter your recurring university stipend as bi-weekly **Income**.
  2. In **Purchase Planner**, add items such as *"Academic Conference Travel"* or *"Journal Submission Fee"* with high priority.
  3. Use the **Monthly Savings Calculator** inside the planner to determine how much stipend surplus must be set aside each month.

### 8. Summer Interns Relocating to a New City
- **Profile & Needs**: College students relocating for a 10–12 week summer internship who need to calculate moving costs, temporary sublease deposits, and daily transit before their first paycheck.
- **What To Do in SpendScope**:
  1. In **Purchase Planner**, create a plan for *"Summer Sublease Security Deposit"* and *"Flight/Train Tickets"*.
  2. In **Budgets**, adjust *Travel & Transit* to accommodate city-specific metro/train passes.
  3. Once the internship stipend arrives, log it under **Income** and analyze whether your summer savings goals are on track.

### 9. Goal-Oriented Students Saving for High-Value Hardware (Laptops / Tablets)
- **Profile & Needs**: Students whose existing laptop is slowing down and who need a reliable machine for capstone projects, video editing, or coursework.
- **What To Do in SpendScope**:
  1. Navigate to **Purchase Planner** and click **Plan New Purchase**.
  2. Enter the target model (e.g., *"M3 MacBook Air for Capstone"*), the price ($1,100), and your graduation or project start date.
  3. Review the automated breakdown: *"To buy this in 5 months, save $220.00 per month"*.
  4. As you set money aside, click **Deposit / Withdraw** in **Savings Goals** to increment your progress bar until you hit 100%.

### 10. Frugal Savers Building a 3-Month Emergency Cushion
- **Profile & Needs**: Self-reliant students who want financial peace of mind against medical emergencies, unexpected bike repairs, or lost phones.
- **What To Do in SpendScope**:
  1. Go to **Savings Goals** and create a goal named *"Emergency Student Cushion"* with a target of 2–3 months of basic living expenses ($600–$1,000).
  2. Each time you receive bonus earnings, gifts, or tutoring gigs, deposit a fraction using the **+ Add Funds** modal.
  3. Enable the **"Also record as transaction"** option to keep your cashflow ledger perfectly synchronized.

### 11. Final Year Students Preparing for Post-Graduation Independence
- **Profile & Needs**: Seniors preparing to enter the workforce, rent their first solo apartment, and transition away from parent allowances.
- **What To Do in SpendScope**:
  1. Use the **Clear All Data** option in the Demo Data menu to wipe sample logs and start tracking your real day-to-day spending.
  2. Benchmark your category spending for a full 60 days to uncover hidden spending leaks.
  3. Check the **Student Financial Health Score** to aim for a 90+ rating before your graduation date.
  4. Export your 1-year history to CSV for reference when opening your first independent retirement or investment accounts.

### 12. High School Seniors & Pre-College Students Learning to Budget
- **Profile & Needs**: Young learners managing their very first checking account or prepaid campus debit card.
- **What To Do in SpendScope**:
  1. Keep the pre-loaded **Sample Demo Data** intact to explore how a real college semester's income and expenses look.
  2. Experiment with adding hypothetical incomes and expenses to see how the **Net Balance** and **Donut Chart** respond immediately.
  3. Read the **Student Tips Modal** (lightbulb icon) to learn fundamental financial habits (student discount cards, textbook resale, meal prepping).

---

## Step-by-Step Guide: How to Use SpendScope

### 1. Choosing Currency, Language & Theme
- **Currency**: Click `$`, `₹`, `€`, or `£` in the upper-right corner of the header. All figures across charts, budgets, goals, and tables update instantly.
- **Language**: Click **తెలుగు** or **English** in the header. The app translates instantly without requiring a page reload.
- **Theme**: Click the **Sun / Moon** icon in the header to alternate between **Dark Navy Mode** (curated for low-light dorm studying) and **Crisp Light Mode** (high contrast for daylight).

### 2. Managing Demo Data
SpendScope ships preloaded with realistic student sample data (campus lab pay, parent allowance, used textbooks, dining plans, Spotify student, etc.):
- To reset back to the default demo records at any time, click the **Sample Demo Data** badge in the header and select **Reset Demo Data**.
- To start with a clean slate for your actual personal records, click **Clear All Data** and confirm. You can reload the demo data anytime.

### 3. Logging & Filtering Transactions
1. **Adding an Entry**: Click **Quick Add** in the header or the **+ Income** / **- Expense** buttons in the Transactions tab.
2. **Details**: Specify the Title, Amount, Date, Category (*Food & Dining, Academics, Groceries, Rent, etc.*), and Payment Method (*UPI/Cash, Debit Card, Credit Card, Bank Transfer, Campus Card*).
3. **Filtering**: Use the search input to filter by keyword, select an active category, or filter by *All*, *Incomes*, or *Expenses*.
4. **Editing / Deleting**: Click the pencil icon to modify any entry or the trash icon to delete it after confirmation.

### 4. Category Budgets & Spending Caps
1. Open the **Budgets** tab to inspect your category spending versus limits.
2. Categories approaching 80% utilization display an **Amber** warning; categories exceeding 100% trigger a **Rose** alert banner on the Dashboard.
3. Click **Customize Category Budgets** to set your monthly spending cap for each student category.

### 5. Tracking Savings Goals & Adjusting Funds
1. Navigate to **Savings Goals** and click **Create Savings Goal**.
2. Set the goal title, target amount, target deadline, category, and an accent color.
3. When saving money, click **Deposit / Withdraw** on the goal card. Enter the amount to add or remove.
4. Check the **"Also record as transaction"** box to automatically write a corresponding entry to your transactions log.

### 6. Managing Recurring Subscriptions
1. Navigate to **Subscriptions** and click **Add Subscription**.
2. Specify the service name (e.g., *Spotify Student, Prime Student, Cloud Storage*), cost, billing cycle (*Monthly, Yearly, Quarterly*), and next renewal date.
3. The dashboard and subscription view will calculate your **Monthly Recurring Commitment** and provide active countdowns (*"Renews in 3 days"*, *"Today!"*).
4. Toggle a subscription **Active** or **Inactive** to model your monthly budget when pausing services during semester breaks.

### 7. Using the Purchase Planner & Savings Calculator
1. Open the **Purchase Planner** tab and click **Plan New Purchase**.
2. Enter the item name, target price, target date, and priority level (*High, Medium, Low*).
3. The interactive **Monthly Savings Calculator** will automatically show:
   - Exactly how much you need to set aside per month to acquire the item by your target date.
   - An interactive slider/input allowing you to test scenarios: *"If I save $X/month, I will reach my target in Y months."*
4. Once you buy the item, click **Mark Purchased** to celebrate the completion of your plan.

### 8. CSV Import, Export & Template Downloading
1. **Exporting**: In the Transactions tab, click **Export CSV**. An immediate `.csv` download is generated containing all currently filtered records.
2. **Downloading Sample Template**: Open the **Import CSV** modal and click **Download Sample CSV Template**.
3. **Importing**: Drag and drop your `.csv` file. SpendScope will validate headers, verify numerical values, report any row-level errors, preview the valid rows, and allow you to bulk-import with a single click.

### 9. Student Financial Health Meter & Tips
- On the Dashboard, review your **Student Financial Health Score (0–100)**:
  - **90–100 (Thriving)**: Healthy savings cushion and low expense-to-income ratio.
  - **70–89 (Stable)**: Spending within healthy student boundaries.
  - **50–69 (Caution)**: Expenses near monthly earnings.
  - **< 50 (Deficit)**: Expenses exceeding monthly income.
- Click the **Lightbulb icon** in the header to open **Student Money Saving Hacks** covering 50%+ student discounts, used textbook sourcing, and meal prep economics.

---

## Financial Principles & Ethical Transparency

- **No Fake Bank Integrations**: SpendScope does not attempt to emulate fake bank APIs or ask for your online banking passwords.
- **No Deceptive Cancellations**: SpendScope tracks renewal dates so you never miss a billing deadline; it will never claim to automatically cancel third-party services on your behalf.
- **Local Data Sovereignity**: Your financial data never leaves your device. It is stored exclusively in your browser via `window.localStorage`. Clearing your browser storage clears the app, and you can export your data to CSV anytime.

---

## Tech Stack & Local Development

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: Reactive React hooks synchronized with `localStorage`
- **Charts**: Custom responsive SVG vector charts with slice hover interactions

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server (Port 3000)
npm run dev

# 3. Type-check and lint
npm run lint

# 4. Create production build
npm run build
```

---

*Designed and engineered for students everywhere. Track with confidence using SpendScope.*
