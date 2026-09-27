"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
  RemoveFormatting,
} from "lucide-react";

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  className?: string;
}

export const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Bắt đầu viết nội dung chia sẻ chi tiết...",
  disabled = false,
  minHeight = "240px",
  className,
}: RichTextEditorProps) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "rounded-md bg-muted/80 p-3 font-mono text-xs overflow-x-auto my-3 border border-border/60",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-primary/40 pl-4 py-1 italic my-3 text-muted-foreground",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 my-2 space-y-1",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 my-2 space-y-1",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "my-4 border-border/80",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class:
            "text-primary underline font-medium hover:text-primary/80 transition-colors",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if changed from outside
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // Sync disabled state
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt(
      "Nhập địa chỉ URL liên kết:",
      previousUrl || "https://",
    );

    if (url === null) {
      return;
    }

    if (url === "" || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!isMounted) {
    return (
      <div
        className={cn(
          "w-full rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground animate-pulse",
          className,
        )}
        style={{ minHeight }}
      >
        Đang tải trình soạn thảo...
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-full rounded-lg border border-border/80 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all shadow-xs",
        disabled && "opacity-60 pointer-events-none bg-muted/20",
        className,
      )}
    >
      {/* Editorial Minimalist Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-muted/25 px-2.5 py-1.5 text-muted-foreground select-none">
        {/* Headings */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors text-xs font-semibold flex items-center gap-0.5",
            editor.isActive("heading", { level: 2 }) &&
              "bg-background text-foreground shadow-xs font-bold",
          )}
          title="Tiêu đề lớn (H2)"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors text-xs font-semibold flex items-center gap-0.5",
            editor.isActive("heading", { level: 3 }) &&
              "bg-background text-foreground shadow-xs font-bold",
          )}
          title="Tiêu đề nhỏ (H3)"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border/80 mx-1" />

        {/* Text styling */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors",
            editor.isActive("bold") &&
              "bg-background text-foreground shadow-xs",
          )}
          title="In đậm (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors",
            editor.isActive("italic") &&
              "bg-background text-foreground shadow-xs",
          )}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors",
            editor.isActive("underline") &&
              "bg-background text-foreground shadow-xs",
          )}
          title="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors",
            editor.isActive("strike") &&
              "bg-background text-foreground shadow-xs",
          )}
          title="Gạch ngang"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors",
            editor.isActive("code") &&
              "bg-background text-foreground shadow-xs",
          )}
          title="Code inline"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border/80 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors",
            editor.isActive("bulletList") &&
              "bg-background text-foreground shadow-xs",
          )}
          title="Danh sách gạch đầu dòng"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors",
            editor.isActive("orderedList") &&
              "bg-background text-foreground shadow-xs",
          )}
          title="Danh sách đánh số"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border/80 mx-1" />

        {/* Blocks */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors",
            editor.isActive("blockquote") &&
              "bg-background text-foreground shadow-xs",
          )}
          title="Khối trích dẫn"
        >
          <Quote className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors"
          title="Đường phân đoạn"
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* Links */}
        <button
          type="button"
          onClick={setLink}
          className={cn(
            "p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors",
            editor.isActive("link") && "bg-background text-primary shadow-xs",
          )}
          title="Chèn liên kết"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded-md hover:bg-background text-destructive hover:text-destructive/80 transition-colors"
            title="Xóa liên kết"
          >
            <Unlink className="h-4 w-4" />
          </button>
        )}

        <div className="h-4 w-[1px] bg-border/80 mx-1" />

        {/* Clear & History */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          className="p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors"
          title="Xóa định dạng"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-md hover:bg-background hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-md hover:bg-background hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div
        className={cn(
          "p-4 text-sm leading-relaxed text-foreground/90 outline-none",
          "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[inherit]",
          "[&_.ProseMirror_p]:my-2 leading-relaxed",
          "[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:text-foreground",
          "[&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-1.5 [&_.ProseMirror_h3]:text-foreground",
          "[&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded-sm [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-xs",
          "[&_.ProseMirror.is-editor-empty:first-child::before]:text-muted-foreground/60 [&_.ProseMirror.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror.is-editor-empty:first-child::before]:float-left [&_.ProseMirror.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror.is-editor-empty:first-child::before]:h-0",
        )}
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
