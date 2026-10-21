/* ══════════════════════════════════════════════
   STUDYNEST — app.js
   Router · Navigation · All page renderers
   ══════════════════════════════════════════════ */

// ── Router state ───────────────────────────────────────────────────────────
let currentPage   = 'dashboard';
let currentParams = {};          // e.g. { courseId: 'hindi' }

// ── DOM refs ───────────────────────────────────────────────────────────────
const mainContent   = document.getElementById('main-content');
const navLinks      = document.querySelectorAll('.nav-link');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar       = document.getElementById('sidebar');
const sidebarOverlay= document.getElementById('sidebar-overlay');
const pageTitleEl   = document.getElementById('page-title');
const inboxBadgeEls = document.querySelectorAll('.inbox-badge');

// ══════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════
function applyTheme() {
  const settings = SN_STORAGE.getSettings();
  document.documentElement.setAttribute('data-theme', settings.theme || 'light');
  document.documentElement.setAttribute('data-compact', settings.compactMode ? 'true' : 'false');
}
applyTheme();

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════
function navigate(page, params = {}) {
  currentPage   = page;
  currentParams = params;
  renderPage();
  updateNav();
  updateInboxBadge();
  // Close mobile sidebar on navigate
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
  window.scrollTo({ top: 0 });
}

function updateNav() {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === currentPage);
  });
}

function updateInboxBadge() {
  const count = SN_STORAGE.unreadCount();
  inboxBadgeEls.forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// Sidebar toggle (mobile)
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('visible');
});
sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
});

// Nav link clicks
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.dataset.page);
  });
});

// ══════════════════════════════════════════════
// ROUTER
// ══════════════════════════════════════════════
function renderPage() {
  const titles = {
    dashboard   : 'Dashboard',
    courses     : 'Courses',
    course      : 'Course Detail',
    assignments : 'Assignments',
    assignment  : 'Assignment Detail',
    grades      : 'Grades',
    calendar    : 'Calendar',
    inbox       : 'Inbox',
    settings    : 'Settings',
  };
  pageTitleEl.textContent = titles[currentPage] || 'StudyNest';

  switch (currentPage) {
    case 'dashboard':   renderDashboard();               break;
    case 'courses':     renderCourses();                 break;
    case 'course':      renderCourseDetail();            break;
    case 'assignments': renderAssignments();             break;
    case 'assignment':  renderAssignmentDetail();        break;
    case 'grades':      renderGrades();                  break;
    case 'calendar':    renderCalendar();                break;
    case 'inbox':       renderInbox();                   break;
    case 'settings':    renderSettings();                break;
    default:            mainContent.innerHTML = '<p>Page not found.</p>';
  }
}

// ══════════════════════════════════════════════
// HELPERS — shared UI fragments
// ══════════════════════════════════════════════
function progressBar(pct, colorVar = '--color-primary') {
  return `<div class="progress-bar-track">
    <div class="progress-bar-fill" style="width:${pct}%;background:var(${colorVar})"></div>
  </div>`;
}

