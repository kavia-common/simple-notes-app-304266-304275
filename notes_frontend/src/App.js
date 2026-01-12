import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import {
  createNote,
  deleteNote,
  loadNotes,
  saveNotes,
  updateNote,
} from "./utils/storage";

/**
 * Notes App (frontend-only).
 *
 * - Two-pane layout: notes list (left) and editor/viewer (right)
 * - CRUD for notes (title, content)
 * - Persists to localStorage
 * - No backend calls; environment variables like REACT_APP_API_BASE are ignored
 */

// PUBLIC_INTERFACE
function App() {
  /** Whether we finished loading notes from localStorage. */
  const [isReady, setIsReady] = useState(false);

  /** Notes collection and selection. */
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  /** Search term for filtering notes list. */
  const [query, setQuery] = useState("");

  /** For accessibility announcements. */
  const [liveMessage, setLiveMessage] = useState("");
  const liveRegionTimeoutRef = useRef(null);

  // Load initial notes once.
  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);

    // Auto-select most recent note if any.
    if (loaded.length > 0) setSelectedId(loaded[0].id);

    setIsReady(true);
  }, []);

  // Persist notes to localStorage whenever they change.
  useEffect(() => {
    if (!isReady) return;
    saveNotes(notes);
  }, [notes, isReady]);

  useEffect(() => {
    return () => {
      if (liveRegionTimeoutRef.current) {
        window.clearTimeout(liveRegionTimeoutRef.current);
      }
    };
  }, []);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId]
  );

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const hay = `${n.title}\n${n.content}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notes, query]);

  // PUBLIC_INTERFACE
  const announce = (message) => {
    /** Ensures consecutive messages are read by screen readers. */
    setLiveMessage("");
    if (liveRegionTimeoutRef.current) {
      window.clearTimeout(liveRegionTimeoutRef.current);
    }
    liveRegionTimeoutRef.current = window.setTimeout(() => {
      setLiveMessage(message);
    }, 20);
  };

  // PUBLIC_INTERFACE
  const handleCreateNote = () => {
    const newNote = createNote();
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    announce("New note created. Focus is in the editor.");
  };

  // PUBLIC_INTERFACE
  const handleSelectNote = (id) => {
    setSelectedId(id);
  };

  // PUBLIC_INTERFACE
  const handleUpdateSelected = (patch) => {
    if (!selectedId) return;
    setNotes((prev) => updateNote(prev, selectedId, patch));
  };

  // PUBLIC_INTERFACE
  const handleDeleteSelected = () => {
    if (!selectedNote) return;

    const confirmText =
      selectedNote.title?.trim() ? `“${selectedNote.title.trim()}”` : "this note";
    const ok = window.confirm(`Delete ${confirmText}? This cannot be undone.`);
    if (!ok) return;

    setNotes((prev) => {
      const { notes: nextNotes, nextSelectedId } = deleteNote(prev, selectedId);
      setSelectedId(nextSelectedId);
      return nextNotes;
    });

    announce("Note deleted.");
  };

  // PUBLIC_INTERFACE
  const handleKeyDown = (e) => {
    // Convenience shortcuts.
    // Ctrl/Cmd+N: new note
    // Delete: delete selected note (when focus isn't inside textarea/input)
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod && e.key.toLowerCase() === "n") {
      e.preventDefault();
      handleCreateNote();
      return;
    }

    const isTypingTarget =
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement ||
      (e.target && e.target.getAttribute && e.target.getAttribute("contenteditable") === "true");

    if (!isTypingTarget && e.key === "Delete") {
      if (selectedNote) {
        e.preventDefault();
        handleDeleteSelected();
      }
    }
  };

  return (
    <div className="NotesApp" onKeyDown={handleKeyDown}>
      <a className="skipLink" href="#noteEditor">
        Skip to editor
      </a>

      <header className="topbar" role="banner">
        <div className="topbarLeft">
          <div className="brandMark" aria-hidden="true" />
          <div className="topbarTitleWrap">
            <h1 className="topbarTitle">Notes</h1>
            <p className="topbarSubtitle">Frontend-only • localStorage</p>
          </div>
        </div>

        <div className="topbarActions">
          <button className="btn btnPrimary" type="button" onClick={handleCreateNote}>
            New note
          </button>
          <button
            className="btn btnDanger"
            type="button"
            onClick={handleDeleteSelected}
            disabled={!selectedNote}
            aria-disabled={!selectedNote}
          >
            Delete
          </button>
        </div>
      </header>

      <main className="layout" role="main" aria-label="Notes workspace">
        <aside className="sidebar" aria-label="Notes list">
          <div className="sidebarHeader">
            <label className="fieldLabel" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find notes…"
              type="search"
              autoComplete="off"
            />
          </div>

          {!isReady ? (
            <div className="panelState" role="status" aria-live="polite">
              Loading notes…
            </div>
          ) : (
            <NotesList
              notes={filteredNotes}
              selectedId={selectedId}
              onSelect={handleSelectNote}
              onCreate={handleCreateNote}
              emptyMessage={
                query.trim()
                  ? "No notes match your search."
                  : "No notes yet. Create your first note."
              }
            />
          )}
        </aside>

        <section className="content" aria-label="Note editor">
          {!isReady ? (
            <div className="panelState" role="status" aria-live="polite">
              Preparing editor…
            </div>
          ) : (
            <NoteEditor
              note={selectedNote}
              onChange={handleUpdateSelected}
              onCreate={handleCreateNote}
              editorId="noteEditor"
            />
          )}
        </section>
      </main>

      {/* Screen reader announcements */}
      <div className="srOnly" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
    </div>
  );
}

export default App;
