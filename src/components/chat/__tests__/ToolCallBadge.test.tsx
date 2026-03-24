import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getFileType, getToolCallDescription } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getFileType ---

test("getFileType: jsx → React component", () => {
  expect(getFileType("/src/Card.jsx")).toBe("React component");
});

test("getFileType: tsx → React component", () => {
  expect(getFileType("/src/Button.tsx")).toBe("React component");
});

test("getFileType: ts → TypeScript module", () => {
  expect(getFileType("/lib/utils.ts")).toBe("TypeScript module");
});

test("getFileType: js → JavaScript module", () => {
  expect(getFileType("/lib/helpers.js")).toBe("JavaScript module");
});

test("getFileType: css → stylesheet", () => {
  expect(getFileType("/styles/global.css")).toBe("stylesheet");
});

test("getFileType: scss → stylesheet", () => {
  expect(getFileType("/styles/theme.scss")).toBe("stylesheet");
});

test("getFileType: json → configuration file", () => {
  expect(getFileType("/config/settings.json")).toBe("configuration file");
});

test("getFileType: md → documentation file", () => {
  expect(getFileType("/README.md")).toBe("documentation file");
});

test("getFileType: html → HTML file", () => {
  expect(getFileType("/index.html")).toBe("HTML file");
});

test("getFileType: unknown extension → file", () => {
  expect(getFileType("/data/output.xyz")).toBe("file");
});

// --- getToolCallDescription: str_replace_editor ---

test("str_replace_editor create pending", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "create", path: "/Card.jsx" }, false)
  ).toBe("Creating a new React component — Card.jsx");
});

test("str_replace_editor create done", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "create", path: "/Card.jsx" }, true)
  ).toBe("Created a new React component — Card.jsx");
});

test("str_replace_editor create stylesheet done", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "create", path: "/styles.css" }, true)
  ).toBe("Created a new stylesheet — styles.css");
});

test("str_replace_editor create TypeScript module done", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "create", path: "/utils.ts" }, true)
  ).toBe("Created a new TypeScript module — utils.ts");
});

test("str_replace_editor str_replace pending", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "str_replace", path: "/App.jsx" }, false)
  ).toBe("Updating App.jsx");
});

test("str_replace_editor str_replace done", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "str_replace", path: "/App.jsx" }, true)
  ).toBe("Updated App.jsx");
});

test("str_replace_editor insert pending", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "insert", path: "/App.jsx" }, false)
  ).toBe("Adding code to App.jsx");
});

test("str_replace_editor insert done", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "insert", path: "/App.jsx" }, true)
  ).toBe("Added code to App.jsx");
});

test("str_replace_editor view pending", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "view", path: "/App.jsx" }, false)
  ).toBe("Reading App.jsx");
});

test("str_replace_editor view done", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "view", path: "/App.jsx" }, true)
  ).toBe("Read App.jsx");
});

test("str_replace_editor undo_edit pending", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, false)
  ).toBe("Undoing changes in App.jsx");
});

test("str_replace_editor undo_edit done", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, true)
  ).toBe("Undid changes in App.jsx");
});

test("str_replace_editor unknown command falls back to update language", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "mystery", path: "/App.jsx" }, true)
  ).toBe("Updated App.jsx");
});

test("str_replace_editor no path falls back gracefully", () => {
  expect(
    getToolCallDescription("str_replace_editor", { command: "create" }, false)
  ).toBe("Creating a new file — file");
});

test("str_replace_editor no args at all", () => {
  expect(
    getToolCallDescription("str_replace_editor", {}, false)
  ).toBe("Updating file");
});

// --- getToolCallDescription: file_manager ---

test("file_manager rename pending", () => {
  expect(
    getToolCallDescription("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, false)
  ).toBe("Renaming old.jsx");
});

test("file_manager rename done", () => {
  expect(
    getToolCallDescription("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, true)
  ).toBe("Renamed old.jsx → new.jsx");
});

test("file_manager rename done without new_path falls back", () => {
  expect(
    getToolCallDescription("file_manager", { command: "rename", path: "/old.jsx" }, true)
  ).toBe("Renaming old.jsx");
});

test("file_manager delete pending", () => {
  expect(
    getToolCallDescription("file_manager", { command: "delete", path: "/unused.tsx" }, false)
  ).toBe("Removing unused.tsx");
});

test("file_manager delete done", () => {
  expect(
    getToolCallDescription("file_manager", { command: "delete", path: "/unused.tsx" }, true)
  ).toBe("Removed unused.tsx");
});

test("file_manager no path", () => {
  expect(
    getToolCallDescription("file_manager", { command: "delete" }, true)
  ).toBe("Removed file");
});

// --- Unknown tool ---

test("unknown tool returns raw tool name", () => {
  expect(getToolCallDescription("some_internal_tool", {}, false)).toBe("some_internal_tool");
  expect(getToolCallDescription("some_internal_tool", {}, true)).toBe("some_internal_tool");
});

// --- ToolCallBadge component render ---

test("ToolCallBadge renders friendly done description for create", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/Card.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Created a new React component — Card.jsx")).toBeDefined();
});

test("ToolCallBadge renders friendly pending description for create", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/Card.jsx" },
        state: "call",
        result: undefined,
      }}
    />
  );
  expect(screen.getByText("Creating a new React component — Card.jsx")).toBeDefined();
});

test("ToolCallBadge renders done description for str_replace", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/App.jsx" },
        state: "result",
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Updated App.jsx")).toBeDefined();
});

test("ToolCallBadge renders done description for file_manager rename", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        args: { command: "rename", path: "/old.tsx", new_path: "/new.tsx" },
        state: "result",
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Renamed old.tsx → new.tsx")).toBeDefined();
});

test("ToolCallBadge renders done description for file_manager delete", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        args: { command: "delete", path: "/unused.tsx" },
        state: "result",
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Removed unused.tsx")).toBeDefined();
});

test("ToolCallBadge shows green dot when done", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "ok",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge shows spinner when pending", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
        result: undefined,
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeTruthy();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge never shows raw str_replace_editor text", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "ok",
      }}
    />
  );
  expect(screen.queryByText("str_replace_editor")).toBeNull();
});
