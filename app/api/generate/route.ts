import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Task {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
  category: string;
}

export interface GenerateResponse {
  tasks: Task[];
  projectSummary: string;
}

export async function POST(req: NextRequest) {
  const { brief } = await req.json();

  if (!brief?.trim()) {
    return NextResponse.json({ error: "Brief is required" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a project manager. Analyse the following project brief and extract a structured task list.

Brief:
${brief}

Respond with valid JSON only, no markdown, no explanation. Use this exact schema:
{
  "projectSummary": "one sentence summary of the project",
  "tasks": [
    {
      "title": "short task title",
      "description": "what needs to be done",
      "priority": "high" | "medium" | "low",
      "estimatedHours": number,
      "category": "e.g. Backend, Frontend, Design, DevOps, Research"
    }
  ]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  const raw = content.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed: GenerateResponse = JSON.parse(raw);
  return NextResponse.json(parsed);
}
