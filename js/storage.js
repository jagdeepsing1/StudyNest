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

  function markMessageUnread(id) {
    const list = getMessages().map(m =>
      m.id === id ? { ...m, read: false } : m
    );
    save(KEYS.messages, list);
  }

  function deleteMessage(id) {
    const list = getMessages().filter(m => m.id !== id);
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
  // EXPORT / IMPORT
  // ══════════════════════════════════════════════

  /**
   * Builds a portable backup object containing every localStorage key.
   * Uses KEYS map directly so any future key is included automatically.
   *
   * @returns {{ app: string, version: number, exportedAt: string, data: object }}
   */
  function exportAll() {
    const data = {};
    Object.entries(KEYS).forEach(([name, storageKey]) => {
      data[name] = load(storageKey, null);
    });
    return {
      app        : 'studynest',
      version    : 1,
      exportedAt : new Date().toISOString(),
      data,
    };
  }

  /**
   * Validates a backup object thoroughly, then atomically writes all keys.
   * Throws a descriptive Error if anything is invalid — no data is changed.
   *
   * @param {unknown} obj — the parsed JSON from the imported file
   */
  function importAll(obj) {
    // ── 1. Top-level shape ───────────────────────────────────────────────
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error('Backup must be a JSON object.');
    }
    if (obj.app !== 'studynest') {
      throw new Error('Not a StudyNest backup (app field missing or wrong).');
    }
    if (obj.version !== 1) {
      throw new Error(`Unsupported backup version: ${obj.version}.`);
    }
    if (!obj.data || typeof obj.data !== 'object' || Array.isArray(obj.data)) {
      throw new Error('Backup is missing the data field.');
    }

    // ── 2. Required keys and type checks ────────────────────────────────
    const { data } = obj;

    if (!Array.isArray(data.assignments)) {
      throw new Error('Backup data.assignments must be an array.');
    }
    if (!Array.isArray(data.messages)) {
      throw new Error('Backup data.messages must be an array.');
    }
    if (typeof data.lessons !== 'object' || data.lessons === null || Array.isArray(data.lessons)) {
      throw new Error('Backup data.lessons must be a plain object.');
    }
    if (typeof data.settings !== 'object' || data.settings === null || Array.isArray(data.settings)) {
      throw new Error('Backup data.settings must be a plain object.');
    }

    // ── 3. All-or-nothing write ──────────────────────────────────────────
    // Serialise every value first so we detect any stringify errors before
    // touching localStorage. If any write then fails we roll back cleanly.
    const serialised = {};
    Object.entries(KEYS).forEach(([name, storageKey]) => {
      try {
        serialised[storageKey] = JSON.stringify(data[name]);
      } catch (e) {
        throw new Error(`Could not serialise ${name}: ${e.message}`);
      }
    });

    // Snapshot current values for rollback
    const previous = {};
    Object.values(KEYS).forEach(k => {
      previous[k] = localStorage.getItem(k);
    });

    try {
      Object.entries(serialised).forEach(([storageKey, value]) => {
        localStorage.setItem(storageKey, value);
      });
    } catch (e) {
      // Storage write failed — roll every key back to its previous state
      Object.entries(previous).forEach(([storageKey, value]) => {
        if (value === null) {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, value);
        }
      });
      throw new Error(`Storage write failed; no data was changed. (${e.message})`);
    }
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
    getMessages, markMessageRead, markMessageUnread, deleteMessage, unreadCount,
    // Settings
    getDefaultSettings, getSettings, saveSettings,
    // Export / Import
    exportAll, importAll,
    // Dev
    resetAll,
  };

})();
