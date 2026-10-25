const schedule = window.MIDTERM_SCHEDULE;
for (const exam of schedule) exam.date = new Date(`${exam.date}T12:00:00`);

const normalizeId = value => value.trim();
const index = new Map();
for (const exam of schedule) {
  for (const id of exam.ids) {
    if (!index.has(id)) index.set(id, []);
    index.get(id).push(exam);
  }
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const results = document.getElementById("results");
const form = document.getElementById("searchForm");
const input = document.getElementById("studentId");
const status = document.getElementById("searchStatus");
const shareButton = document.getElementById("shareButton");

function icon(name) {
  const paths = {
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20"/>',
    alert: '<path d="M12 3 2.8 19h18.4L12 3Z"/><path d="M12 9v4m0 3h.01"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>'
  };
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function showEmpty(title, message) {
  results.replaceChildren();
  const box = document.createElement("div");
  box.className = "empty";
  box.innerHTML = `<div><span class="empty-icon" aria-hidden="true">${icon("book")}</span><strong>${title}</strong>${message}</div>`;
  results.append(box);
}

function calendarDayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function timeRange(exam) {
  const match = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(exam.time);
  if (!match) return null;
  return { start: Number(match[1]) * 60 + Number(match[2]), end: Number(match[3]) * 60 + Number(match[4]) };
}

function findConflicts(exams) {
  const conflicts = new Set();
  for (let left = 0; left < exams.length; left++) {
    for (let right = left + 1; right < exams.length; right++) {
      if (calendarDayKey(exams[left].date) !== calendarDayKey(exams[right].date)) continue;
      const a = timeRange(exams[left]);
      const b = timeRange(exams[right]);
      if (a && b && Math.max(a.start, b.start) < Math.min(a.end, b.end)) {
        conflicts.add(left);
        conflicts.add(right);
      }
    }
  }
  return conflicts;
}

function daysUntil(date) {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const examUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((examUtc - todayUtc) / 86400000);
}

function countdownLabel(days) {
  if (days < 0) return "Exam date has passed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function icsEscape(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function cairoWallTimeToUtc(date, time) {
  const [hour, minute] = time.split(":").map(Number);
  const localGuess = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute));
  const offsetText = new Intl.DateTimeFormat("en", { timeZone: "Africa/Cairo", timeZoneName: "longOffset" })
    .formatToParts(localGuess).find(part => part.type === "timeZoneName")?.value ?? "GMT+02:00";
  const offset = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offsetText);
  const offsetMinutes = offset ? (offset[1] === "+" ? 1 : -1) * (Number(offset[2]) * 60 + Number(offset[3])) : 120;
  return new Date(localGuess.getTime() - offsetMinutes * 60000);
}