function statusBadge(status) {
  const map = {
    'not-started' : ['badge-neutral',  'Not Started'],
    'in-progress' : ['badge-info',     'In Progress'],
    'submitted'   : ['badge-warning',  'Submitted'],
    'graded'      : ['badge-success',  'Graded'],
    'late'        : ['badge-danger',   'Late'],
  };
  const [cls, label] = map[status] || ['badge-neutral', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function gradeBadge(pct) {
  if (pct === null) return '<span class="badge badge-neutral">—</span>';
  const cls = pct >= 90 ? 'badge-success' : pct >= 70 ? 'badge-info' : 'badge-danger';
  return `<span class="badge ${cls}">${pct}%</span>`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(str) {
  if (!str) return '';
  const [y,m,d] = str.split('-').map(Number);
  return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

function isOverdue(due) { return due && due < todayStr(); }
function isDueToday(due) { return due === todayStr(); }

function courseColor(courseId) {
  const c = SN_DATA.courses.find(x => x.id === courseId);
  return c ? c.color : '#6366f1';
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════
// WEEKLY TIMELINE BUILDER
// ══════════════════════════════════════════════

/**
 * Builds the 7-day horizontal timeline diagram.
 * Each column = one day of the current week (Mon–Sun).
 * Each cell shows dots for lessons completed that day per subject.
 * Since lessons don't have a real completion timestamp, we distribute
 * completed lessons across the week proportionally for a realistic
 * demo view, seeded from the lesson id so it's stable across renders.
 */
function buildWeeklyTimeline() {
  // ── Week range: Mon → Sun ──────────────────────────────────────────────
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayOffset + i);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });

  const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = todayStr();
  const todayIndex = weekDates.indexOf(today); // -1 if today is outside this week

  // ── Sample baseline data (realistic, always visible) ──────────────────
  // Indexed [Mon=0 … Sun=6]. This guarantees the chart is never empty.
  const SAMPLE = {
    hindi  : [2, 1, 3, 2, 0, 1, 2],
    punjabi: [1, 3, 1, 2, 2, 0, 1],
    english: [3, 2, 2, 1, 3, 1, 0],
  };

  // ── Merge with actual lesson completion state ──────────────────────────
  // Build per-course, per-day counts from real completed lessons.
  // Lessons are assigned to days by a stable hash so results don't
  // change on every render. We add these on top of sample data only
  // for past/today days (future days stay at 0).
  const realData = {};
  SN_DATA.courses.forEach(course => {
    realData[course.id] = [0,0,0,0,0,0,0];
    const completedLessons = [];
    course.modules.forEach(mod =>
      mod.lessons.forEach(l => {
        if (SN_STORAGE.isLessonCompleted(l.id)) completedLessons.push(l.id);
      })
    );
    const pastCount = todayIndex >= 0 ? todayIndex + 1 : 7;
    completedLessons.forEach(lid => {
      const hash = lid.split('').reduce((s,c) => s + c.charCodeAt(0), 0);
      const di = hash % pastCount;
      realData[course.id][di]++;
    });
  });

  // Final data: sample + real completions, capped at future days = 0
  const chartData = {};
  SN_DATA.courses.forEach(course => {
    const sample = SAMPLE[course.id] || [0,0,0,0,0,0,0];
    chartData[course.id] = sample.map((s, di) => {
      if (todayIndex >= 0 && di > todayIndex) return 0; // future = 0
      return s + (realData[course.id][di] || 0);
    });
  });

  // ── Y-axis: pick clean integer max ────────────────────────────────────
  let rawMax = 0;
  SN_DATA.courses.forEach(course => {
    chartData[course.id].forEach(v => { if (v > rawMax) rawMax = v; });
  });
  // Round up to nearest integer ≥ 1 so ticks are always whole numbers
  const yMax = Math.max(4, rawMax);

  // Tick values: 0, 1, 2 … yMax (deduplicated integers)
  const tickCount = Math.min(yMax, 5); // at most 5 ticks
  const tickStep  = Math.ceil(yMax / tickCount);
  const ticks = [];
  for (let t = 0; t <= yMax; t += tickStep) ticks.push(t);
  if (ticks[ticks.length - 1] !== yMax) ticks.push(yMax);

  // ── SVG dimensions ─────────────────────────────────────────────────────
  const svgW   = 700;
  const svgH   = 220;
  const padL   = 36;   // space for Y labels
  const padR   = 16;
  const padT   = 24;   // space for "TODAY" label above column
  const padB   = 38;   // space for day labels
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  // X position for day-column centre
  const colW = chartW / 7;
  const xOf  = di => padL + di * colW + colW / 2;

  // Y position for a value
  const yOf = v => padT + chartH - (v / yMax) * chartH;

  // ── Today column highlight ─────────────────────────────────────────────
  const todayCol = todayIndex >= 0 ? `
    <rect x="${padL + todayIndex * colW}" y="${padT - 6}"
          width="${colW}" height="${chartH + 6}"
          rx="6" fill="var(--color-primary)" opacity="0.07"/>` : '';

  // ── Future-days shaded zone (columns after today) ──────────────────────
  // A single muted rectangle covers all days after todayIndex, plus a
  // dashed vertical divider line and a small "Upcoming" label, so the
  // empty right portion looks intentional rather than broken.
  const futureZone = (() => {
    if (todayIndex < 0 || todayIndex >= 6) return ''; // no future cols visible
    const firstFutureX = padL + (todayIndex + 1) * colW;
    const zoneW = (6 - todayIndex) * colW;
    const dividerX = firstFutureX;
    const labelX = firstFutureX + zoneW / 2;
    const labelY = padT + chartH / 2 - 6;
    return `
      <!-- future zone shade -->
      <rect x="${firstFutureX}" y="${padT - 6}"
            width="${zoneW}" height="${chartH + 6}"
            fill="var(--wtl-future-bg)" rx="0"/>
      <!-- dashed divider after today -->
      <line x1="${dividerX}" y1="${padT - 10}"
            x2="${dividerX}" y2="${padT + chartH + 4}"
            stroke="var(--wtl-future-border)"
            stroke-width="1.5" stroke-dasharray="5 4"/>
      <!-- "Upcoming" label rotated in centre of zone -->
      <text x="${labelX}" y="${labelY}"
            text-anchor="middle" dominant-baseline="middle"
            font-size="11" font-weight="700" letter-spacing="0.08em"
            fill="var(--wtl-future-label)"
            transform="rotate(-90, ${labelX}, ${labelY})">UPCOMING</text>`;
  })();

  // ── Horizontal grid lines + Y-axis labels ─────────────────────────────
  const gridEl = ticks.map(val => {
    const y = yOf(val);
    return `
      <line x1="${padL}" y1="${y}" x2="${svgW - padR}" y2="${y}"
            stroke="var(--border)" stroke-width="${val === 0 ? 1.5 : 1}"
            stroke-dasharray="${val === 0 ? 'none' : '5 4'}"/>
      <text x="${padL - 6}" y="${y + 4}" text-anchor="end"
            font-size="11" fill="var(--text-muted)">${val}</text>`;
  }).join('');

  // ── Lines + dots per course ────────────────────────────────────────────
  const courseLines = SN_DATA.courses.map(course => {
    const vals = chartData[course.id];

    // Build smooth polyline through all 7 points
    // Future days render as open circles at y=0
    const allPoints = vals.map((v, di) => ({ x: xOf(di), y: yOf(v) }));

    // Line path — only draw through non-future segments
    const lineSegments = [];
    let segBuf = [];
    allPoints.forEach((pt, di) => {
      const isFuture = todayIndex >= 0 && di > todayIndex;
      if (!isFuture) {
        segBuf.push(`${pt.x},${pt.y}`);
      } else {
        if (segBuf.length > 1) lineSegments.push(segBuf.join(' '));
        segBuf = [];
      }
    });
    if (segBuf.length > 1) lineSegments.push(segBuf.join(' '));

    const lines = lineSegments.map(pts =>
      `<polyline points="${pts}" fill="none"
                 stroke="${course.color}" stroke-width="2.5"
                 stroke-linejoin="round" stroke-linecap="round"/>`
    ).join('');

    // Area fill (subtle gradient under the line, past days only)
    const pastPoints = allPoints.filter((_, di) => !(todayIndex >= 0 && di > todayIndex));
    let areaPath = '';
    if (pastPoints.length >= 2) {
      const lastX = pastPoints[pastPoints.length - 1].x;
      const firstX = pastPoints[0].x;
      const baseline = yOf(0);
      const ptStr = pastPoints.map(p => `${p.x},${p.y}`).join(' ');
      areaPath = `<polygon points="${firstX},${baseline} ${ptStr} ${lastX},${baseline}"
                            fill="${course.color}" opacity="0.08"/>`;
    }

    // Dots — filled circles for past/today, hollow for future
    const dots = allPoints.map((pt, di) => {
      const isFuture = todayIndex >= 0 && di > todayIndex;
      const isToday  = di === todayIndex;
      const val      = vals[di];
      if (isFuture) return ''; // no dot for future days
      return `
        <circle cx="${pt.x}" cy="${pt.y}" r="${isToday ? 5.5 : 4}"
                fill="${isToday ? course.color : 'var(--bg-card)'}"
                stroke="${course.color}" stroke-width="2"/>
        ${val > 0 ? `<text x="${pt.x}" y="${pt.y - 9}" text-anchor="middle"
                           font-size="10" font-weight="700"
                           fill="${course.color}">${val}</text>` : ''}`;
    }).join('');

    return areaPath + lines + dots;
  }).join('');

  // ── Day labels + TODAY badge ───────────────────────────────────────────
  const dayLabelEls = DAY_LABELS.map((label, di) => {
    const x        = xOf(di);
    const y        = svgH - 8;
    const isToday  = di === todayIndex;
    const isFuture = todayIndex >= 0 && di > todayIndex;
    const textFill = isToday
      ? 'var(--color-primary)'
      : isFuture
        ? 'var(--wtl-future-label)'
        : 'var(--text-muted)';
    return `
      <text x="${x}" y="${y}" text-anchor="middle"
            font-size="12" font-weight="${isToday ? '800' : '500'}"
            fill="${textFill}">${label}</text>
      ${isToday ? `
        <rect x="${x - 16}" y="${padT - 20}" width="32" height="16" rx="8"
              fill="var(--color-primary)"/>
        <text x="${x}" y="${padT - 8}" text-anchor="middle"
              font-size="9" font-weight="800" fill="#fff">TODAY</text>` : ''}`;
  }).join('');

  // ── Y-axis label ───────────────────────────────────────────────────────
  const yAxisLabel = `
    <text x="11" y="${padT + chartH / 2}" text-anchor="middle"
          font-size="11" fill="var(--text-muted)"
          transform="rotate(-90, 11, ${padT + chartH / 2})">Lessons</text>`;

  // ── Legend ─────────────────────────────────────────────────────────────
  const legend = SN_DATA.courses.map(course => {
    const weekTotal = chartData[course.id].reduce((s, v) => s + v, 0);
    return `
      <span class="wtl-legend-item">
        <svg width="28" height="14" viewBox="0 0 28 14" aria-hidden="true">
          <line x1="0" y1="7" x2="28" y2="7" stroke="${course.color}" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="14" cy="7" r="4" fill="var(--bg-card)" stroke="${course.color}" stroke-width="2"/>
        </svg>
        <span class="wtl-legend-name">${course.name}</span>
        <span class="wtl-legend-total" style="color:${course.color}">${weekTotal}</span>
      </span>`;
  }).join('');

  return `
    <div class="weekly-timeline">
      <div class="wtl-chart-wrap">
        <svg viewBox="0 0 ${svgW} ${svgH}" class="wtl-svg"
             role="img" aria-label="Weekly lesson progress by subject">
          ${futureZone}
          ${todayCol}
          ${gridEl}
          ${courseLines}
          ${dayLabelEls}
          ${yAxisLabel}
        </svg>
      </div>
      <div class="wtl-footer">
        <div class="wtl-legend">${legend}</div>
        <p class="wtl-note">Lessons completed per day this week · numbers above dots show daily count</p>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════
// DASHBOARD HELPERS
// ══════════════════════════════════════════════

/** Recommend the single most urgent thing to work on next. */
function buildNextStepCard(assignments, today) {
  // Priority 1 — in-progress assignment closest to due
  // Priority 2 — not-started assignment closest to due
  // Priority 3 — first incomplete lesson in any course
  const actionable = assignments
    .filter(a => !['submitted','graded'].includes(a.status))
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));

  const pick = actionable.find(a => a.status === 'in-progress') || actionable[0];

  if (pick) {
    const course = SN_DATA.courses.find(c => c.id === pick.courseId);
    const overdue = isOverdue(pick.due);
    return {
      type    : 'assignment',
      icon    : course.icon,
      color   : course.color,
      course  : course.name,
      title   : pick.title,
      meta    : overdue
                  ? `⚠️ Overdue — was due ${formatDate(pick.due)}`
                  : `Due ${formatDate(pick.due)} · ${pick.points} pts`,
      action  : () => navigate('assignment', { assignmentId: pick.id }),
      btnLabel: 'Open Assignment →',
      id      : pick.id,
    };
  }

  // Fall back: first incomplete lesson
  for (const course of SN_DATA.courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (!SN_STORAGE.isLessonCompleted(lesson.id)) {
          return {
            type    : 'lesson',
            icon    : course.icon,
            color   : course.color,
            course  : course.name,
            title   : lesson.title,
            meta    : `${mod.title.split('—')[1]?.trim() || mod.title} · ${lesson.duration}`,
            action  : () => navigate('course', { courseId: course.id, tab: 'modules' }),
            btnLabel: 'Go to Module →',
            id      : lesson.id,
          };
        }
      }
    }
  }

  return null; // all done
}

/** Static sample instructor feedback — realistic, distinct per course. */
function buildRecentFeedback() {
  return [
    {
      courseId  : 'hindi',
      instructor: 'Dr. Priya Sharma',
      avatar    : 'P',
      date      : 'Oct 6, 2026',
      assignment: 'Devanagari Script Practice',
      text      : 'Your letter forms are clean and well-proportioned — especially the vowel signs. Focus a little more on the conjunct consonants before the grammar quiz.',
      grade     : '47/50',
    },
    {
      courseId  : 'punjabi',
      instructor: 'Prof. Harjit Kaur',
      avatar    : 'H',
      date      : 'Oct 16, 2026',
      assignment: 'Grammar Worksheet',
      text      : 'Solid work overall. Pay attention to verb agreement with gender — a few sentences had the wrong ending. Review pages 34–36 before the folk story summary.',
      grade     : '88/100',
    },
    {
      courseId  : 'english',
      instructor: 'Ms. Sarah Mitchell',
      avatar    : 'S',
      date      : 'Oct 16, 2026',
      assignment: 'Five-Paragraph Essay',
      text      : 'Essay received — I will return grades within a week. In the meantime your thesis statement in the introduction was very clear and arguable. Keep that structure for the presentation.',
      grade     : 'Pending',
    },
  ];
}

/**
 * Progress Over Time — simulated weekly snapshots.
 * We derive a plausible curve from the current overall grade
 * so it always looks coherent with real data.
 */
function buildProgressOverTime() {
  const overall = SN_STORAGE.overallGrade();
  const base = overall.pct !== null ? overall.pct : 88;
  // Six weekly snapshots ending at current value
  const offsets = [-18, -12, -8, -4, -1, 0];
  return offsets.map((o, i) => ({
    label: `Wk ${i + 1}`,
    pct  : Math.min(100, Math.max(50, base + o + Math.round(Math.sin(i) * 2))),
  }));
}

// ══════════════════════════════════════════════
// PAGE — DASHBOARD
// ══════════════════════════════════════════════
function renderDashboard() {
  const settings    = SN_STORAGE.getSettings();
  const assignments = SN_STORAGE.getAssignments();
  const overall     = SN_STORAGE.overallGrade();
  const today       = todayStr();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // ── Derived counts ──────────────────────────────────────────────────────
  // Total lessons + assignments completed across all courses
  let totalLessons = 0, doneLessons = 0;
  SN_DATA.courses.forEach(c => {
    const p = SN_STORAGE.courseProgress(c.id);
    totalLessons += p.total;
    doneLessons  += p.completed;
  });
  const totalAssignments = assignments.length;
  const doneAssignments  = assignments.filter(a => ['submitted','graded'].includes(a.status)).length;
  const overallPct = totalLessons + totalAssignments > 0
    ? Math.round(((doneLessons + doneAssignments) / (totalLessons + totalAssignments)) * 100)
    : 0;

  // Upcoming assignments (not done, not overdue)
  const upcomingList = assignments
    .filter(a => !['submitted','graded'].includes(a.status) && a.due >= today)
    .sort((a, b) => a.due.localeCompare(b.due));
  const upcomingCount = upcomingList.length;

  // Lessons completed this week (from SAMPLE baseline in timeline — use the same logic)
  const SAMPLE_WEEK = { hindi: [2,1,3,2,0,1,2], punjabi: [1,3,1,2,2,0,1], english: [3,2,2,1,3,1,0] };
  const now = new Date();
  const dow = now.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const weekDates = Array.from({length:7}, (_,i) => {
    const d = new Date(now); d.setDate(now.getDate() + mondayOffset + i);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
  const todayIndex = weekDates.indexOf(today);
  let weekLessons = 0;
  SN_DATA.courses.forEach(c => {
    const sample = SAMPLE_WEEK[c.id] || [];
    sample.forEach((v, di) => { if (di <= todayIndex) weekLessons += v; });
  });

  // ── Section 1 — Summary cards ───────────────────────────────────────────
  const summaryCards = `
    <div class="db-summary-grid">
      <div class="db-summary-card">
        <div class="db-sc-icon" style="background:var(--color-primary-light);color:var(--color-primary)">📈</div>
        <div class="db-sc-body">
          <div class="db-sc-value">${overallPct}%</div>
          <div class="db-sc-label">Overall Progress</div>
          <div class="db-sc-sub">${doneLessons + doneAssignments} of ${totalLessons + totalAssignments} items done</div>
        </div>
      </div>
      <div class="db-summary-card">
        <div class="db-sc-icon" style="background:var(--color-warning-light);color:var(--color-warning)">📝</div>
        <div class="db-sc-body">
          <div class="db-sc-value">${upcomingCount}</div>
          <div class="db-sc-label">Assignments Due</div>
          <div class="db-sc-sub">${upcomingList[0] ? 'Next: ' + formatDate(upcomingList[0].due) : 'All caught up!'}</div>
        </div>
      </div>
      <div class="db-summary-card">
        <div class="db-sc-icon" style="background:var(--color-info-light);color:var(--color-info)">⚡</div>
        <div class="db-sc-body">
          <div class="db-sc-value">${weekLessons}</div>
          <div class="db-sc-label">Study Activity</div>
          <div class="db-sc-sub">Lessons completed this week</div>
        </div>
      </div>
      <div class="db-summary-card">
        <div class="db-sc-icon" style="background:var(--color-success-light);color:var(--color-success)">🏆</div>
        <div class="db-sc-body">
          <div class="db-sc-value">${overall.pct !== null ? overall.pct + '%' : '—'}</div>
          <div class="db-sc-label">Current Performance</div>
          <div class="db-sc-sub">Grade: ${overall.letter} · Demo average</div>
        </div>
      </div>
    </div>`;

  // ── Section 2 — Welcome banner (compact) ────────────────────────────────
  const welcomeBanner = `
    <div class="welcome-banner">
      <div>
        <h2>${greeting}, ${escHtml(settings.studentName)} 👋</h2>
        <p>${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
      </div>
      <div class="quick-links-inline">
        <button class="ql-btn" data-page="courses">📚 Courses</button>
        <button class="ql-btn" data-page="assignments">📝 Assignments</button>
        <button class="ql-btn" data-page="grades">📊 Grades</button>
        <button class="ql-btn" data-page="calendar">📅 Calendar</button>
      </div>
    </div>`;

  // ── Section 3 — Progress by Course ──────────────────────────────────────
  const progressByCourse = `
    <section class="dash-section">
      <h3 class="section-title">Progress by Course</h3>
      <div class="db-course-progress-list">
        ${SN_DATA.courses.map(course => {
          const prog  = SN_STORAGE.courseProgress(course.id);
          const grade = SN_STORAGE.courseGrade(course.id);
          const cas   = assignments.filter(a => a.courseId === course.id);
          const cadone= cas.filter(a => ['submitted','graded'].includes(a.status)).length;
          return `
            <div class="db-cp-row" data-course="${course.id}">
              <div class="db-cp-left">
                <span class="db-cp-icon" style="background:${course.color}22;color:${course.color}">${course.icon}</span>
                <div class="db-cp-info">
                  <div class="db-cp-name">${course.name}
                    <span class="db-cp-code">${course.code}</span>
                  </div>
                  <div class="db-cp-meta">
                    ${prog.completed}/${prog.total} lessons
                    · ${cadone}/${cas.length} assignments
                    · Grade: <strong style="color:${course.color}">${grade.letter}</strong>
                    ${grade.pct !== null ? `<span class="db-cp-pct">${grade.pct}%</span>` : ''}
                  </div>
                </div>
              </div>
              <div class="db-cp-right">
                <div class="db-cp-pct-label">${prog.pct}%</div>
                <div class="db-cp-bar">
                  <div class="db-cp-bar-fill" style="width:${prog.pct}%;background:${course.color}"></div>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </section>`;

  // ── Section 4 — Weekly Progress Timeline ────────────────────────────────
  const weeklySection = `
    <section class="dash-section">
      <h3 class="section-title">Weekly Progress — Lessons Completed This Week</h3>
      ${buildWeeklyTimeline()}
    </section>`;

  // ── Section 5 — What to Work on Next ────────────────────────────────────
  const next = buildNextStepCard(assignments, today);
  const nextSection = next ? `
    <section class="db-next-card" data-next-id="${next.id}" data-next-type="${next.type}">
      <div class="db-next-left">
        <div class="db-next-badge">💡 Recommended Next Step</div>
        <div class="db-next-title">${escHtml(next.title)}</div>
        <div class="db-next-meta">
          <span class="db-next-course" style="color:${next.color}">${next.icon} ${next.course}</span>
          <span class="db-next-due">${next.meta}</span>
        </div>
      </div>
      <button class="btn btn-primary db-next-btn" id="db-next-btn">${next.btnLabel}</button>
    </section>` : `
    <section class="db-next-card db-next-done">
      <div class="db-next-badge">🎉 All caught up!</div>
      <div class="db-next-title">No pending assignments or incomplete lessons.</div>
      <div class="db-next-meta">Keep up the great work.</div>
    </section>`;

  // ── Section 6 — Progress Over Time (sparkline) ──────────────────────────
  const weeks = buildProgressOverTime();
  const potW = 480, potH = 100, potPadL = 32, potPadB = 22, potPadT = 10, potPadR = 10;
  const potChartW = potW - potPadL - potPadR;
  const potChartH = potH - potPadT - potPadB;
  const potXOf = i => potPadL + (i / (weeks.length - 1)) * potChartW;
  const potYOf = v => potPadT + potChartH - ((v - 50) / 50) * potChartH;

  const potPoints = weeks.map((w, i) => `${potXOf(i)},${potYOf(w.pct)}`).join(' ');
  const potArea   = `${potPadL},${potPadT + potChartH} ${potPoints} ${potXOf(weeks.length-1)},${potPadT + potChartH}`;
  const potDots   = weeks.map((w, i) => {
    const x = potXOf(i), y = potYOf(w.pct);
    const isLast = i === weeks.length - 1;
    return `<circle cx="${x}" cy="${y}" r="${isLast ? 5 : 3}"
              fill="${isLast ? 'var(--color-primary)' : 'var(--bg-card)'}"
              stroke="var(--color-primary)" stroke-width="2"/>
            <text x="${x}" y="${y - 8}" text-anchor="middle"
                  font-size="9" fill="var(--color-primary)" font-weight="${isLast ? '700':'400'}">${w.pct}%</text>`;
  }).join('');
  const potLabels = weeks.map((w, i) =>
    `<text x="${potXOf(i)}" y="${potH - 4}" text-anchor="middle" font-size="10" fill="var(--text-muted)">${w.label}</text>`
  ).join('');
  // Y-axis ticks: 50, 75, 100
  const potGridLines = [50, 75, 100].map(v => {
    const y = potYOf(v);
    return `<line x1="${potPadL}" y1="${y}" x2="${potW - potPadR}" y2="${y}"
                  stroke="var(--border)" stroke-width="1" stroke-dasharray="${v===50?'none':'4 3'}"/>
            <text x="${potPadL - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="var(--text-muted)">${v}</text>`;
  }).join('');

  const progressOverTime = `
    <section class="dash-section db-pot-section">
      <div class="db-pot-header">
        <h3 class="section-title" style="margin:0">Progress Over Time</h3>
        <span class="db-pot-sub">6-week overall completion trend · demo data</span>
      </div>
      <div class="db-pot-wrap">
        <svg viewBox="0 0 ${potW} ${potH}" class="db-pot-svg"
             role="img" aria-label="Progress over time chart">
          ${potGridLines}
          <polygon points="${potArea}" fill="var(--color-primary)" opacity="0.08"/>
          <polyline points="${potPoints}" fill="none"
                    stroke="var(--color-primary)" stroke-width="2.5"
                    stroke-linejoin="round" stroke-linecap="round"/>
          ${potDots}
          ${potLabels}
        </svg>
      </div>
    </section>`;

  // ── Section 7 — Two-column bottom: Upcoming + Recent Feedback ──────────
  const upcomingRows = upcomingList.length
    ? upcomingList.slice(0, 5).map(a => {
        const course = SN_DATA.courses.find(c => c.id === a.courseId);
        return `<div class="upcoming-row ${isDueToday(a.due) ? 'due-today' : ''}" data-assignment="${a.id}">
          <div class="upcoming-dot" style="background:${course.color}"></div>
          <div class="upcoming-info">
            <div class="upcoming-title">${escHtml(a.title)}</div>
            <div class="upcoming-meta">${course.name} · ${a.points} pts</div>
          </div>
          <div class="upcoming-due">${isDueToday(a.due) ? '🔔 Today' : formatDate(a.due)}</div>
          ${statusBadge(a.status)}
        </div>`;
      }).join('')
    : '<p class="empty-hint">No upcoming assignments 🎉</p>';

  const feedbackItems = buildRecentFeedback().map(f => {
    const course = SN_DATA.courses.find(c => c.id === f.courseId);
    return `
      <div class="db-fb-item">
        <div class="db-fb-avatar" style="background:${course.color}">${f.avatar}</div>
        <div class="db-fb-body">
          <div class="db-fb-header">
            <span class="db-fb-from">${escHtml(f.instructor)}</span>
            <span class="db-fb-course" style="color:${course.color}">${course.icon} ${escHtml(course.name)}</span>
            <span class="db-fb-date">${f.date}</span>
          </div>
          <div class="db-fb-assignment">Re: ${escHtml(f.assignment)}
            <span class="db-fb-grade" style="color:${course.color}">${f.grade}</span>
          </div>
          <p class="db-fb-text">"${escHtml(f.text)}"</p>
        </div>
      </div>`;
  }).join('');

  const bottomRow = `
    <div class="dash-bottom">
      <section class="dash-section">
        <h3 class="section-title">Upcoming Assignments</h3>
        <div class="upcoming-list">${upcomingRows}</div>
      </section>
      <section class="dash-section">
        <h3 class="section-title">Recent Instructor Feedback</h3>
        <div class="db-feedback-list">${feedbackItems}</div>
      </section>
    </div>`;

  // ── Assemble ────────────────────────────────────────────────────────────
  mainContent.innerHTML = `
    <div class="dashboard">
      ${welcomeBanner}
      ${summaryCards}
      ${progressByCourse}
      ${weeklySection}
      ${nextSection}
      ${progressOverTime}
      ${bottomRow}
    </div>`;

  // ── Events ──────────────────────────────────────────────────────────────
  mainContent.querySelectorAll('.ql-btn').forEach(btn =>
    btn.addEventListener('click', () => navigate(btn.dataset.page))
  );
  mainContent.querySelectorAll('.db-cp-row[data-course]').forEach(row =>
    row.addEventListener('click', () => navigate('course', { courseId: row.dataset.course }))
  );
  mainContent.querySelectorAll('[data-assignment]').forEach(row =>
    row.addEventListener('click', () => navigate('assignment', { assignmentId: row.dataset.assignment }))
  );
  if (next) {
    document.getElementById('db-next-btn').addEventListener('click', next.action);
  }
}

// ══════════════════════════════════════════════
// PAGE — COURSES
// ══════════════════════════════════════════════
function renderCourses() {
  const cards = SN_DATA.courses.map(course => {
    const prog  = SN_STORAGE.courseProgress(course.id);
    const grade = SN_STORAGE.courseGrade(course.id);
    const assignments = SN_STORAGE.getAssignments().filter(a => a.courseId === course.id);
    return `
      <div class="course-card" data-course="${course.id}">
        <div class="cc-header" style="background:${course.color}">
          <span class="cc-icon">${course.icon}</span>
          <div class="cc-header-info">
            <div class="cc-name">${course.name}</div>
            <div class="cc-code">${course.code}</div>
          </div>
          <div class="cc-grade-badge">${grade.letter}</div>
        </div>
        <div class="cc-body">
          <p class="cc-instructor">👨‍🏫 ${course.instructor}</p>
          <p class="cc-desc">${course.description}</p>
          <div class="cc-progress-row">
            <span>Progress</span><span>${prog.pct}%</span>
          </div>
          ${progressBar(prog.pct)}
          <div class="cc-stats">
            <span>📦 ${course.modules.length} Modules</span>
            <span>📝 ${assignments.length} Assignments</span>
            <span>⭐ ${course.credits} Credits</span>
          </div>
          <button class="btn btn-primary btn-full" data-course="${course.id}">View Course →</button>
        </div>
      </div>`;
  }).join('');

  mainContent.innerHTML = `
    <div class="courses-page">
      <div class="courses-grid">${cards}</div>
    </div>`;

  mainContent.querySelectorAll('[data-course]').forEach(el => {
    el.addEventListener('click', () => navigate('course', { courseId: el.dataset.course }));
  });
}

// ══════════════════════════════════════════════
// PAGE — COURSE DETAIL
// ══════════════════════════════════════════════
function renderCourseDetail() {
  const { courseId } = currentParams;
  const course = SN_DATA.courses.find(c => c.id === courseId);
  if (!course) { mainContent.innerHTML = '<p>Course not found.</p>'; return; }

  const prog  = SN_STORAGE.courseProgress(courseId);
  const grade = SN_STORAGE.courseGrade(courseId);
  const tab   = currentParams.tab || 'overview';

  const tabs = ['overview','modules','assignments','grades'];
  const tabNav = tabs.map(t =>
    `<button class="tab-btn ${tab===t?'active':''}" data-tab="${t}">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`
  ).join('');

  let tabContent = '';
  if (tab === 'overview') {
    tabContent = renderCourseOverviewTab(course, prog, grade);
  } else if (tab === 'modules') {
    tabContent = renderCourseModulesTab(course);
  } else if (tab === 'assignments') {
    tabContent = renderCourseAssignmentsTab(course);
  } else if (tab === 'grades') {
    tabContent = renderCourseGradesTab(course, grade);
  }

  mainContent.innerHTML = `
    <div class="course-detail">
      <button class="back-btn" id="back-courses">← Back to Courses</button>
      <div class="cd-hero" style="border-left:6px solid ${course.color}">
        <div class="cd-hero-left">
          <span class="cd-icon">${course.icon}</span>
          <div>
            <h2>${course.name}</h2>
            <p class="cd-meta">${course.code} · ${course.instructor} · ${course.credits} Credits</p>
            <p class="cd-desc">${course.description}</p>
          </div>
        </div>
        <div class="cd-hero-right">
          <div class="cd-stat">
            <span class="cd-stat-val" style="color:${course.color}">${grade.pct !== null ? grade.pct+'%' : '—'}</span>
            <span class="cd-stat-label">Grade</span>
          </div>
          <div class="cd-stat">
            <span class="cd-stat-val">${grade.letter}</span>
            <span class="cd-stat-label">Letter</span>
          </div>
          <div class="cd-stat">
            <span class="cd-stat-val">${prog.pct}%</span>
            <span class="cd-stat-label">Complete</span>
          </div>
        </div>
      </div>
      <div class="tab-nav">${tabNav}</div>
      <div class="tab-content">${tabContent}</div>
    </div>`;

  document.getElementById('back-courses').addEventListener('click', () => navigate('courses'));
  mainContent.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('course', { courseId, tab: btn.dataset.tab }));
  });
  // Module expand/collapse
  mainContent.querySelectorAll('.module-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('expanded');
    });
  });
  // Lesson checkboxes
  mainContent.querySelectorAll('.lesson-check').forEach(cb => {
    cb.addEventListener('change', () => {
      SN_STORAGE.toggleLesson(cb.dataset.lesson);
      navigate('course', { courseId, tab: 'modules' });
    });
  });
  // Assignment rows
  mainContent.querySelectorAll('[data-assignment]').forEach(row => {
    row.addEventListener('click', () => navigate('assignment', { assignmentId: row.dataset.assignment }));
  });
}

