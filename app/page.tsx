"use client";

import { useState, useEffect } from "react";
import type { GenerateResponse, Task } from "./api/generate/route";

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  high: "bg-red-100 text-red-700 border border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  low: "bg-green-100 text-green-700 border border-green-200",
};

const EXAMPLE_BRIEF = `Build a web app for a small Italian real estate agency. The agency needs to:
- List properties with photos, prices and descriptions
- Let potential buyers send enquiries via a contact form
- Admin area to add/edit/delete properties
- Basic SEO for Google visibility
- Mobile-friendly design`;

export default function Home() {
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedBrief = localStorage.getItem("btl_brief");
    const savedResult = localStorage.getItem("btl_result");
    if (savedBrief) setBrief(savedBrief);
    if (savedResult) setResult(JSON.parse(savedResult));
  }, []);

  async function generate() {
    if (!brief.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });

      if (!res.ok) throw new Error("Generation failed");
      const data: GenerateResponse = await res.json();
      setResult(data);
      localStorage.setItem("btl_brief", brief);
      localStorage.setItem("btl_result", JSON.stringify(data));
    } catch {
      setError("Something went wrong. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  const totalHours = result?.tasks.reduce((s, t) => s + t.estimatedHours, 0) ?? 0;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">Brief → Task List</h1>
          <p className="text-gray-400 text-sm">
            Paste a project brief. Get a structured task list with priorities and time estimates.
          </p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">Project brief</label>
            <button
              onClick={() => setBrief(EXAMPLE_BRIEF)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Load example
            </button>
          </div>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe the project: what it should do, who it's for, any constraints or requirements..."
            rows={7}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <button
          onClick={generate}
          disabled={loading || !brief.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors text-sm"
        >
          {loading ? "Generating…" : "Generate task list"}
        </button>

        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}

        {result && (
          <div className="mt-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300">{result.projectSummary}</p>
              <p className="text-xs text-gray-500 mt-1">
                {result.tasks.length} tasks · {totalHours}h estimated
              </p>
            </div>

            <div className="space-y-3">
              {result.tasks.map((task: Task, i: number) => (
                <div
                  key={i}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-white">{task.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                        {task.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-semibold text-indigo-400">{task.estimatedHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