function icsTimestamp(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function downloadCalendar(exam) {
  const range = timeRange(exam);
  if (!range) return;
  const start = cairoWallTimeToUtc(exam.date, `${String(Math.floor(range.start / 60)).padStart(2, "0")}:${String(range.start % 60).padStart(2, "0")}`);
  const end = cairoWallTimeToUtc(exam.date, `${String(Math.floor(range.end / 60)).padStart(2, "0")}:${String(range.end % 60).padStart(2, "0")}`);
  const location = `${exam.facility && exam.facility !== "Room" ? `${exam.facility} ` : "Room "}${exam.room}`;
  const description = exam.program ? `Program: ${exam.program}` : "Nile University Fall 2026 midterm exam";
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Abdo//Nile University Midterm Finder//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT", `UID:${exam.subject}-${exam.date.toISOString().slice(0, 10)}-${exam.room}@midterm-finder.nileuniversity`,
    `DTSTAMP:${icsTimestamp(new Date())}`, `DTSTART:${icsTimestamp(start)}`, `DTEND:${icsTimestamp(end)}`,
    `SUMMARY:${icsEscape(`${exam.subject} Midterm Exam`)}`, `DESCRIPTION:${icsEscape(description)}`, `LOCATION:${icsEscape(location)}`,
    "END:VEVENT", "END:VCALENDAR", ""
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${exam.subject.toLowerCase()}-midterm.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function examStartMinutes(exam) {
  return timeRange(exam)?.start ?? Number.MAX_SAFE_INTEGER;
}

function render(exams, id) {
  results.replaceChildren();
  if (!exams?.length) {
    showEmpty("No schedule found for this ID", "Check the student ID and try again.");
    status.textContent = "No matching exams were found.";
    return;
  }

  const sortedExams = [...exams].sort((a, b) => a.date - b.date || examStartMinutes(a) - examStartMinutes(b));
  const conflicts = findConflicts(sortedExams);
  const heading = document.createElement("div");
  heading.className = "results-head";
  const title = document.createElement("h2");
  title.textContent = "Your Exams";
  const count = document.createElement("span");
  count.className = "count";
  count.textContent = `${sortedExams.length} ${sortedExams.length === 1 ? "course" : "courses"}`;
  heading.append(title, count);
  results.append(heading);

  sortedExams.forEach((exam, examIndex) => {
    const card = document.createElement("article");
    card.className = "result-card";
    const info = document.createElement("div");
    const course = document.createElement("h3");
    course.className = "course";
    const code = document.createElement("span");
    code.className = "course-code";
    code.textContent = exam.subject;
    course.append(code);
    if (exam.program) {
      const program = document.createElement("span");
      program.className = "program";
      program.textContent = exam.program;
      course.append(program);
    }
    if (conflicts.has(examIndex)) {
      const warning = document.createElement("div");
      warning.className = "conflict-badge";
      warning.innerHTML = `${icon("alert")}<span>Possible exam-time conflict</span>`;
      info.append(warning);
    }
    const details = document.createElement("div");
    details.className = "details";
    const time = document.createElement("span");
    time.className = "detail";
    time.innerHTML = `${icon("clock")}<span dir="ltr">${exam.time}</span>`;
    const room = document.createElement("span");
    room.className = "detail";
    room.innerHTML = `${icon("pin")}<span>Room ${exam.room}</span>`;
    details.append(time, room);
    if (exam.facility && exam.facility !== "Room") {
      const facility = document.createElement("span");
      facility.className = "detail";
      facility.textContent = exam.facility;
      details.append(facility);
    }
    info.append(course, details);

    const date = document.createElement("div");
    date.className = "date-block";
    const day = document.createElement("div");
    day.className = "date-day";
    day.textContent = `${dayNames[exam.date.getDay()]}, ${exam.date.getDate()}`;
    const month = document.createElement("div");
    month.className = "date-month";
    month.textContent = `${monthNames[exam.date.getMonth()]} ${exam.date.getFullYear()}`;
    const countdown = document.createElement("div");
    countdown.className = "days-until";
    countdown.textContent = countdownLabel(daysUntil(exam.date));
    const calendar = document.createElement("button");
    calendar.type = "button";
    calendar.className = "calendar-button";
    calendar.innerHTML = `${icon("calendar")}<span>Add to calendar</span>`;
    calendar.disabled = !timeRange(exam);
    if (calendar.disabled) calendar.title = "A valid exam time is not available for calendar export.";
    calendar.addEventListener("click", () => downloadCalendar(exam));
    date.append(day, month, countdown, calendar);
    card.append(info, date);
    results.append(card);
  });
  status.textContent = `${sortedExams.length} exams found. Dates and times are sorted chronologically.`;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const id = normalizeId(input.value);
  if (!id) {
    showEmpty("Enter your student ID", "Your registered courses will appear here.");
    status.textContent = "Enter your full student ID to search.";
    input.focus();
    return;
  }
  render(index.get(id), id);
});

shareButton.addEventListener("click", async () => {
  const shareData = { title: document.title, text: "Find your Nile University Fall 2026 midterm schedule.", url: window.location.href.split("?")[0] };
  try {
    if (navigator.share) await navigator.share(shareData);
    else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareData.url);
      status.textContent = "Website link copied to clipboard.";
    } else {
      window.prompt("Copy the website link:", shareData.url);
    }
  } catch (error) {
    if (error.name !== "AbortError") status.textContent = "Unable to share right now. Copy the website link from your browser.";
  }
});