function renderCourseOverviewTab(course, prog, grade) {
  const assignments = SN_STORAGE.getAssignments().filter(a => a.courseId === course.id);
  const done = assignments.filter(a => ['submitted','graded'].includes(a.status)).length;
  return `
    <div class="overview-grid">
      <div class="overview-card">
        <h4>Course Progress</h4>
        ${progressBar(prog.pct)}
        <p>${prog.completed} of ${prog.total} lessons completed (${prog.pct}%)</p>
      </div>
      <div class="overview-card">
        <h4>Current Grade</h4>
        <div class="big-grade" style="color:${course.color}">${grade.pct !== null ? grade.pct+'%' : 'No grades yet'}</div>
        <div class="big-letter">${grade.letter}</div>
        ${grade.earned != null ? `<p>${grade.earned} / ${grade.possible} points earned</p>` : ''}
      </div>
      <div class="overview-card">
        <h4>Assignments</h4>
        <p>${done} of ${assignments.length} completed</p>
        ${progressBar(assignments.length ? Math.round((done/assignments.length)*100) : 0)}
      </div>
      <div class="overview-card">
        <h4>Modules</h4>
        <p>${course.modules.length} modules · ${prog.total} total lessons</p>
        ${course.modules.map(m => {
          const mp = SN_STORAGE.moduleProgress(m.id);
          return `<div class="mini-module-row">
            <span>${m.title.split('—')[0].trim()}</span>
            <span>${mp.pct}%</span>
          </div>${progressBar(mp.pct)}`;
        }).join('')}
      </div>
    </div>`;
}

