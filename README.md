<div align="center">
  <img src="assets/nile-university-logo.jpg" alt="Nile University" width="560">
  <h1>Nile University Midterm Schedule</h1>
  <p><strong>A fast, mobile-friendly exam lookup for the Fall 2026 midterm schedule.</strong></p>
  <p>
    <a href="https://mo-abdo28.github.io/midterm-schedule-fall-2026/">Open the live site</a>
    ·
    <a href="https://www.linkedin.com/in/mohamed-abdo-65310a361">Connect with Abdo</a>
  </p>
</div>

---

## Overview

Students can enter their university ID to retrieve the midterm exams associated with that ID. Each result includes the course, program when available, exam date, time, room, and facility type. The interface uses Nile University branding and adapts to desktop and mobile screens.

The Fall 2026 dataset currently contains **1,029 exam groups** and **4,816 unique student IDs**. A group represents one course sitting in a particular time and location; multiple IDs can map to the same group.

## Features

- **Indexed ID lookup:** the schedule is transformed into a `Map` once at startup, so each search resolves directly to the matching exams.
- **Useful exam details:** course code, program, date, time, room, and facility are shown when present in the source data.
- **Calendar export:** every exam can be downloaded as an `.ics` event, using Cairo local time.
- **Schedule conflict warnings:** overlapping exam times on the same day are flagged for review.
- **At-a-glance timing:** results are sorted chronologically and show a countdown to each exam.
- **Official links:** students can verify information in the NU student portal and report schedule issues through the Registrar's office.
- **Easy sharing:** share the site link through the device share sheet or copy it to the clipboard.
- **Clear states:** the page guides students when the search field is empty or an ID has no matching schedule.
- **Responsive interface:** layouts, controls, and result cards adapt to narrow screens and support keyboard form submission; the site also includes favicon and social preview metadata.
- **Accessible semantics:** labeled form controls, visible focus styling, descriptive image text, and a live results region support assistive technology.
- **Static deployment:** the site runs on GitHub Pages without a server, build step, third-party runtime library, or external API.

## How it works

```mermaid
flowchart LR
    A[Student enters ID] --> B[Normalize input as text]
    B --> C[Look up ID in prebuilt Map]
    C --> D{Matching exams?}
    D -->|Yes| E[Render course and exam details]
    D -->|No| F[Show helpful empty state]
```

At page load, each exam group's student IDs are indexed to that exam. Search uses the full ID string rather than converting it to a number, preserving exact matches. The lookup and rendering run in the browser.

## Project structure

```text
.
├── index.html                     # Accessible responsive page and Nile University branding
├── assets/
│   ├── app.js                     # ID index, schedule rendering, calendar export, and sharing
│   ├── favicon.svg                # Browser tab icon
│   └── nile-university-logo.jpg   # University logo used by the site and this README
├── data/
│   └── schedule.js                # Fall 2026 exam groups and student IDs
└── README.md
```

## Run locally

No package installation is required. Open `index.html` in a modern browser, or serve this directory with any static file server. For example:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Schedule updates

The schedule is stored in `data/schedule.js` as a JavaScript array. To update it, replace that array with the latest verified schedule while retaining each exam's `ids`, `subject`, `time`, `room`, and `date` fields. `program` and `facility` are optional. Dates use the `YYYY-MM-DD` format. Review representative IDs and exam details against the university's published schedule before deployment.

## Deploy

GitHub Pages serves this repository from the `main` branch root. Commit the updated site and asset files to `main`; Pages publishes the static files at:

<https://mo-abdo28.github.io/midterm-schedule-fall-2026/>

## Data and privacy

This is a convenience lookup, not an authenticated student portal. Because GitHub Pages is static hosting, the schedule and IDs in `data/schedule.js` can be downloaded by anyone, even though the page only displays results after an ID search. The site links to the [official NU student portal](https://register.nu.edu.eg/AppFormProd/Home.aspx), where students can sign in to access their academic information. A university-authorized API or SSO integration is required before this project can provide authenticated ID lookup; official integration details have not yet been provided for this project. Do not add student passwords, session cookies, or private API credentials to this repository. Verify all exam details through official university channels.

## Credits

Built by **Abdo** for Nile University. The university logo shown here was provided for this project.
