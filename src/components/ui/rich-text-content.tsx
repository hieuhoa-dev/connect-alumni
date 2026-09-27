import { cn } from "@/lib/utils";

interface RichTextContentProps {
  content: string;
  className?: string;
}

export const RichTextContent = ({
  content,
  className,
}: RichTextContentProps) => {
  if (!content) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (!isHtml) {
    return (
      <div
        className={cn(
          "text-base text-foreground/90 whitespace-pre-line leading-relaxed",
          className,
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "prose-content text-base text-foreground/90 leading-relaxed space-y-3",
        "[&_p]:my-2.5 [&_p]:leading-relaxed",
        "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3",
        "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2",
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1.5",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1.5",
        "[&_li]:text-foreground/90",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground",
        "[&_pre]:bg-muted/80 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-xs [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:border [&_pre]:border-border/60",
        "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:font-mono [&_code]:text-xs",
        "[&_hr]:my-6 [&_hr]:border-border/80",
        "[&_a]:text-primary [&_a]:underline [&_a]:font-medium hover:[&_a]:text-primary/80",
        className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized HTML rendered from TipTap editor
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
