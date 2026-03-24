import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function getFileType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jsx":
    case "tsx":
      return "React component";
    case "ts":
      return "TypeScript module";
    case "js":
      return "JavaScript module";
    case "css":
    case "scss":
    case "sass":
      return "stylesheet";
    case "json":
      return "configuration file";
    case "md":
      return "documentation file";
    case "html":
      return "HTML file";
    default:
      return "file";
  }
}

export function getToolCallDescription(
  toolName: string,
  args: Record<string, unknown>,
  isDone: boolean
): string {
  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;
    const filename = path ? basename(path) : null;
    const fileType = path ? getFileType(path) : "file";

    switch (command) {
      case "create":
        return isDone
          ? `Created a new ${fileType} — ${filename ?? "file"}`
          : `Creating a new ${fileType} — ${filename ?? "file"}`;
      case "str_replace":
        return isDone
          ? `Updated ${filename ?? "file"}`
          : `Updating ${filename ?? "file"}`;
      case "insert":
        return isDone
          ? `Added code to ${filename ?? "file"}`
          : `Adding code to ${filename ?? "file"}`;
      case "view":
        return isDone
          ? `Read ${filename ?? "file"}`
          : `Reading ${filename ?? "file"}`;
      case "undo_edit":
        return isDone
          ? `Undid changes in ${filename ?? "file"}`
          : `Undoing changes in ${filename ?? "file"}`;
      default:
        return isDone
          ? `Updated ${filename ?? "file"}`
          : `Updating ${filename ?? "file"}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;
    const filename = path ? basename(path) : null;

    switch (command) {
      case "rename": {
        const newPath = args.new_path as string | undefined;
        const newFilename = newPath ? basename(newPath) : null;
        if (isDone && filename && newFilename) {
          return `Renamed ${filename} → ${newFilename}`;
        }
        return filename ? `Renaming ${filename}` : "Renaming file";
      }
      case "delete":
        return isDone
          ? `Removed ${filename ?? "file"}`
          : `Removing ${filename ?? "file"}`;
      default:
        return filename ? `Managing ${filename}` : "Managing file";
    }
  }

  return toolName;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const isDone = state === "result" && result != null;
  const description = getToolCallDescription(toolName, args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <span className="text-neutral-700">{description}</span>
    </div>
  );
}
