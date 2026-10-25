# Contributing

Thanks for helping improve the Nile University Midterm Finder. Keep changes focused, easy to review, and consistent with the project's privacy notice.

## Run the site

This project has no package installation or build step. Open `index.html` directly or serve the repository root with:

```bash
python -m http.server 8000
```

Visit <http://localhost:8000> in a browser.

## Update schedule data

1. Start from the latest schedule approved for public use.
2. Update `data/schedule.js`, preserving the documented fields and string IDs.
3. Manually compare representative dates, course codes, times, rooms, and facility names with the source schedule.
4. Do not add passwords, portal cookies, API secrets, or personal student records outside the approved schedule source.
5. Never include student IDs or personal schedules in issue descriptions, screenshots, commit messages, or pull requests.

## User interface changes

- Keep the page usable on narrow screens and with keyboard navigation.
- Preserve descriptive labels and accessible status announcements.
- Keep calendar exports in Cairo local time and do not include student IDs in event descriptions or URLs.
- Avoid adding third-party runtime dependencies unless there is a clear need.

## Report a problem

Use the GitHub issue form for site behavior or display problems. It deliberately does not ask for student IDs. Use the official NU portal and Registrar channels to verify exam information.

