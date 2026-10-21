/* ══════════════════════════════════════════════
   STUDYNEST — data.js
   All sample data. Replace with API calls later.
   ══════════════════════════════════════════════ */

const SN_DATA = (() => {

  // ── Courses ────────────────────────────────────────────────────────────
  const courses = [
    {
      id: 'hindi',
      name: 'Hindi',
      code: 'LANG-101',
      instructor: 'Dr. Priya Sharma',
      description: 'A comprehensive introduction to Hindi language covering reading, writing, grammar, and conversational skills for beginners and intermediate learners.',
      color: '#7c3aed',
      icon: '🇮🇳',
      credits: 3,
      modules: [
        {
          id: 'h-m1',
          courseId: 'hindi',
          title: 'Module 1 — Introduction to Hindi',
          lessons: [
            { id: 'h-m1-l1', title: 'The Devanagari Script', duration: '25 min' },
            { id: 'h-m1-l2', title: 'Vowels and Consonants', duration: '30 min' },
            { id: 'h-m1-l3', title: 'Basic Pronunciations', duration: '20 min' },
            { id: 'h-m1-l4', title: 'Numbers 1–100', duration: '15 min' },
            { id: 'h-m1-l5', title: 'Common Greetings', duration: '20 min' },
          ],
        },
        {
          id: 'h-m2',
          courseId: 'hindi',
          title: 'Module 2 — Hindi Grammar',
          lessons: [
            { id: 'h-m2-l1', title: 'Nouns and Gender', duration: '30 min' },
            { id: 'h-m2-l2', title: 'Pronouns', duration: '25 min' },
            { id: 'h-m2-l3', title: 'Verb Conjugation — Present Tense', duration: '35 min' },
            { id: 'h-m2-l4', title: 'Verb Conjugation — Past Tense', duration: '35 min' },
            { id: 'h-m2-l5', title: 'Postpositions', duration: '25 min' },
          ],
        },
        {
          id: 'h-m3',
          courseId: 'hindi',
          title: 'Module 3 — Reading & Writing',
          lessons: [
            { id: 'h-m3-l1', title: 'Reading Short Paragraphs', duration: '40 min' },
            { id: 'h-m3-l2', title: 'Writing Simple Sentences', duration: '30 min' },
            { id: 'h-m3-l3', title: 'Dictation Practice', duration: '25 min' },
            { id: 'h-m3-l4', title: 'Reading a Short Story', duration: '45 min' },
          ],
        },
        {
          id: 'h-m4',
          courseId: 'hindi',
          title: 'Module 4 — Conversation',
          lessons: [
            { id: 'h-m4-l1', title: 'Introducing Yourself', duration: '20 min' },
            { id: 'h-m4-l2', title: 'Shopping Dialogue', duration: '25 min' },
            { id: 'h-m4-l3', title: 'Asking for Directions', duration: '25 min' },
            { id: 'h-m4-l4', title: 'Talking About Family', duration: '30 min' },
            { id: 'h-m4-l5', title: 'Final Conversation Practice', duration: '40 min' },
          ],
        },
      ],
    },

    {
      id: 'punjabi',
      name: 'Punjabi',
      code: 'LANG-102',
      instructor: 'Prof. Harjit Kaur',
      description: 'An engaging course on the Punjabi language exploring Gurmukhi script, grammar, literature, and everyday communication in Punjabi culture.',
      color: '#0891b2',
      icon: '🌾',
      credits: 3,
      modules: [
        {
          id: 'p-m1',
          courseId: 'punjabi',
          title: 'Module 1 — Introduction to Punjabi',
          lessons: [
            { id: 'p-m1-l1', title: 'The Gurmukhi Script', duration: '25 min' },
            { id: 'p-m1-l2', title: 'Vowel Signs (Laga Matra)', duration: '30 min' },
            { id: 'p-m1-l3', title: 'Basic Pronunciations', duration: '20 min' },
            { id: 'p-m1-l4', title: 'Numbers and Counting', duration: '15 min' },
            { id: 'p-m1-l5', title: 'Everyday Phrases', duration: '20 min' },
          ],
        },
        {
          id: 'p-m2',
          courseId: 'punjabi',
          title: 'Module 2 — Punjabi Grammar',
          lessons: [
            { id: 'p-m2-l1', title: 'Nouns and Plurals', duration: '30 min' },
            { id: 'p-m2-l2', title: 'Pronouns and Gender', duration: '25 min' },
            { id: 'p-m2-l3', title: 'Verb Tenses', duration: '40 min' },
            { id: 'p-m2-l4', title: 'Adjectives and Adverbs', duration: '30 min' },
          ],
        },
        {
          id: 'p-m3',
          courseId: 'punjabi',
          title: 'Module 3 — Reading & Writing',
          lessons: [
            { id: 'p-m3-l1', title: 'Reading Simple Texts', duration: '35 min' },
            { id: 'p-m3-l2', title: 'Writing Paragraphs', duration: '30 min' },
            { id: 'p-m3-l3', title: 'Reading Folk Stories', duration: '45 min' },
            { id: 'p-m3-l4', title: 'Letter Writing', duration: '35 min' },
          ],
        },
        {
          id: 'p-m4',
          courseId: 'punjabi',
          title: 'Module 4 — Conversation',
          lessons: [
            { id: 'p-m4-l1', title: 'Greetings and Introductions', duration: '20 min' },
            { id: 'p-m4-l2', title: 'At the Market', duration: '25 min' },
            { id: 'p-m4-l3', title: 'Talking About Daily Routine', duration: '30 min' },
            { id: 'p-m4-l4', title: 'Discussing Festivals', duration: '35 min' },
            { id: 'p-m4-l5', title: 'Final Speaking Practice', duration: '40 min' },
          ],
        },
      ],
    },

    {
      id: 'english',
      name: 'English',
      code: 'LANG-103',
      instructor: 'Ms. Sarah Mitchell',
      description: 'A rigorous academic English course developing grammar, writing, reading comprehension, and communication skills for college-level success.',
      color: '#059669',
      icon: '📖',
      credits: 3,
      modules: [
        {
          id: 'e-m1',
          courseId: 'english',
          title: 'Module 1 — Grammar Foundations',
          lessons: [
            { id: 'e-m1-l1', title: 'Parts of Speech', duration: '30 min' },
            { id: 'e-m1-l2', title: 'Sentence Structure', duration: '30 min' },
            { id: 'e-m1-l3', title: 'Tenses Review', duration: '35 min' },
            { id: 'e-m1-l4', title: 'Punctuation Rules', duration: '25 min' },
            { id: 'e-m1-l5', title: 'Common Grammar Errors', duration: '20 min' },
          ],
        },
        {
          id: 'e-m2',
          courseId: 'english',
          title: 'Module 2 — Academic Writing',
          lessons: [
            { id: 'e-m2-l1', title: 'Paragraph Structure', duration: '30 min' },
            { id: 'e-m2-l2', title: 'Essay Introduction & Thesis', duration: '35 min' },
            { id: 'e-m2-l3', title: 'Body Paragraphs & Evidence', duration: '40 min' },
            { id: 'e-m2-l4', title: 'Conclusions', duration: '25 min' },
            { id: 'e-m2-l5', title: 'Citing Sources (APA/MLA)', duration: '30 min' },
          ],
        },
        {
          id: 'e-m3',
          courseId: 'english',
          title: 'Module 3 — Reading Comprehension',
          lessons: [
            { id: 'e-m3-l1', title: 'Identifying Main Ideas', duration: '25 min' },
            { id: 'e-m3-l2', title: 'Inference and Context Clues', duration: '30 min' },
            { id: 'e-m3-l3', title: 'Critical Reading Strategies', duration: '35 min' },
            { id: 'e-m3-l4', title: 'Analyzing Argumentative Texts', duration: '40 min' },
          ],
        },
        {
          id: 'e-m4',
          courseId: 'english',
          title: 'Module 4 — Communication Skills',
          lessons: [
            { id: 'e-m4-l1', title: 'Effective Listening', duration: '20 min' },
            { id: 'e-m4-l2', title: 'Presentation Skills', duration: '35 min' },
            { id: 'e-m4-l3', title: 'Group Discussion Techniques', duration: '30 min' },
            { id: 'e-m4-l4', title: 'Email and Professional Writing', duration: '25 min' },
            { id: 'e-m4-l5', title: 'Final Presentation', duration: '50 min' },
          ],
        },
      ],
    },
  ];

  // ── Assignments ────────────────────────────────────────────────────────
  const assignments = [
    // Hindi
    {
      id: 'a1', courseId: 'hindi', moduleId: 'h-m1',
      title: 'Devanagari Script Practice',
      description: 'Write the full Devanagari alphabet — all vowels and consonants — clearly. Label each character with its transliteration. Submit as a scanned handwritten sheet or typed document.',
      due: '2026-10-05', points: 50,
      status: 'graded', grade: 47,
    },
    {
      id: 'a2', courseId: 'hindi', moduleId: 'h-m2',
      title: 'Hindi Grammar Quiz',
      description: 'Complete the online grammar quiz covering nouns, pronouns, and present-tense verb conjugations. 25 multiple-choice questions.',
      due: '2026-10-12', points: 100,
      status: 'submitted', grade: null,
    },
    {
      id: 'a3', courseId: 'hindi', moduleId: 'h-m3',
      title: 'Short Story Reading Response',
      description: 'Read the provided short story in Hindi and write a 150-word response in Hindi summarizing the main events and your reaction.',
      due: '2026-10-20', points: 75,
      status: 'in-progress', grade: null,
    },
    {
      id: 'a4', courseId: 'hindi', moduleId: 'h-m4',
      title: 'Conversation Script',
      description: 'Write a dialogue (minimum 10 exchanges) between two people meeting for the first time. Use vocabulary from Module 4. Be ready to present it.',
      due: '2026-10-28', points: 100,
      status: 'not-started', grade: null,
    },

    // Punjabi
    {
      id: 'a5', courseId: 'punjabi', moduleId: 'p-m1',
      title: 'Gurmukhi Alphabet Writing',
      description: 'Write the complete Gurmukhi alphabet with vowel signs. Include at least 10 example words using the characters. Neatness counts.',
      due: '2026-10-06', points: 50,
      status: 'graded', grade: 44,
    },
    {
      id: 'a6', courseId: 'punjabi', moduleId: 'p-m2',
      title: 'Grammar Worksheet',
      description: 'Complete the provided worksheet on Punjabi nouns, gender rules, and verb conjugation in simple present and past tense.',
      due: '2026-10-14', points: 100,
      status: 'graded', grade: 88,
    },
    {
      id: 'a7', courseId: 'punjabi', moduleId: 'p-m3',
      title: 'Folk Story Summary',
      description: 'Read the assigned Punjabi folk story and write a 200-word summary in Punjabi. Focus on characters, plot, and moral.',
      due: '2026-10-22', points: 75,
      status: 'in-progress', grade: null,
    },
    {
      id: 'a8', courseId: 'punjabi', moduleId: 'p-m4',
      title: 'Festival Presentation',
      description: 'Prepare a 5-minute spoken presentation about a Punjabi festival of your choice. Speak in Punjabi for at least 3 minutes.',
      due: '2026-10-30', points: 100,
      status: 'not-started', grade: null,
    },

    // English
    {
      id: 'a9', courseId: 'english', moduleId: 'e-m1',
      title: 'Grammar Diagnostic Test',
      description: 'Take the grammar diagnostic covering all parts of speech, sentence structure, tenses, and punctuation. 40 questions, 60 minutes.',
      due: '2026-10-04', points: 100,
      status: 'graded', grade: 96,
    },
    {
      id: 'a10', courseId: 'english', moduleId: 'e-m2',
      title: 'Five-Paragraph Essay',
      description: 'Write a 500-word argumentative essay on the topic: "Technology has more benefits than drawbacks for students." Include a clear thesis, three body paragraphs with evidence, and a conclusion.',
      due: '2026-10-15', points: 150,
      status: 'submitted', grade: null,
    },
    {
      id: 'a11', courseId: 'english', moduleId: 'e-m3',
      title: 'Reading Comprehension Exercise',
      description: 'Read the provided article and answer 10 comprehension questions. Questions test main idea, inference, vocabulary in context, and author purpose.',
      due: '2026-10-23', points: 75,
      status: 'not-started', grade: null,
    },
    {
      id: 'a12', courseId: 'english', moduleId: 'e-m4',
      title: 'Class Presentation',
      description: 'Deliver a 7-minute presentation on a topic of your choice. You will be graded on clarity, organization, delivery, and use of English.',
      due: '2026-11-01', points: 100,
      status: 'not-started', grade: null,
    },
  ];

  // ── Calendar Events ────────────────────────────────────────────────────
  const events = [
    { id: 'ev1',  date: '2026-10-05', title: 'Hindi — Script Practice Due',       type: 'assignment', courseId: 'hindi' },
    { id: 'ev2',  date: '2026-10-06', title: 'Punjabi — Alphabet Writing Due',     type: 'assignment', courseId: 'punjabi' },
    { id: 'ev3',  date: '2026-10-04', title: 'English — Grammar Diagnostic Due',   type: 'assignment', courseId: 'english' },
    { id: 'ev4',  date: '2026-10-08', title: 'Hindi — Office Hours (Dr. Sharma)',  type: 'event',      courseId: 'hindi' },
    { id: 'ev5',  date: '2026-10-10', title: 'Punjabi — Midterm Review Session',   type: 'event',      courseId: 'punjabi' },
    { id: 'ev6',  date: '2026-10-12', title: 'Hindi — Grammar Quiz Due',           type: 'assignment', courseId: 'hindi' },
    { id: 'ev7',  date: '2026-10-14', title: 'Punjabi — Grammar Worksheet Due',    type: 'assignment', courseId: 'punjabi' },
    { id: 'ev8',  date: '2026-10-15', title: 'English — Five-Para Essay Due',      type: 'assignment', courseId: 'english' },
    { id: 'ev9',  date: '2026-10-18', title: 'All Courses — Mid-Semester Check',   type: 'event',      courseId: null },
    { id: 'ev10', date: '2026-10-20', title: 'Hindi — Story Reading Response Due', type: 'assignment', courseId: 'hindi' },
    { id: 'ev11', date: '2026-10-22', title: 'Punjabi — Folk Story Summary Due',   type: 'assignment', courseId: 'punjabi' },
    { id: 'ev12', date: '2026-10-23', title: 'English — Reading Comprehension Due',type: 'assignment', courseId: 'english' },
    { id: 'ev13', date: '2026-10-28', title: 'Hindi — Conversation Script Due',    type: 'assignment', courseId: 'hindi' },
    { id: 'ev14', date: '2026-10-30', title: 'Punjabi — Festival Presentation Due',type: 'assignment', courseId: 'punjabi' },
    { id: 'ev15', date: '2026-11-01', title: 'English — Class Presentation Due',   type: 'assignment', courseId: 'english' },
    { id: 'ev16', date: '2026-10-25', title: 'Study Group — Language Lab',         type: 'event',      courseId: null },
  ];

  // ── Inbox Messages ─────────────────────────────────────────────────────
  const messages = [
    {
      id: 'msg1',
      from: 'Dr. Priya Sharma',
      course: 'Hindi (LANG-101)',
      subject: 'Great work on the Script Practice!',
      body: 'Hi there, I just finished grading the Devanagari Script Practice assignments. Your work was excellent — you scored 47/50. Your letter forms are very clean. Keep it up! The grammar quiz is coming up on October 12th, so start reviewing your verb conjugations. Let me know if you have any questions during office hours.',
      date: '2026-10-06',
      read: false,
    },
    {
      id: 'msg2',
      from: 'Prof. Harjit Kaur',
      course: 'Punjabi (LANG-102)',
      subject: 'Module 2 Grammar Worksheet — Grades Posted',
      body: 'Hi there, the grammar worksheet grades are now posted. You scored 88/100 — solid work! A few notes: pay attention to verb agreement with gender in sentences. I have added some feedback directly on your submission. The folk story summary is due on October 22nd. Please reach out if you need help.',
      date: '2026-10-16',
      read: false,
    },
    {
      id: 'msg3',
      from: 'Ms. Sarah Mitchell',
      course: 'English (LANG-103)',
      subject: 'Essay Submission Received',
      body: 'Hi there, I have received your Five-Paragraph Essay submission. I will have grades back to you within a week. In the meantime, start thinking about your Class Presentation topic — presentations begin November 1st. Remember to focus on a clear structure and strong evidence. Good luck!',
      date: '2026-10-16',
      read: true,
    },
    {
      id: 'msg4',
      from: 'StudyNest System',
      course: 'All Courses',
      subject: 'Reminder: Mid-Semester Check on October 18th',
      body: 'This is a reminder that the mid-semester academic check-in is scheduled for October 18th. Please review your progress in all courses and reach out to your instructors if you have any concerns about your grades or workload. The academic advisor will also be available for drop-in sessions from 10am–2pm.',
      date: '2026-10-14',
      read: true,
    },
    {
      id: 'msg5',
      from: 'Dr. Priya Sharma',
      course: 'Hindi (LANG-101)',
      subject: 'Office Hours This Week — October 8th',
      body: 'Dear students, just a reminder that I will be holding office hours this Thursday, October 8th from 2pm to 4pm in Room 204. Feel free to come by with any questions about grammar, the upcoming quiz, or course material. No appointment needed.',
      date: '2026-10-07',
      read: true,
    },
  ];

  // ── Public API ─────────────────────────────────────────────────────────
  return { courses, assignments, events, messages };

})();