function renderCourseModulesTab(course) {
  return `<div class="modules-list">
    ${course.modules.map(mod => {
      const mp = SN_STORAGE.moduleProgress(mod.id);
      return `<div class="module-item ${mp.pct===100?'completed':''}">
        <div class="module-header">
          <div class="module-title-row">
            <span class="module-chevron">▶</span>
            <div>
              <div class="module-title">${escHtml(mod.title)}</div>
              <div class="module-meta">${mp.completed}/${mp.total} lessons · ${mp.pct}%</div>
            </div>
          </div>
          <div class="module-progress-col">
            ${progressBar(mp.pct)}
            ${mp.pct===100 ? '<span class="badge badge-success">✓ Complete</span>' : ''}
          </div>
        </div>
        <div class="module-lessons">
          ${mod.lessons.map(l => {
            const done = SN_STORAGE.isLessonCompleted(l.id);
            return `<label class="lesson-row ${done?'done':''}">
              <input type="checkbox" class="lesson-check" data-lesson="${l.id}" ${done?'checked':''} />
              <span class="lesson-title">${escHtml(l.title)}</span>
              <span class="lesson-dur">${l.duration}</span>
              ${done ? '<span class="lesson-check-icon">✓</span>' : ''}
            </label>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderCourseAssignmentsTab(course) {
  const assignments = SN_STORAGE.getAssignments().filter(a => a.courseId === course.id);
  if (!assignments.length) return '<p class="empty-hint">No assignments yet.</p>';
  return `<div class="assignment-list">
    ${assignments.map(a => `
      <div class="assignment-row" data-assignment="${a.id}">
        <div class="ar-left">
          <div class="ar-title">${escHtml(a.title)}</div>
          <div class="ar-meta">${formatDate(a.due)} · ${a.points} pts</div>
        </div>
        <div class="ar-right">
          ${statusBadge(a.status)}
          ${a.grade !== null ? gradeBadge(Math.round((a.grade/a.points)*100)) : ''}
        </div>
      </div>`).join('')}
  </div>`;
}

function renderCourseGradesTab(course, grade) {
  const assignments = SN_STORAGE.getAssignments().filter(
    a => a.courseId === course.id && a.status === 'graded'
  );
  if (!assignments.length) return '<p class="empty-hint">No graded assignments yet.</p>';
  return `
    <div class="grades-tab">
      <div class="grade-summary-card" style="border-color:${course.color}">
        <div class="gsc-grade" style="color:${course.color}">${grade.pct}%</div>
        <div class="gsc-letter">${grade.letter}</div>
        <div class="gsc-detail">${grade.earned} / ${grade.possible} points</div>
      </div>
      ${assignments.map(a => `
        <div class="grade-row">
          <div class="gr-title">${escHtml(a.title)}</div>
          <div class="gr-pts">${a.grade} / ${a.points}</div>
          ${gradeBadge(Math.round((a.grade/a.points)*100))}
        </div>`).join('')}
    </div>`;
}

// ══════════════════════════════════════════════
// PAGE — ASSIGNMENTS
// ══════════════════════════════════════════════
function renderAssignments() {
  const filter = currentParams.filter || 'all';
  const sort   = currentParams.sort   || 'due';
  const today  = todayStr();

  let list = SN_STORAGE.getAssignments();

  if (filter === 'upcoming')  list = list.filter(a => !['submitted','graded'].includes(a.status) && a.due >= today);
  if (filter === 'submitted') list = list.filter(a => a.status === 'submitted');
  if (filter === 'graded')    list = list.filter(a => a.status === 'graded');
  if (filter === 'late')      list = list.filter(a => a.status === 'late' || (!['submitted','graded'].includes(a.status) && isOverdue(a.due)));

  if (sort === 'due')      list.sort((a,b) => (a.due||'').localeCompare(b.due||''));
  if (sort === 'course')   list.sort((a,b) => a.courseId.localeCompare(b.courseId));
  if (sort === 'status')   list.sort((a,b) => a.status.localeCompare(b.status));
  if (sort === 'grade')    list.sort((a,b) => (b.grade||0) - (a.grade||0));

  const filters = ['all','upcoming','submitted','graded','late'];
  const filterNav = filters.map(f =>
    `<button class="filter-pill ${filter===f?'active':''}" data-filter="${f}">${f.charAt(0).toUpperCase()+f.slice(1)}</button>`
  ).join('');

  const rows = list.length ? list.map(a => {
    const course = SN_DATA.courses.find(c => c.id === a.courseId);
    const overdue = !['submitted','graded'].includes(a.status) && isOverdue(a.due);
    return `
      <div class="assignment-row clickable" data-assignment="${a.id}">
        <div class="ar-course-dot" style="background:${course.color}"></div>
        <div class="ar-left">
          <div class="ar-title">${escHtml(a.title)}</div>
          <div class="ar-meta">
            ${course.name} ·
            ${overdue ? '<span class="overdue-label">⚠️ Overdue</span>' : formatDate(a.due)} ·
            ${a.points} pts
          </div>
        </div>
        <div class="ar-right">
          ${statusBadge(a.status)}
          ${a.grade !== null ? gradeBadge(Math.round((a.grade/a.points)*100)) : ''}
        </div>
      </div>`;
  }).join('') : '<p class="empty-hint">No assignments match this filter.</p>';

  mainContent.innerHTML = `
    <div class="assignments-page">
      <div class="assignments-toolbar">
        <div class="filter-pills">${filterNav}</div>
        <div class="sort-row">
          <label>Sort by</label>
          <select id="sort-select">
            <option value="due"    ${sort==='due'   ?'selected':''}>Due Date</option>
            <option value="course" ${sort==='course'?'selected':''}>Course</option>
            <option value="status" ${sort==='status'?'selected':''}>Status</option>
            <option value="grade"  ${sort==='grade' ?'selected':''}>Grade</option>
          </select>
        </div>
      </div>
      <div class="assignment-list">${rows}</div>
    </div>`;

  mainContent.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => navigate('assignments', { filter: btn.dataset.filter, sort }));
  });
  document.getElementById('sort-select').addEventListener('change', e => {
    navigate('assignments', { filter, sort: e.target.value });
  });
  mainContent.querySelectorAll('[data-assignment]').forEach(row => {
    row.addEventListener('click', () => navigate('assignment', { assignmentId: row.dataset.assignment }));
  });
}

// ══════════════════════════════════════════════
// PAGE — ASSIGNMENT DETAIL
// ══════════════════════════════════════════════
function renderAssignmentDetail() {
  const a = SN_STORAGE.getAssignment(currentParams.assignmentId);
  if (!a) { mainContent.innerHTML = '<p>Assignment not found.</p>'; return; }

  const course  = SN_DATA.courses.find(c => c.id === a.courseId);
  const overdue = !['submitted','graded'].includes(a.status) && isOverdue(a.due);
  const pct     = a.grade !== null ? Math.round((a.grade / a.points) * 100) : null;

  mainContent.innerHTML = `
    <div class="assignment-detail">
      <button class="back-btn" id="back-assign">← Back to Assignments</button>

      <div class="ad-card">
        <div class="ad-header" style="border-left:6px solid ${course.color}">
          <div>
            <h2>${escHtml(a.title)}</h2>
            <p class="ad-meta">
              <span style="color:${course.color}">${course.icon} ${course.name}</span> ·
              ${a.points} points possible ·
              Due: ${formatDate(a.due)}
              ${overdue ? '<span class="overdue-label">⚠️ Overdue</span>' : ''}
            </p>
          </div>
          <div class="ad-status-col">
            ${statusBadge(a.status)}
            ${pct !== null ? gradeBadge(pct) : ''}
          </div>
        </div>

        <div class="ad-body">
          <h3>Instructions</h3>
          <p class="ad-instructions">${escHtml(a.description)}</p>

          ${a.grade !== null ? `
            <div class="grade-feedback-box">
              <h3>Grade</h3>
              <div class="gfb-row">
                <span class="gfb-score">${a.grade} / ${a.points}</span>
                ${gradeBadge(pct)}
              </div>
            </div>` : ''}

          <div class="submission-area">
            <h3>Submission</h3>
            <p class="sub-hint">This is a practice submission area. No files are uploaded.</p>
            <textarea id="sub-text" placeholder="Type your notes or work here…" rows="5">${escHtml(a.submissionText || '')}</textarea>
            <div class="sub-actions">
              ${a.status !== 'graded' ? `
                <button class="btn btn-secondary" id="btn-progress">Mark In Progress</button>
                <button class="btn btn-primary"   id="btn-submit">Submit Assignment</button>
                ${a.status !== 'not-started' ? `<button class="btn btn-ghost" id="btn-reset">Reset Status</button>` : ''}
              ` : '<p class="graded-note">✅ This assignment has been graded.</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('back-assign').addEventListener('click', () => navigate('assignments'));

  if (a.status !== 'graded') {
    const btnProgress = document.getElementById('btn-progress');
    const btnSubmit   = document.getElementById('btn-submit');
    const btnReset    = document.getElementById('btn-reset');
    const subText     = document.getElementById('sub-text');

    if (btnProgress) btnProgress.addEventListener('click', () => {
      SN_STORAGE.updateAssignment(a.id, { status: 'in-progress', submissionText: subText.value });
      navigate('assignment', { assignmentId: a.id });
    });
    btnSubmit.addEventListener('click', () => {
      SN_STORAGE.updateAssignment(a.id, { status: 'submitted', submissionText: subText.value });
      navigate('assignment', { assignmentId: a.id });
    });
    if (btnReset) btnReset.addEventListener('click', () => {
      SN_STORAGE.updateAssignment(a.id, { status: 'not-started', submissionText: '' });
      navigate('assignment', { assignmentId: a.id });
    });
  }
}

// ══════════════════════════════════════════════
// PAGE — GRADES
// ══════════════════════════════════════════════
function renderGrades() {
  const overall = SN_STORAGE.overallGrade();

  const courseBlocks = SN_DATA.courses.map(course => {
    const grade = SN_STORAGE.courseGrade(course.id);
    const assignments = SN_STORAGE.getAssignments().filter(
      a => a.courseId === course.id && a.status === 'graded'
    );
    const rows = assignments.map(a => `
      <div class="grade-row">
        <div class="gr-title">${escHtml(a.title)}</div>
        <div class="gr-pts">${a.grade} / ${a.points}</div>
        ${gradeBadge(Math.round((a.grade/a.points)*100))}
      </div>`).join('') || '<p class="empty-hint">No graded assignments yet.</p>';

    return `
      <div class="grade-course-block">
        <div class="gcb-header" style="border-left:5px solid ${course.color}">
          <div class="gcb-title">
            <span>${course.icon}</span>
            <div>
              <div class="gcb-name">${course.name}</div>
              <div class="gcb-code">${course.code} · ${course.instructor}</div>
            </div>
          </div>
          <div class="gcb-grade-col">
            <span class="gcb-pct" style="color:${course.color}">${grade.pct !== null ? grade.pct+'%' : '—'}</span>
            <span class="gcb-letter">${grade.letter}</span>
          </div>
        </div>
        ${grade.pct !== null ? progressBar(grade.pct) : ''}
        <div class="gcb-rows">${rows}</div>
      </div>`;
  }).join('');

  mainContent.innerHTML = `
    <div class="grades-page">
      <div class="overall-summary-card">
        <div class="osc-left">
          <div class="osc-label">Overall Average</div>
          <div class="osc-sub">Sample/demo calculation across graded assignments</div>
        </div>
        <div class="osc-right">
          <span class="osc-pct">${overall.pct !== null ? overall.pct+'%' : '—'}</span>
          <span class="osc-letter">${overall.letter}</span>
        </div>
      </div>
      ${courseBlocks}
    </div>`;
}

// ══════════════════════════════════════════════
// PAGE — CALENDAR
// ══════════════════════════════════════════════
function renderCalendar() {
  const view  = currentParams.view  || 'upcoming';
  const today = todayStr();
  const [ty, tm] = today.split('-').map(Number);
  const year  = currentParams.year  || ty;
  const month = currentParams.month || tm;

  const views = ['upcoming','month','week'];
  const viewNav = views.map(v =>
    `<button class="filter-pill ${view===v?'active':''}" data-view="${v}">${v.charAt(0).toUpperCase()+v.slice(1)}</button>`
  ).join('');

  let calContent = '';
  if (view === 'upcoming') calContent = renderCalendarUpcoming(today);
  if (view === 'month')    calContent = renderCalendarMonth(year, month, today);
  if (view === 'week')     calContent = renderCalendarWeek(today);

  mainContent.innerHTML = `
    <div class="calendar-page">
      <div class="filter-pills">${viewNav}</div>
      ${calContent}
    </div>`;

  mainContent.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => navigate('calendar', { view: btn.dataset.view, year, month }));
  });
  mainContent.querySelectorAll('.cal-prev').forEach(btn =>
    btn.addEventListener('click', () => {
      let nm = month - 1, ny = year;
      if (nm < 1) { nm = 12; ny--; }
      navigate('calendar', { view: 'month', year: ny, month: nm });
    })
  );
  mainContent.querySelectorAll('.cal-next').forEach(btn =>
    btn.addEventListener('click', () => {
      let nm = month + 1, ny = year;
      if (nm > 12) { nm = 1; ny++; }
      navigate('calendar', { view: 'month', year: ny, month: nm });
    })
  );
}

function renderCalendarUpcoming(today) {
  const events = SN_DATA.events
    .filter(e => e.date >= today)
    .sort((a,b) => a.date.localeCompare(b.date));
  if (!events.length) return '<p class="empty-hint">No upcoming events.</p>';
  return `<div class="event-list">
    ${events.map(e => {
      const course = e.courseId ? SN_DATA.courses.find(c => c.id === e.courseId) : null;
      const color  = course ? course.color : '#6366f1';
      return `<div class="event-row">
        <div class="event-date-col">
          <div class="event-day">${new Date(...e.date.split('-').map((v,i)=>i===1?v-1:+v)).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
        </div>
        <div class="event-dot" style="background:${color}"></div>
        <div class="event-info">
          <div class="event-title">${escHtml(e.title)}</div>
          <div class="event-type-badge ${e.type==='assignment'?'badge-warning':'badge-info'} badge">${e.type}</div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderCalendarMonth(year, month, today) {
  const monthName = new Date(year, month-1, 1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const firstDay  = new Date(year, month-1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const eventMap = {};
  SN_DATA.events.forEach(e => { (eventMap[e.date] = eventMap[e.date]||[]).push(e); });

  const dayHeaders = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(
    d => `<div class="cal-day-header">${d}</div>`
  ).join('');

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div class="cal-cell empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === today;
    const dayEvents = eventMap[dateStr] || [];
    const dots = dayEvents.slice(0,3).map(e => {
      const c = e.courseId ? SN_DATA.courses.find(x=>x.id===e.courseId) : null;
      return `<span class="cal-dot" style="background:${c?c.color:'#6366f1'}" title="${escHtml(e.title)}"></span>`;
    }).join('');
    cells += `<div class="cal-cell ${isToday?'today':''}">
      <div class="cal-cell-num">${d}</div>
      <div class="cal-dots">${dots}</div>
    </div>`;
  }

  return `
    <div class="cal-month-nav">
      <button class="btn btn-ghost cal-prev">‹ Prev</button>
      <h3>${monthName}</h3>
      <button class="btn btn-ghost cal-next">Next ›</button>
    </div>
    <div class="cal-grid">
      ${dayHeaders}${cells}
    </div>`;
}

function renderCalendarWeek(today) {
  const d = new Date(today);
  const dow = d.getDay();
  const weekStart = new Date(d); weekStart.setDate(d.getDate() - dow);
  const days = Array.from({length:7}, (_,i) => {
    const dd = new Date(weekStart); dd.setDate(weekStart.getDate()+i);
    return `${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,'0')}-${String(dd.getDate()).padStart(2,'0')}`;
  });

  return `<div class="week-grid">
    ${days.map(dateStr => {
      const dayEvents = SN_DATA.events.filter(e => e.date === dateStr);
      const isToday   = dateStr === today;
      const label     = new Date(...dateStr.split('-').map((v,i)=>i===1?v-1:+v))
                          .toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
      return `<div class="week-col ${isToday?'today':''}">
        <div class="week-day-label">${label}</div>
        ${dayEvents.length
          ? dayEvents.map(e => {
              const c = e.courseId ? SN_DATA.courses.find(x=>x.id===e.courseId):null;
              return `<div class="week-event" style="border-left:3px solid ${c?c.color:'#6366f1'}">${escHtml(e.title)}</div>`;
            }).join('')
          : '<div class="week-empty">—</div>'}
      </div>`;
    }).join('')}
  </div>`;
}

// ══════════════════════════════════════════════
// PAGE — INBOX
// ══════════════════════════════════════════════
function renderInbox() {
  const messages  = SN_STORAGE.getMessages();
  const activeId  = currentParams.messageId || null;
  const active    = activeId ? messages.find(m => m.id === activeId) : null;

  const msgList = messages.map(m => `
    <div class="msg-row ${m.read?'read':'unread'} ${activeId===m.id?'active':''}" data-msg="${m.id}">
      <div class="msg-avatar">${m.from.charAt(0)}</div>
      <div class="msg-preview">
        <div class="msg-from">${escHtml(m.from)} ${!m.read ? '<span class="unread-dot"></span>' : ''}</div>
        <div class="msg-subject">${escHtml(m.subject)}</div>
        <div class="msg-date">${formatDate(m.date)}</div>
      </div>
    </div>`).join('');

  const msgBody = active ? `
    <div class="msg-detail">
      <div class="msg-detail-header">
        <h3>${escHtml(active.subject)}</h3>
        <p class="msg-detail-meta">From: ${escHtml(active.from)} · ${escHtml(active.course)} · ${formatDate(active.date)}</p>
      </div>
      <div class="msg-detail-body">${escHtml(active.body)}</div>
    </div>` : `<div class="msg-placeholder">← Select a message to read</div>`;

  mainContent.innerHTML = `
    <div class="inbox-layout">
      <div class="inbox-list">${msgList}</div>
      <div class="inbox-body">${msgBody}</div>
    </div>`;

  mainContent.querySelectorAll('.msg-row').forEach(row => {
    row.addEventListener('click', () => {
      SN_STORAGE.markMessageRead(row.dataset.msg);
      updateInboxBadge();
      navigate('inbox', { messageId: row.dataset.msg });
    });
  });
}

// ══════════════════════════════════════════════
// PAGE — SETTINGS
// ══════════════════════════════════════════════
function renderSettings() {
  const s = SN_STORAGE.getSettings();
  mainContent.innerHTML = `
    <div class="settings-page">
      <div class="settings-card">
        <h3>👤 Profile</h3>
        <div class="setting-row">
          <label for="set-name">Student Name</label>
          <input type="text" id="set-name" value="${escHtml(s.studentName)}" />
        </div>
        <div class="setting-row">
          <label for="set-email">Email</label>
          <input type="text" id="set-email" value="${escHtml(s.email)}" />
        </div>
      </div>

      <div class="settings-card">
        <h3>🎨 Appearance</h3>
        <div class="setting-row">
          <label>Theme</label>
          <div class="toggle-group">
            <button class="toggle-btn ${s.theme==='light'?'active':''}" data-theme="light">☀️ Light</button>
            <button class="toggle-btn ${s.theme==='dark'?'active':''}"  data-theme="dark">🌙 Dark</button>
          </div>
        </div>
        <div class="setting-row">
          <label>Compact Mode</label>
          <label class="switch">
            <input type="checkbox" id="set-compact" ${s.compactMode?'checked':''} />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-card">
        <h3>🔔 Notifications</h3>
        <div class="setting-row">
          <label>Assignment Reminders</label>
          <label class="switch"><input type="checkbox" id="set-notif-assign" ${s.notifyAssignments?'checked':''}><span class="slider"></span></label>
        </div>
        <div class="setting-row">
          <label>New Messages</label>
          <label class="switch"><input type="checkbox" id="set-notif-msg" ${s.notifyMessages?'checked':''}><span class="slider"></span></label>
        </div>
        <div class="setting-row">
          <label>Grade Posted</label>
          <label class="switch"><input type="checkbox" id="set-notif-grade" ${s.notifyGrades?'checked':''}><span class="slider"></span></label>
        </div>
      </div>

      <div class="settings-card">
        <h3>🛠 Data</h3>
        <p class="setting-hint">Reset all app data back to the original sample content.</p>
        <button class="btn btn-danger" id="btn-reset-all">Reset All Data</button>
      </div>

      <div class="settings-actions">
        <button class="btn btn-primary btn-lg" id="btn-save-settings">💾 Save Settings</button>
        <span class="save-confirm hidden" id="save-confirm">✓ Saved!</span>
      </div>
    </div>`;

  // Theme toggle
  mainContent.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      mainContent.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Save
  document.getElementById('btn-save-settings').addEventListener('click', () => {
    const theme = mainContent.querySelector('[data-theme].active').dataset.theme;
    SN_STORAGE.saveSettings({
      studentName       : document.getElementById('set-name').value.trim() || SN_STORAGE.getDefaultSettings().studentName,
      email             : document.getElementById('set-email').value.trim(),
      theme,
      compactMode       : document.getElementById('set-compact').checked,
      notifyAssignments : document.getElementById('set-notif-assign').checked,
      notifyMessages    : document.getElementById('set-notif-msg').checked,
      notifyGrades      : document.getElementById('set-notif-grade').checked,
    });
    applyTheme();
    document.getElementById('save-confirm').classList.remove('hidden');
    setTimeout(() => document.getElementById('save-confirm').classList.add('hidden'), 2500);
  });

  // Reset
  document.getElementById('btn-reset-all').addEventListener('click', () => {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      SN_STORAGE.resetAll();
      navigate('dashboard');
    }
  });
}

// ══════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════

navigate('dashboard');
