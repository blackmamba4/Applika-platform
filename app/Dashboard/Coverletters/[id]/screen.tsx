"use client";

import { useRouter } from "next/navigation";
import CoverLetterEditor from "../../../../components/CoverLetterEditor";

export default function EditorScreen({
  letterId,
  initialTitle,
  initialBody,
  initialMeta
}: {
  letterId: string;
  initialTitle: string;
  initialBody: string;
  initialMeta?: Record<string, any>;
}) {
  const router = useRouter();
  return (
    <CoverLetterEditor
      letterId={letterId}          // <-- IMPORTANT
      initialTitle={initialTitle}
      initialBody={initialBody}
      initialMeta={initialMeta}
      onBackToStep1={() => router.push("/Dashboard")}
    />
  );
}
