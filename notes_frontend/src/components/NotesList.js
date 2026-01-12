import React from "react";
import NoteItem from "./NoteItem";

// PUBLIC_INTERFACE
export default function NotesList({ notes, selectedId, onSelect, onCreate, emptyMessage }) {
  /** Notes list panel with empty state and count. */
  const countLabel = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;

  return (
    <div className="notesList">
      <div className="notesListToolbar">
        <div className="notesListMeta" aria-label="Notes count">
          {countLabel}
        </div>
        <button className="btn" type="button" onClick={onCreate}>
          Create
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="panelState" role="status" aria-live="polite">
          {emptyMessage}
        </div>
      ) : (
        <div className="notesItems" role="list" aria-label="Notes">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              selected={note.id === selectedId}
              onSelect={() => onSelect(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
