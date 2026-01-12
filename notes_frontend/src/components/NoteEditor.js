import React, { useEffect, useMemo, useRef } from "react";

// PUBLIC_INTERFACE
export default function NoteEditor({ note, onChange, onCreate, editorId }) {
  /** Editor panel for the selected note. */
  const titleRef = useRef(null);

  // Focus title field when note changes (improves keyboard workflow).
  useEffect(() => {
    if (!note) return;
    if (titleRef.current) titleRef.current.focus();
  }, [note?.id]);

  const isEmptySelection = !note;

  const shortcutsHint = useMemo(() => {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    return isMac ? "⌘N" : "Ctrl+N";
  }, []);

  if (isEmptySelection) {
    return (
      <div className="editorWrap" id={editorId}>
        <div className="editorHeader">
          <h2 className="editorTitle">No note selected</h2>
        </div>
        <div className="emptyEditorState">
          <div>Select a note from the list or create a new one.</div>
          <div>
            Tip: Press <span className="kbdHint">{shortcutsHint}</span> to create a note.
          </div>
          <div>
            <button className="btn btnPrimary" type="button" onClick={onCreate}>
              Create a note
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editorWrap" id={editorId}>
      <div className="editorHeader">
        <h2 className="editorTitle">Editor</h2>
      </div>

      <div className="editorBody">
        <div>
          <label className="fieldLabel" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            ref={titleRef}
            className="input"
            value={note.title}
            placeholder="Untitled"
            onChange={(e) => onChange({ title: e.target.value })}
            autoComplete="off"
          />
        </div>

        <div>
          <label className="fieldLabel" htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            className="textarea"
            value={note.content}
            placeholder="Write your note…"
            onChange={(e) => onChange({ content: e.target.value })}
          />
        </div>

        <div className="notesListMeta" aria-label="Editor help">
          Shortcuts: <span className="kbdHint">{shortcutsHint}</span> new note • Delete key deletes the selected
          note (when not typing)
        </div>
      </div>
    </div>
  );
}
