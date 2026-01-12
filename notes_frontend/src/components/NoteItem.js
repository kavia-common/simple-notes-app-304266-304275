import React, { useMemo } from "react";

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function previewText(note) {
  const title = (note.title || "").trim();
  const content = (note.content || "").trim().replace(/\s+/g, " ");
  return content || (title ? "" : "Empty note");
}

// PUBLIC_INTERFACE
export default function NoteItem({ note, selected, onSelect }) {
  /** A single note row. Uses <button> for keyboard accessibility by default. */
  const displayTitle = useMemo(() => (note.title || "").trim() || "Untitled", [note.title]);
  const time = useMemo(() => formatTime(note.updatedAt), [note.updatedAt]);
  const preview = useMemo(() => previewText(note), [note]);

  return (
    <button
      type="button"
      className={`noteItem ${selected ? "noteItemSelected" : ""}`}
      onClick={onSelect}
      role="listitem"
      aria-current={selected ? "true" : "false"}
      aria-label={`Open note: ${displayTitle}`}
    >
      <div className="noteItemTitleRow">
        <div className="noteItemTitle">{displayTitle}</div>
        <div className="noteItemTime">{time}</div>
      </div>
      <div className="noteItemPreview">{preview}</div>
    </button>
  );
}
