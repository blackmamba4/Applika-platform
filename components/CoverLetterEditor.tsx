"use client";

import CanvaCoverLetterEditor from "./CanvaCoverLetterEditor";

interface CoverLetterEditorProps {
  letterId: string;
  initialTitle: string;
  initialBody: string;
  initialMeta?: Record<string, unknown>;
  onBackToStep1: () => void;
}

export default function CoverLetterEditor(props: CoverLetterEditorProps) {
  return <CanvaCoverLetterEditor {...props} />;
}