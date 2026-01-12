import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const STORAGE_KEY = "simple_notes_app__notes_v1";

function seedStorage(notes) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function readStorage() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

beforeEach(() => {
  window.localStorage.clear();
  // Prevent tests from blocking on confirm dialogs. Individual tests can override as needed.
  jest.spyOn(window, "confirm").mockImplementation(() => true);
});

afterEach(() => {
  window.confirm.mockRestore();
});

test("renders the notes app header and two-pane affordances", () => {
  render(<App />);

  // Header title is unique as a heading.
  expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();

  // Left pane: search input.
  expect(screen.getByLabelText("Search")).toBeInTheDocument();

  // Topbar primary action.
  expect(screen.getByRole("button", { name: "New note" })).toBeInTheDocument();

  // Right pane: empty editor state initially (no notes).
  expect(screen.getByRole("heading", { name: "No note selected" })).toBeInTheDocument();
});

test("create -> edit persists to localStorage and is restored on re-render", async () => {
  const user = userEvent.setup();
  const { unmount } = render(<App />);

  await user.click(screen.getByRole("button", { name: "New note" }));

  // Editor should be present and editable.
  const title = screen.getByLabelText("Title");
  const content = screen.getByLabelText("Content");

  await user.type(title, "Shopping list");
  await user.type(content, "Milk\nEggs");

  // localStorage should contain the newly created note.
  const stored = readStorage();
  expect(Array.isArray(stored)).toBe(true);
  expect(stored).toHaveLength(1);
  expect(stored[0].title).toBe("Shopping list");
  expect(stored[0].content).toBe("Milk\nEggs");

  // Unmount + re-mount simulates a reload (storage should rehydrate state).
  unmount();
  render(<App />);

  // The note should appear in the notes list with the title.
  const list = screen.getByRole("list", { name: "Notes" });
  expect(within(list).getByRole("listitem", { name: /Open note: Shopping list/i })).toBeInTheDocument();

  // The editor should show the persisted content (auto-selected most recent note).
  expect(screen.getByLabelText("Title")).toHaveValue("Shopping list");
  expect(screen.getByLabelText("Content")).toHaveValue("Milk\nEggs");
});

test("delete removes note from UI and clears from localStorage", async () => {
  const user = userEvent.setup();

  seedStorage([
    {
      id: "n1",
      title: "Temp",
      content: "To be deleted",
      createdAt: 1,
      updatedAt: 2,
    },
  ]);

  render(<App />);

  // Ensure loaded and selected.
  expect(screen.getByLabelText("Title")).toHaveValue("Temp");

  await user.click(screen.getByRole("button", { name: "Delete" }));

  // Notes list should show empty state again.
  expect(screen.getByText("0 notes")).toBeInTheDocument();
  expect(screen.getByText("No notes yet. Create your first note.")).toBeInTheDocument();

  // Storage should now be an empty array.
  const stored = readStorage();
  expect(stored).toEqual([]);
});
