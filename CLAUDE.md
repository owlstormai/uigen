# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # First-time setup: install deps, generate Prisma client, run migrations
npm run dev            # Start dev server with Turbopack
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Vitest (unit tests)
npm run db:reset       # Reset SQLite database
```

Run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

## Environment

Set `ANTHROPIC_API_KEY` in `.env` to use real Claude. Without it, the app uses a mock provider that returns static component examples — useful for development.

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates and edits files in a **virtual file system** (in-memory, not written to disk). Generated components render live in an iframe.

### Core Data Flow

```
User prompt → /api/chat (streaming) → Claude calls tools → VirtualFileSystem updated → iframe re-renders
```

1. `ChatContext` (`src/lib/contexts/chat-context.tsx`) manages the Vercel AI SDK `useChat` hook. On submit, it sends messages + serialized file system to `/api/chat`.
2. The API route (`src/app/api/chat/route.ts`) reconstructs the `VirtualFileSystem`, calls `streamText()` with Claude, and returns a streaming response.
3. Claude uses two tools: `str_replace_editor` (`src/lib/tools/str-replace.ts`) for file create/update/read and `file_manager` (`src/lib/tools/file-manager.ts`) for rename/delete.
4. Tool results update the `VirtualFileSystem` via `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`), which triggers a `refreshTrigger` counter.
5. `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) watches `refreshTrigger`, fetches all files, runs Babel on each JSX file via `jsx-transformer.ts`, builds an import map + HTML page, and writes it to an iframe.

### Virtual File System

`VirtualFileSystem` (`src/lib/file-system.ts`) is a `Map<path, FileNode>` held in React state. It supports `createFile`, `readFile`, `updateFile`, `deleteFile`, serialization to/from JSON, and string-replace operations used by Claude's tools. `/App.jsx` is the preview entry point.

### Preview Rendering

`jsx-transformer.ts` uses Babel Standalone to transform JSX, strips CSS imports, creates blob URLs for each file module, and assembles an HTML page with an import map. React and ReactDOM load from CDN. The iframe renders this HTML to show the live component.

### Language Model Provider

`src/lib/provider.ts` returns a real Anthropic Claude model when `ANTHROPIC_API_KEY` is set, or a `MockLanguageModel` that simulates 4 agentic steps with static component output.

### Persistence

Authenticated users' projects (messages + serialized file system) are saved to SQLite via Prisma on `onFinish`. Anonymous users' work is tracked in `localStorage` via `anon-work-tracker.ts`. The `Project` model stores `messages` and `data` as JSON strings.

### Auth

JWT-based sessions via `jose`, stored in HttpOnly cookies. `src/lib/auth.ts` handles session creation/verification. `src/middleware.ts` protects API routes.

### Key File Locations

| Concern | Location |
|---|---|
| AI system prompt | `src/lib/prompts/generation.tsx` |
| API endpoint | `src/app/api/chat/route.ts` |
| File system core | `src/lib/file-system.ts` |
| File system context | `src/lib/contexts/file-system-context.tsx` |
| Chat context | `src/lib/contexts/chat-context.tsx` |
| Preview rendering | `src/components/preview/PreviewFrame.tsx` |
| JSX transform | `src/lib/transform/jsx-transformer.ts` |
| LLM provider | `src/lib/provider.ts` |

### Path Aliases

`@/*` maps to `src/*` (configured in `tsconfig.json` and `components.json`).
