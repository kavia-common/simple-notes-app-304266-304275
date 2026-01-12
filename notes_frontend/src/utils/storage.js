/**
 * localStorage-based persistence for notes.
 *
 * Notes are stored as an array under a single key. This keeps the app simple and avoids
 * any backend dependency.
 */

const STORAGE_KEY = "simple_notes_app__notes_v1";

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {number} createdAt
 * @property {number} updatedAt
 */

// PUBLIC_INTERFACE
export function loadNotes() {
  /**
   * Load notes from localStorage. Returns [] if missing/corrupt/unavailable.
   * @returns {Note[]}
   */
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Basic validation/sanitization
    return parsed
      .filter((n) => n && typeof n === "object")
      .map((n) => ({
        id: String(n.id || cryptoFallbackId()),
        title: typeof n.title === "string" ? n.title : "",
        content: typeof n.content === "string" ? n.content : "",
        createdAt: typeof n.createdAt === "number" ? n.createdAt : Date.now(),
        updatedAt: typeof n.updatedAt === "number" ? n.updatedAt : Date.now(),
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveNotes(notes) {
  /**
   * Save notes array to localStorage. No-op if storage is unavailable.
   * @param {Note[]} notes
   */
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Intentionally ignore (e.g., private mode / storage denied)
  }
}

// PUBLIC_INTERFACE
export function createNote() {
  /**
   * Create a new note object with a generated ID.
   * @returns {Note}
   */
  const now = Date.now();
  return {
    id: cryptoSafeId(),
    title: "",
    content: "",
    createdAt: now,
    updatedAt: now,
  };
}

// PUBLIC_INTERFACE
export function updateNote(notes, id, patch) {
  /**
   * Update a note by id with a partial patch. Also bumps updatedAt and moves note to top.
   * @param {Note[]} notes
   * @param {string} id
   * @param {{title?: string, content?: string}} patch
   * @returns {Note[]}
   */
  const now = Date.now();
  const next = notes.map((n) => {
    if (n.id !== id) return n;
    return {
      ...n,
      ...patch,
      updatedAt: now,
    };
  });
  return next.slice().sort((a, b) => b.updatedAt - a.updatedAt);
}

// PUBLIC_INTERFACE
export function deleteNote(notes, id) {
  /**
   * Delete a note by id and pick a next selection.
   * @param {Note[]} notes
   * @param {string|null} id
   * @returns {{notes: Note[], nextSelectedId: (string|null)}}
   */
  const remaining = notes.filter((n) => n.id !== id);
  const nextSelectedId = remaining.length > 0 ? remaining[0].id : null;
  return { notes: remaining, nextSelectedId };
}

/** Generate an id using crypto if available, with fallback. */
function cryptoSafeId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return cryptoFallbackId();
}

function cryptoFallbackId() {
  return `note_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
