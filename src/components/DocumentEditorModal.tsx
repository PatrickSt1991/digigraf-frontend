import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
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
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import { useResizable } from "../hooks/useResizable";

export type AdminDocumentSavePayload = {
  title: string;
  header: string;
  body: string;
  footer: string;
};

type BaseDocumentEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialContent: string;
  header?: string;
  footer?: string;
};

type UserDocumentEditorModalProps = BaseDocumentEditorModalProps & {
  adminMode?: false;
  onSave: (content: string) => void | Promise<void>;
};

type AdminDocumentEditorModalProps = BaseDocumentEditorModalProps & {
  adminMode: true;
  onSave: (payload: AdminDocumentSavePayload) => void | Promise<void>;
};

type DocumentEditorModalProps =
  | UserDocumentEditorModalProps
  | AdminDocumentEditorModalProps;

type ToolbarButtonProps = {
  onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const FONT_FAMILIES = [
  "Arial",
  "Calibri",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Inter",
];

const FONT_SIZES = ["10pt", "11pt", "12pt", "14pt", "16pt", "18pt", "24pt", "32pt"];
const TEXT_COLORS = ["#000000", "#2E74B5", "#C00000", "#00B050", "#7030A0", "#44546A"];
const HIGHLIGHT_COLORS = ["#FFF2CC", "#FFE699", "#FFD966", "#C6E0B4", "#BDD7EE", "#F4CCCC"];
const TABLE_PICKER_SIZE = 8
const CELL_SIZE = 18

function ToolbarButton({
  onMouseDown,
  active,
  disabled,
  title,
  children,
  className,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={onMouseDown}
      className={[
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors select-none",
        active
          ? "bg-blue-100 text-blue-700 font-semibold"
          : "text-gray-700 hover:bg-gray-100",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px self-center bg-gray-200" />;
}

function clampTableValue(value: number) {
  return Math.max(1, Math.min(TABLE_PICKER_SIZE, value));
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = (
  props
) => {
  const { isOpen, onClose, title, initialContent, header, footer } = props;
  const adminMode = props.adminMode === true;

  const modalRef = useRef<HTMLDivElement | null>(null);
  const loadedInitialContentRef = useRef<string | null>(null);

  const [documentTitle, setDocumentTitle] = useState(title ?? "");
  const [headerContent, setHeaderContent] = useState(header ?? "");
  const [footerContent, setFooterContent] = useState(footer ?? "");
  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [tableRows, setTableRows] = useState(0);
  const [tableCols, setTableCols] = useState(0);

  const { targetRef, startResizing } = useResizable({
    minHeight: 400,
    minWidth: 720,
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

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Underline,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        FontFamily,
        FontSize,
        Placeholder.configure({
          placeholder: "Begin met typen…",
          emptyEditorClass: "is-editor-empty",
        }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        }),
        Table.configure({
          resizable: true,
          allowTableNodeSelection: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: initialContent || "<p></p>",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "tiptap-prosemirror",
          spellcheck: "true",
        },
      },
    },
    []
  );

  const isInsideTable = !!editor?.isActive("table");

  useEffect(() => {
    setDocumentTitle(title ?? "");
  }, [title]);

  useEffect(() => {
    setHeaderContent(header ?? "");
  }, [header]);

  useEffect(() => {
    setFooterContent(footer ?? "");
  }, [footer]);

  useEffect(() => {
    if (!editor || !isOpen) return;

    const nextContent = initialContent || "<p></p>";
    if (loadedInitialContentRef.current === nextContent) return;

    editor.commands.setContent(nextContent, { emitUpdate: false });
    loadedInitialContentRef.current = nextContent;
    setLinkMenuOpen(false);
    setTablePickerOpen(false);
  }, [editor, initialContent, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setLinkMenuOpen(false);
      setTablePickerOpen(false);
      setTableRows(0);
      setTableCols(0);
    }
  }, [isOpen]);

  const currentFontFamily =
    (editor?.getAttributes("textStyle")?.fontFamily as string | undefined) ||
    "Arial";

  const currentFontSize =
    (editor?.getAttributes("textStyle")?.fontSize as string | undefined) ||
    "11pt";

  const runCommand = useCallback(
    (action: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      action();
    },
    []
  );

  const handleSave = async () => {
    if (!editor) return;

    const bodyContent = editor.getHTML();

    if (adminMode) {
      await props.onSave({
        title: documentTitle,
        header: headerContent,
        body: bodyContent,
        footer: footerContent,
      });
      return;
    }

    await props.onSave(bodyContent);
  };

  const openLinkMenu = () => {
    if (!editor) return;
    const currentHref = editor.getAttributes("link")?.href;
    setLinkUrl(typeof currentHref === "string" && currentHref ? currentHref : "https://");
    setLinkMenuOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const next = linkUrl.trim();

    if (!next || next === "https://") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: next }).run();
    }

    setLinkMenuOpen(false);
  };

  const insertTable = (rows: number, cols: number) => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setTablePickerOpen(false);
  };

  if (!isOpen || !editor) return null;

  return (
    <>
      <style>{`
        .document-editor-scroll {
          background: #c8c8c8;
          overflow: auto;
          flex: 1;
          min-width: 0;
          min-height: 0;
        }

        .document-editor-page {
          box-sizing: border-box;
          width: min(794px, calc(100% - 48px));
          max-width: 100%;
          min-height: 1122px;
          margin: 24px auto;
          background: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.07);
        }

        .document-editor-page-inner {
          box-sizing: border-box;
          min-height: 1122px;
          padding: 96px;
        }

        .tiptap-editor {
          min-height: 930px;
        }

        .tiptap-editor .tiptap-prosemirror {
          outline: none;
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000;
          word-break: break-word;
        }

        .tiptap-editor .tiptap-prosemirror.is-editor-empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }

        .tiptap-editor .tiptap-prosemirror h1 {
          font-size: 20pt;
          font-weight: 700;
          color: #2e74b5;
          margin: 0 0 10px;
        }

        .tiptap-editor .tiptap-prosemirror h2 {
          font-size: 16pt;
          font-weight: 700;
          color: #2e74b5;
          margin: 0 0 8px;
        }

        .tiptap-editor .tiptap-prosemirror h3 {
          font-size: 13pt;
          font-weight: 700;
          color: #1f4e79;
          margin: 0 0 6px;
        }

        .tiptap-editor .tiptap-prosemirror p,
        .tiptap-editor .tiptap-prosemirror ul,
        .tiptap-editor .tiptap-prosemirror ol,
        .tiptap-editor .tiptap-prosemirror blockquote,
        .tiptap-editor .tiptap-prosemirror pre,
        .tiptap-editor .tiptap-prosemirror table {
          margin: 0 0 10px;
        }

        .tiptap-editor .tiptap-prosemirror ul,
        .tiptap-editor .tiptap-prosemirror ol {
          padding-left: 24px;
        }

        .tiptap-editor .tiptap-prosemirror blockquote {
          border-left: 3px solid #2e74b5;
          padding: 4px 12px;
          color: #444;
        }

        .tiptap-editor .tiptap-prosemirror hr {
          border: none;
          border-top: 1px solid #d1d5db;
          margin: 16px 0;
        }

        .tiptap-editor .tiptap-prosemirror a {
          color: #2563eb;
          text-decoration: underline;
        }

        .tiptap-editor .tiptap-prosemirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          overflow: hidden;
        }

        .tiptap-editor .tiptap-prosemirror th,
        .tiptap-editor .tiptap-prosemirror td {
          border: 1px solid #cbd5e1;
          min-width: 64px;
          padding: 8px 10px;
          vertical-align: top;
          position: relative;
        }

        .tiptap-editor .tiptap-prosemirror th {
          background: #f8fafc;
          font-weight: 700;
        }

        .tiptap-editor .tiptap-prosemirror .selectedCell::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(59, 130, 246, 0.12);
          pointer-events: none;
        }

        .tiptap-editor .tiptap-prosemirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background: #3b82f6;
          pointer-events: none;
        }

        .tiptap-editor .tiptap-prosemirror ul[data-type='taskList'] {
          list-style: none;
          padding-left: 0;
        }

        .tiptap-editor .tiptap-prosemirror ul[data-type='taskList'] li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .tiptap-editor .tiptap-prosemirror ul[data-type='taskList'] li > label {
          margin-top: 3px;
          flex: 0 0 auto;
        }

        .tiptap-editor .tiptap-prosemirror ul[data-type='taskList'] li > div {
          flex: 1 1 auto;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
          ref={combinedRef}
          className="relative flex h-[92dvh] min-h-[400px] w-[94vw] min-w-[720px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:w-[86vw]"
        >
          <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b bg-gray-50 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 select-none items-center justify-center rounded bg-blue-700 text-xs font-bold text-white">
                W
              </div>

              {adminMode ? (
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="min-w-[280px] rounded border border-gray-300 bg-white px-2 py-1 text-sm font-semibold text-gray-800"
                  placeholder="Document titel"
                />
              ) : (
                <span className="text-sm font-semibold text-gray-800">{title}</span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {adminMode ? (
            <div className="shrink-0 border-b bg-white px-6 py-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">Header</label>
              <textarea
                value={headerContent}
                onChange={(e) => setHeaderContent(e.target.value)}
                className="min-h-[88px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
              />
            </div>
          ) : (
            header && (
              <div
                className="shrink-0 border-b bg-white px-6 py-2 text-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: header }}
              />
            )
          )}

          <div className="shrink-0 border-b bg-white px-3 py-2">
            <div className="flex flex-wrap items-center gap-y-2">
              <select
                value={currentFontFamily}
                onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>

              <select
                value={currentFontSize}
                onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                className="ml-2 h-8 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700"
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <Divider />

              <ToolbarButton
                title="Bold"
                active={editor.isActive("bold")}
                onMouseDown={runCommand(() => editor.chain().focus().toggleBold().run())}
              >
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton
                title="Italic"
                active={editor.isActive("italic")}
                onMouseDown={runCommand(() => editor.chain().focus().toggleItalic().run())}
              >
                <em>I</em>
              </ToolbarButton>
              <ToolbarButton
                title="Underline"
                active={editor.isActive("underline")}
                onMouseDown={runCommand(() => editor.chain().focus().toggleUnderline().run())}
              >
                <span className="underline">U</span>
              </ToolbarButton>
              <ToolbarButton
                title="Highlight"
                active={editor.isActive("highlight")}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleHighlight({ color: "#FFF2CC" }).run()
                )}
              >
                ✦
              </ToolbarButton>

              <Divider />

              <select
                value={editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "p"}
                onChange={(e) => {
                  const value = e.target.value;
                  const chain = editor.chain().focus();
                  if (value === "p") chain.setParagraph().run();
                  if (value === "h1") chain.toggleHeading({ level: 1 }).run();
                  if (value === "h2") chain.toggleHeading({ level: 2 }).run();
                  if (value === "h3") chain.toggleHeading({ level: 3 }).run();
                }}
                className="ml-1 h-8 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700"
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>

              <ToolbarButton
                title="Bullets"
                active={editor.isActive("bulletList")}
                onMouseDown={runCommand(() => editor.chain().focus().toggleBulletList().run())}
              >
                • List
              </ToolbarButton>
              <ToolbarButton
                title="Numbered list"
                active={editor.isActive("orderedList")}
                onMouseDown={runCommand(() => editor.chain().focus().toggleOrderedList().run())}
              >
                1. List
              </ToolbarButton>
              <ToolbarButton
                title="Task list"
                active={editor.isActive("taskList")}
                onMouseDown={runCommand(() => editor.chain().focus().toggleTaskList().run())}
              >
                ☑ Task
              </ToolbarButton>
              <ToolbarButton
                title="Quote"
                active={editor.isActive("blockquote")}
                onMouseDown={runCommand(() => editor.chain().focus().toggleBlockquote().run())}
              >
                “ ”
              </ToolbarButton>

              <Divider />

              <ToolbarButton
                title="Align left"
                active={editor.isActive({ textAlign: "left" })}
                onMouseDown={runCommand(() => editor.chain().focus().setTextAlign("left").run())}
              >
                ⬅
              </ToolbarButton>
              <ToolbarButton
                title="Align center"
                active={editor.isActive({ textAlign: "center" })}
                onMouseDown={runCommand(() => editor.chain().focus().setTextAlign("center").run())}
              >
                ↔
              </ToolbarButton>
              <ToolbarButton
                title="Align right"
                active={editor.isActive({ textAlign: "right" })}
                onMouseDown={runCommand(() => editor.chain().focus().setTextAlign("right").run())}
              >
                ➡
              </ToolbarButton>
              <ToolbarButton
                title="Justify"
                active={editor.isActive({ textAlign: "justify" })}
                onMouseDown={runCommand(() => editor.chain().focus().setTextAlign("justify").run())}
              >
                ☰
              </ToolbarButton>

              <Divider />

              <div className="ml-1 flex items-center gap-1 rounded-md border border-gray-200 px-1 py-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={`Text color ${color}`}
                    className="h-5 w-5 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      editor.chain().focus().setColor(color).run();
                    }}
                  />
                ))}
              </div>

              <div className="ml-2 flex items-center gap-1 rounded-md border border-gray-200 px-1 py-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={`Highlight ${color}`}
                    className="h-5 w-5 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      editor.chain().focus().setHighlight({ color }).run();
                    }}
                  />
                ))}
              </div>

              <Divider />

              <div className="relative ml-1">
                <ToolbarButton
                  title="Link"
                  active={editor.isActive("link") || linkMenuOpen}
                  onMouseDown={runCommand(openLinkMenu)}
                >
                  🔗
                </ToolbarButton>

                {linkMenuOpen && (
                  <div className="absolute left-0 top-10 z-20 w-80 rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
                    <label className="mb-1 block text-xs font-medium text-gray-600">Link URL</label>
                    <input
                      autoFocus
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="https://example.com"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          editor.chain().focus().unsetLink().run();
                          setLinkMenuOpen(false);
                        }}
                      >
                        Remove
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setLinkMenuOpen(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          applyLink();
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative ml-1">
                <ToolbarButton
                  title="Insert table"
                  active={tablePickerOpen}
                  onMouseDown={runCommand(() => {
                    setTablePickerOpen((value) => !value);
                    setLinkMenuOpen(false);
                  })}
                >
                  ▦
                </ToolbarButton>

                {tablePickerOpen && (
                  <div className="absolute left-0 top-10 z-20 rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: TABLE_PICKER_SIZE * TABLE_PICKER_SIZE }).map((_, index) => {
                        const row = Math.floor(index / TABLE_PICKER_SIZE) + 1;
                        const col = (index % TABLE_PICKER_SIZE) + 1;
                        const active = row <= tableRows && col <= tableCols;

                        return (
                          <button
                            key={`${row}-${col}`}
                            type="button"
                            className={[
                              "h-5 w-5 rounded-sm border",
                              active ? "border-blue-500 bg-blue-200" : "border-gray-300 bg-white hover:bg-gray-100",
                            ].join(" ")}
                            onMouseEnter={() => {
                              setTableRows(clampTableValue(row));
                              setTableCols(clampTableValue(col));
                            }}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              insertTable(row, col);
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {tableRows > 0 && tableCols > 0 ? `${tableRows} x ${tableCols}` : "Select table size"}
                    </div>
                  </div>
                )}
              </div>

              <ToolbarButton
                title="Undo"
                disabled={!editor.can().chain().focus().undo().run()}
                onMouseDown={runCommand(() => editor.chain().focus().undo().run())}
              >
                ↺
              </ToolbarButton>
              <ToolbarButton
                title="Redo"
                disabled={!editor.can().chain().focus().redo().run()}
                onMouseDown={runCommand(() => editor.chain().focus().redo().run())}
              >
                ↻
              </ToolbarButton>
            </div>

            {isInsideTable && (
              <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-gray-100 pt-2">
                <span className="mr-2 text-xs font-medium uppercase tracking-wide text-gray-500">Table</span>
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().addColumnBefore().run())}>+ Col L</ToolbarButton>
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().addColumnAfter().run())}>+ Col R</ToolbarButton>
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().deleteColumn().run())}>Del Col</ToolbarButton>
                <Divider />
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().addRowBefore().run())}>+ Row ↑</ToolbarButton>
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().addRowAfter().run())}>+ Row ↓</ToolbarButton>
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().deleteRow().run())}>Del Row</ToolbarButton>
                <Divider />
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().mergeCells().run())}>Merge</ToolbarButton>
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().splitCell().run())}>Split</ToolbarButton>
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().toggleHeaderRow().run())}>Header Row</ToolbarButton>
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().toggleHeaderColumn().run())}>Header Col</ToolbarButton>
                <ToolbarButton onMouseDown={runCommand(() => editor.chain().focus().deleteTable().run())}>Delete Table</ToolbarButton>
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {editor && (
              <BubbleMenu
                editor={editor}
                options={{ placement: 'top' }}
                updateDelay={100}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
              >
                <ToolbarButton
                  title="Bold"
                  active={editor.isActive("bold")}
                  onMouseDown={runCommand(() => editor.chain().focus().toggleBold().run())}
                >
                  <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                  title="Italic"
                  active={editor.isActive("italic")}
                  onMouseDown={runCommand(() => editor.chain().focus().toggleItalic().run())}
                >
                  <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                  title="Underline"
                  active={editor.isActive("underline")}
                  onMouseDown={runCommand(() => editor.chain().focus().toggleUnderline().run())}
                >
                  <span className="underline">U</span>
                </ToolbarButton>
                <ToolbarButton
                  title="Link"
                  active={editor.isActive("link")}
                  onMouseDown={runCommand(openLinkMenu)}
                >
                  🔗
                </ToolbarButton>
              </BubbleMenu>
            )}

            <div className="document-editor-scroll min-h-0 flex-1">
              <div className="document-editor-page">
                <div className="document-editor-page-inner">
                  <div className="tiptap-editor">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {adminMode ? (
            <div className="shrink-0 border-t bg-gray-50 px-6 py-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">Footer</label>
              <textarea
                value={footerContent}
                onChange={(e) => setFooterContent(e.target.value)}
                className="min-h-[88px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
              />
            </div>
          ) : (
            footer && (
              <div
                className="shrink-0 border-t bg-gray-50 px-6 py-2 text-sm text-gray-500"
                dangerouslySetInnerHTML={{ __html: footer }}
              />
            )
          )}

          <div className="flex shrink-0 items-center justify-end gap-2 rounded-b-xl border-t bg-gray-50 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Opslaan
            </button>
          </div>

          <div
            className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
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
