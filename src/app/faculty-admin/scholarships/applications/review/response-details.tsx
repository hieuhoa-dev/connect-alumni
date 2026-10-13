interface ScholarshipResponseDetailsProps {
  answers: {
    id: string;
    answerValue: unknown;
    fileUrl: string | null;
    question: { label: string; orderIndex: number } | null;
  }[];
}

export const ScholarshipResponseDetails = ({
  answers,
}: ScholarshipResponseDetailsProps) => (
  <details className="rounded-lg border border-border p-3">
    <summary className="cursor-pointer text-sm font-medium">
      Xem nội dung hồ sơ ({answers.length} câu trả lời)
    </summary>
    <dl className="mt-4 flex flex-col gap-4">
      {[...answers]
        .sort(
          (first, second) =>
            (first.question?.orderIndex ?? 0) -
            (second.question?.orderIndex ?? 0),
        )
        .map((answer) => (
          <div key={answer.id} className="flex flex-col gap-1">
            <dt className="text-sm font-medium">
              {answer.question?.label ?? "Câu hỏi"}
            </dt>
            <dd className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
              {answer.fileUrl && /^https?:\/\//i.test(answer.fileUrl) ? (
                <a
                  href={answer.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Xem tài liệu minh chứng
                </a>
              ) : Array.isArray(answer.answerValue) ? (
                answer.answerValue.join(", ") || "Chưa trả lời"
              ) : answer.answerValue != null && answer.answerValue !== "" ? (
                String(answer.answerValue)
              ) : (
                "Chưa trả lời"
              )}
            </dd>
          </div>
        ))}
    </dl>
  </details>
);
