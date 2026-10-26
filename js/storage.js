/* ══════════════════════════════════════════════
   STUDYNEST — storage.js
   localStorage persistence layer.
   All mutable state lives here; data.js is
   read-only seed data.
   ══════════════════════════════════════════════ */

const SN_STORAGE = (() => {

  const KEYS = {
    assignments : 'sn_assignments',
    lessons     : 'sn_lessons',
    messages    : 'sn_messages',
    settings    : 'sn_settings',
  };

  // ── Generic helpers ───────────────────────────────────────────────────
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ── Default settings ──────────────────────────────────────────────────
  const DEFAULT_SETTINGS = {
    studentName       : 'Student',
    email             : 'student@studynest.edu',
    theme             : 'light',
    compactMode       : false,
    notifyAssignments : true,
    notifyMessages    : true,
    notifyGrades      : true,
  };

  // ── Seed on first run ─────────────────────────────────────────────────
  // Copy seed data into localStorage the very first time so the app has
  // something to display and so mutations don't touch SN_DATA directly.
  function seedIfNeeded() {
    if (!localStorage.getItem(KEYS.assignments)) {
      save(KEYS.assignments, SN_DATA.assignments);
    }
    if (!localStorage.getItem(KEYS.messages)) {
      save(KEYS.messages, SN_DATA.messages);
    }
    if (!localStorage.getItem(KEYS.lessons)) {
      // Build a flat map: lessonId → { completed: bool }
      const lessonMap = {};
      SN_DATA.courses.forEach(course => {
        course.modules.forEach(mod => {
          mod.lessons.forEach(lesson => {
            lessonMap[lesson.id] = { completed: false };
          });
        });
      });
      save(KEYS.lessons, lessonMap);
    }
    if (!localStorage.getItem(KEYS.settings)) {
      save(KEYS.settings, DEFAULT_SETTINGS);
    }
  }

  function getDefaultSettings() {
    return { ...DEFAULT_SETTINGS };
  }

  // ══════════════════════════════════════════════
  // ASSIGNMENTS
  // ══════════════════════════════════════════════
  function getAssignments() {
    return load(KEYS.assignments, []);
  }

  function getAssignment(id) {
    return getAssignments().find(a => a.id === id) || null;
  }

  function updateAssignment(id, changes) {
    const list = getAssignments().map(a =>
      a.id === id ? { ...a, ...changes } : a
    );
    save(KEYS.assignments, list);
  }

  // ══════════════════════════════════════════════
  // LESSONS
  // ══════════════════════════════════════════════
  function getLessonMap() {
    return load(KEYS.lessons, {});
  }

  function isLessonCompleted(lessonId) {
    const map = getLessonMap();
    return !!(map[lessonId] && map[lessonId].completed);
  }

  function toggleLesson(lessonId) {
    const map = getLessonMap();
    map[lessonId] = { completed: !isLessonCompleted(lessonId) };
    save(KEYS.lessons, map);
  }

  // ══════════════════════════════════════════════
  // COMPUTED PROGRESS
  // ══════════════════════════════════════════════

  /** Returns { completed, total, pct } for a single module */
  function moduleProgress(moduleId) {
    const course = SN_DATA.courses.find(c =>
      c.modules.some(m => m.id === moduleId)
    );
    if (!course) return { completed: 0, total: 0, pct: 0 };
    const mod = course.modules.find(m => m.id === moduleId);
    const total = mod.lessons.length;
    const completed = mod.lessons.filter(l => isLessonCompleted(l.id)).length;
    return { completed, total, pct: total ? Math.round((completed / total) * 100) : 0 };
  }

  /** Returns { completed, total, pct } across all modules of a course */
  function courseProgress(courseId) {
    const course = SN_DATA.courses.find(c => c.id === courseId);
    if (!course) return { completed: 0, total: 0, pct: 0 };
    let total = 0, completed = 0;
    course.modules.forEach(mod => {
      mod.lessons.forEach(l => {
        total++;
        if (isLessonCompleted(l.id)) completed++;
      });
    });
    return { completed, total, pct: total ? Math.round((completed / total) * 100) : 0 };
  }

  /** Compute current grade for a course based on graded assignments */
  function courseGrade(courseId) {
    const assignments = getAssignments().filter(
      a => a.courseId === courseId && a.status === 'graded' && a.grade !== null
    );
    if (!assignments.length) return { pct: null, letter: '—' };
    const earned   = assignments.reduce((s, a) => s + a.grade, 0);
    const possible = assignments.reduce((s, a) => s + a.points, 0);
    const pct = possible ? Math.round((earned / possible) * 100) : 0;
    return { pct, letter: pctToLetter(pct), earned, possible };
  }

  /** Overall GPA-style summary across all courses */
  function overallGrade() {
    const grades = SN_DATA.courses
      .map(c => courseGrade(c.id))
      .filter(g => g.pct !== null);
    if (!grades.length) return { pct: null, letter: '—' };
    const avg = Math.round(grades.reduce((s, g) => s + g.pct, 0) / grades.length);
    return { pct: avg, letter: pctToLetter(avg) };
  }

  function pctToLetter(pct) {
    if (pct >= 97) return 'A+';
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 73) return 'C';
    if (pct >= 70) return 'C-';
    if (pct >= 60) return 'D';
    return 'F';
  }

  // ══════════════════════════════════════════════
  // MESSAGES
  // ══════════════════════════════════════════════
  function getMessages() {
    return load(KEYS.messages, []);
  }

  function markMessageRead(id) {
    const list = getMessages().map(m =>
      m.id === id ? { ...m, read: true } : m
    );
    save(KEYS.messages, list);
  }

  function unreadCount() {
    return getMessages().filter(m => !m.read).length;
  }

  // ══════════════════════════════════════════════
  // SETTINGS
  // ══════════════════════════════════════════════
  function getSettings() {
    return load(KEYS.settings, {});
  }

  function saveSettings(changes) {
    if ('studentName' in changes) {
      changes = { ...changes, studentName: changes.studentName.trim() || DEFAULT_SETTINGS.studentName };
    }
    save(KEYS.settings, { ...getSettings(), ...changes });
  }

  // ══════════════════════════════════════════════
  // RESET (dev helper — clears all stored state)
  // ══════════════════════════════════════════════
  function resetAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    seedIfNeeded();
  }

  // ── Init ──────────────────────────────────────────────────────────────
  seedIfNeeded();

  // ── Public API ────────────────────────────────────────────────────────
  return {
    // Assignments
    getAssignments, getAssignment, updateAssignment,
    // Lessons
    getLessonMap, isLessonCompleted, toggleLesson,
    // Progress & grades
    moduleProgress, courseProgress, courseGrade, overallGrade, pctToLetter,
    // Messages
    getMessages, markMessageRead, unreadCount,
    // Settings
    getDefaultSettings, getSettings, saveSettings,
    // Dev
    resetAll,
  };

})();
