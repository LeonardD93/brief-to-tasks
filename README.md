# Brief → Task List

Paste a project brief, get a structured task list with priorities, time estimates, and categories — powered by Claude AI.

## What it does

- Takes a free-text project brief (any language, any style)
- Calls Claude Haiku to extract tasks, priorities, hour estimates, and categories
- Displays results as a clean card list with a project summary
- Persists last result in localStorage — no re-calls on page reload

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS**
- **Anthropic SDK** — `claude-haiku-4-5-20251001`

## Setup

```bash
npm install
```

Create `.env` with your Anthropic API key:

```
ANTHROPIC_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  api/generate/route.ts   # POST /api/generate — calls Claude, returns JSON
  page.tsx                # single-page UI with localStorage persistence
  layout.tsx
  globals.css
```

## API

`POST /api/generate`

Request:
```json
{ "brief": "..." }
```

Response:
```json
{
  "projectSummary": "One-sentence summary",
  "tasks": [
    {
      "title": "Task name",
      "description": "What needs to be done",
      "priority": "high | medium | low",
      "estimatedHours": 4,
      "category": "Backend | Frontend | Design | DevOps | Research"
    }
  ]
}
```
