import { useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import FontFamily from "@tiptap/extension-font-family";
import { useResizable } from "../hooks/useResizable";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialContent: string;
  header?: string;
  footer?: string;
  onSave: (content: string) => void;
}

// ─── Toolbar helpers ──────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`
        px-1.5 py-1 rounded text-sm leading-none transition-colors select-none
        ${active
          ? "bg-blue-100 text-blue-700 font-semibold"
          : "text-gray-700 hover:bg-gray-100"
        }
        ${disabled ? "opacity-30 cursor-default" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-gray-200 mx-0.5 self-center" />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({
  isOpen,
  onClose,
  title,
  initialContent,
  header,
  footer,
  onSave,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { targetRef, startResizing } = useResizable({
    minHeight: 400,
    minWidth: 640,
    maxHeight: 960,
    maxWidth: undefined,
  });

  const combinedRef = useCallback(
    (el: HTMLDivElement | null) => {
      targetRef.current = el;
      modalRef.current = el;
    },
    [targetRef]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // Disabled here because we add configured versions below
        underline: false,
        link: false,
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle, // Required base for Color and FontFamily
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap-page",
      },
    },
  });

  // Sync content when the modal is reopened for a different template
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [initialContent, editor]);

  const handleSave = () => {
    if (editor) onSave(editor.getHTML());
  };

  if (!isOpen || !editor) return null;

  const addLink = () => {
    const url = window.prompt("URL:", editor.getAttributes("link").href ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <>
      {/* ── Page-level styles injected once ── */}
      <style>{`
        /* Gray print-area background */
        .tiptap-scroll-area {
          background: #c8c8c8;
          overflow-y: auto;
          overflow-x: auto;
          flex: 1;
        }

        /* The white A4 "page" */
        .tiptap-page {
          min-height: 1122px;
          width: 794px;
          padding: 96px 96px 96px 121px;
          margin: 24px auto;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.07);
          outline: none;
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.15;
          color: #000;
        }

        /* Typography inside editor */
        .tiptap-page h1 { font-size: 20pt; font-weight: bold; color: #2E74B5; margin: 0 0 10px; }
        .tiptap-page h2 { font-size: 16pt; font-weight: bold; color: #2E74B5; margin: 0 0 8px; }
        .tiptap-page h3 { font-size: 13pt; font-weight: bold; color: #1F4E79; margin: 0 0 6px; }
        .tiptap-page p  { margin: 0 0 6pt; }
        .tiptap-page ul, .tiptap-page ol { margin: 0 0 6pt 24px; padding: 0; }
        .tiptap-page li { margin-bottom: 2pt; }
        .tiptap-page blockquote {
          border-left: 3px solid #2E74B5;
          margin: 8pt 0;
          padding: 4pt 12pt;
          color: #444;
        }
        .tiptap-page hr { border: none; border-top: 1px solid #ccc; margin: 12pt 0; }
        .tiptap-page a  { color: #2E74B5; text-decoration: underline; }

        /* Tables */
        .tiptap-page table {
          border-collapse: collapse;
          width: 100%;
          margin: 8pt 0;
          table-layout: fixed;
        }
        .tiptap-page th, .tiptap-page td {
          border: none;
          padding: 4px 8px;
          vertical-align: top;
          position: relative;
        }
        .tiptap-page th {
          background: transparent;
          font-weight: bold;
        }

        /* TipTap table internals */
        .tiptap-page .selectedCell:after {
          background: rgba(46, 116, 181, 0.08);
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
        .tiptap-page .column-resize-handle {
          background-color: #2E74B5;
          bottom: -2px;
          position: absolute;
          right: -2px;
          pointer-events: none;
          top: 0;
          width: 2px;
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div
          ref={combinedRef}
          className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden w-[92vw] md:w-[82vw] h-[92vh] min-w-[640px] min-h-[400px] relative"
        >
          {/* ── Title bar ── */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50 rounded-t-xl flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 bg-blue-700 rounded text-white text-xs font-bold select-none">
                W
              </div>
              <span className="text-sm font-semibold text-gray-800">{title}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* ── Toolbar ── */}
          <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b bg-white flex-shrink-0 overflow-x-auto">

            {/* Heading / paragraph style */}
            <select
              className="text-sm border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 bg-white cursor-pointer hover:bg-gray-50 mr-1"
              value={
                editor.isActive("heading", { level: 1 }) ? "1"
                  : editor.isActive("heading", { level: 2 }) ? "2"
                  : editor.isActive("heading", { level: 3 }) ? "3"
                  : "0"
              }
              onChange={(e) => {
                const level = parseInt(e.target.value);
                if (level === 0) editor.chain().focus().setParagraph().run();
                else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
              }}
            >
              <option value="0">Normaal</option>
              <option value="1">Koptekst 1</option>
              <option value="2">Koptekst 2</option>
              <option value="3">Koptekst 3</option>
            </select>

            {/* Font family */}
            <select
              className="text-sm border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 bg-white cursor-pointer hover:bg-gray-50 mr-1"
              value={editor.getAttributes("textStyle").fontFamily ?? "Arial"}
              onChange={(e) => {
                if (e.target.value === "Arial") {
                  editor.chain().focus().unsetFontFamily().run();
                } else {
                  editor.chain().focus().setFontFamily(e.target.value).run();
                }
              }}
            >
              <option value="Arial">Arial</option>
              <option value="Calibri">Calibri</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier New</option>
            </select>

            <Divider />

            {/* Marks */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Vet (Ctrl+B)"
            >
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Cursief (Ctrl+I)"
            >
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              title="Onderstreept (Ctrl+U)"
            >
              <span className="underline">U</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              title="Doorhalen"
            >
              <span className="line-through">S</span>
            </ToolbarButton>

            <Divider />

            {/* Text color */}
            <label
              title="Tekstkleur"
              className="flex items-center gap-1 px-1.5 py-1 rounded text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <span>A</span>
              <input
                type="color"
                className="w-4 h-4 cursor-pointer border-0 p-0 rounded"
                value={editor.getAttributes("textStyle").color ?? "#000000"}
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              />
            </label>

            {/* Highlight */}
            <label
              title="Markeerkleur"
              className="flex items-center gap-1 px-1.5 py-1 rounded text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <span className="bg-yellow-200 px-0.5 rounded-sm">ab</span>
              <input
                type="color"
                className="w-4 h-4 cursor-pointer border-0 p-0 rounded"
                defaultValue="#fef08a"
                onChange={(e) =>
                  editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
                }
              />
            </label>

            <Divider />

            {/* Lists + indent */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Opsomming"
            >
              ≡•
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Genummerde lijst"
            >
              ≡1
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().liftListItem("listItem").run()}
              title="Inspringing verminderen"
            >
              ←
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
              title="Inspringing vergroten"
            >
              →
            </ToolbarButton>

            <Divider />

            {/* Alignment */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })}
              title="Links uitlijnen"
            >
              ◧
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              active={editor.isActive({ textAlign: "center" })}
              title="Centreren"
            >
              ◫
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editor.isActive({ textAlign: "right" })}
              title="Rechts uitlijnen"
            >
              ◨
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              active={editor.isActive({ textAlign: "justify" })}
              title="Uitvullen"
            >
              ▤
            </ToolbarButton>

            <Divider />

            {/* Block elements */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Citaat"
            >
              ❝
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontale lijn"
            >
              —
            </ToolbarButton>
            <ToolbarButton
              onClick={addLink}
              active={editor.isActive("link")}
              title="Link invoegen / bewerken"
            >
              🔗
            </ToolbarButton>
            <ToolbarButton onClick={insertTable} title="Tabel invoegen">
              ⊞
            </ToolbarButton>

            <Divider />

            {/* History */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Ongedaan maken (Ctrl+Z)"
            >
              ↩
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Opnieuw (Ctrl+Y)"
            >
              ↪
            </ToolbarButton>
          </div>

          {/* ── Header (read-only) ── */}
          {header && (
            <div
              className="flex-shrink-0 border-b px-6 py-2 text-sm text-gray-600 bg-white"
              dangerouslySetInnerHTML={{ __html: header }}
            />
          )}

          {/* ── Gray print area containing the white A4 page ── */}
          <div className="tiptap-scroll-area">
            <EditorContent editor={editor} />
          </div>

          {/* ── Footer (read-only) ── */}
          {footer && (
            <div
              className="flex-shrink-0 border-t px-6 py-2 text-sm text-gray-500 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: footer }}
            />
          )}

          {/* ── Action bar ── */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50 rounded-b-xl flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Opslaan
            </button>
          </div>

          {/* ── Resize handle ── */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={startResizing}
            style={{
              background: "linear-gradient(135deg, transparent 50%, #9ca3af 50%)",
              borderRadius: "0 0 10px 0",
            }}
          />
        </div>
      </div>
    </>
  );
};