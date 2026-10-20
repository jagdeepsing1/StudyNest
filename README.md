# 🪴 StudyNest — Student Learning Portal

A complete frontend-only student LMS (Learning Management System) built with vanilla HTML, CSS, and JavaScript. No backend, no frameworks, no install required.

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/jagdeepsing1/StudyNest.git
   ```

2. Open the project folder:
   ```bash
   cd StudyNest
   ```

3. Open the app in your browser:
   ```bash
   open index.html
   ```

No installation or build step required.

---

## Project Structure

```
StudyNest/
├── index.html          ← App shell (sidebar, topbar, content area)
├── README.md           ← Project overview and setup instructions
├── css/
│   └── styles.css      ← All styles: light/dark themes, layout, components
└── js/
    ├── data.js         ← All sample course data (read-only seed)
    ├── storage.js      ← localStorage layer + computed grades/progress
    └── app.js          ← Router, navigation, all page renderers
```

---

## Features

| Page | What it does |
|---|---|
| **Dashboard** | Welcome message, overall grade, quick links, course cards with progress, upcoming & submitted assignments |
| **Courses** | Cards for all 3 courses with progress bars, grades, instructor |
| **Course Detail** | 4 tabs: Overview · Modules · Assignments · Grades. Expand modules, check lessons off |
| **Assignments** | All assignments with filter (All/Upcoming/Submitted/Graded/Late) and sort |
| **Assignment Detail** | Instructions, grade feedback, fake submission area (mark In Progress / Submit / Reset) |
| **Grades** | Per-course gradebooks with progress bars + overall average summary |
| **Calendar** | 3 views: Upcoming list · Month grid · Week grid |
| **Inbox** | Split-panel message list + reader, mark as read |
| **Settings** | Student name, email, light/dark theme, compact mode, notification toggles |

---

## Sample Courses

| Course | Code | Instructor |
|---|---|---|
| Hindi | LANG-101 | Dr. Priya Sharma |
| Punjabi | LANG-102 | Prof. Harjit Kaur |
| English | LANG-103 | Ms. Sarah Mitchell |

Each course has **4 modules** and **4–5 lessons per module**, plus **4 assignments**.

---

## Where Sample Data Lives

All seed data is in **`js/data.js`** inside the `SN_DATA` object:

```js
SN_DATA.courses      // course list with modules and lessons
SN_DATA.assignments  // 12 assignments across 3 courses
SN_DATA.events       // 16 calendar events
SN_DATA.messages     // 5 inbox messages
```

This data is **read-only**. On first load, `storage.js` copies it into `localStorage` so mutations (submitting assignments, completing lessons, reading messages) don't touch the original.

---

## How localStorage Is Used

`js/storage.js` manages all mutable state under these keys:

| Key | What's stored |
|---|---|
| `sn_assignments` | Assignment list with status + grade updates |
| `sn_lessons` | Map of lessonId → `{ completed: bool }` |
| `sn_messages` | Message list with read/unread state |
| `sn_settings` | Student name, theme, compact mode, notifications |

**Changes that persist across page refreshes:**
- Completing a lesson (updates module + course progress everywhere)
- Submitting or resetting an assignment (updates dashboard, assignments page, grades)
- Reading a message (clears the inbox badge)
- Saving settings (theme, name, compact mode)

To reset everything back to defaults: go to **Settings → Reset All Data**.

---

## Architecture Notes

- **Single-page app** — one `index.html`, no page reloads
- **Router** — `navigate(page, params)` in `app.js` controls what renders
- **Render pattern** — every page has one render function that builds HTML and attaches events
- **No global mutation of seed data** — `SN_DATA` is read-only; `SN_STORAGE` handles all writes
- **Easily replaceable** — swap `localStorage` calls in `storage.js` for `fetch()` API calls to add a real backend later

---

## Next Steps to Level Up

```
"Convert StudyNest to React with component-based architecture"
```
```
"Add a Node.js + Express backend with a SQLite database"
```
```
"Add user authentication with login/signup"
```
```
"Deploy StudyNest to Vercel or GitHub Pages"
```
```
"Add a grade chart using Chart.js"
```
```
"Add drag-and-drop to reorder assignments by priority"
```
