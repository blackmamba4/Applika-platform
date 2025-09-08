"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface CoverLetterEditorProps {
  letterId: string;
  initialTitle: string;
  initialBody: string;
  initialMeta?: Record<string, unknown>;
  onBackToStep1: () => void;
}

export default function CoverLetterEditor({
  letterId: _letterId,
  initialTitle,
  initialBody,
  initialMeta: _initialMeta,
  onBackToStep1,
}: CoverLetterEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBackToStep1}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold">Cover Letter Editor</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Cover letter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={20}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Your cover letter content..."
          />
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Changes
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}