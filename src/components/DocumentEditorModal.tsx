import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { EditorContent, useEditor } from "@tiptap/react";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";

const bgColorAttr = {
  backgroundColor: {
    default: null,
    parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor
        ? { style: `background-color: ${attributes.backgroundColor}` }
        : {},
  },
};

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...bgColorAttr };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...bgColorAttr };
  },
});

const CustomTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: (element) => element.style.height || null,
        renderHTML: (attributes) =>
          attributes.height ? { style: `height: ${attributes.height}` } : {},
      },
    };
  },
});
import { adminEndpoints } from "../api/apiConfig";
import apiClient from "../api/apiClient";
import { useResizable } from "../hooks/useResizable";

export type AdminDocumentSavePayload = {
  title: string;
  header: string;
  body: string;
  footer: string;
};

type DocumentAsset = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAtUtc: string;
};

type DocumentAssetsResponse = {
  assets?: DocumentAsset[];
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

type AssetTarget = "header" | "footer" | null;

const FONT_FAMILIES = [
  "Arial",
  "Calibri",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Inter",
];

const FONT_SIZES = ["6pt", "7pt", "8pt", "9pt", "10pt", "11pt", "12pt", "14pt", "16pt", "18pt", "24pt", "32pt"];
const TEXT_COLORS = ["#000000", "#2E74B5", "#C00000", "#00B050", "#7030A0", "#44546A"];
const HIGHLIGHT_COLORS = ["#FFF2CC", "#FFE699", "#FFD966", "#C6E0B4", "#BDD7EE", "#F4CCCC"];
const CELL_BG_COLORS = [
  null,
  "#ffffff", "#f8fafc", "#e2e8f0",
  "#dbeafe", "#dcfce7", "#fef9c3", "#fee2e2", "#f3e8ff", "#ffedd5",
];
const ROW_HEIGHTS: { label: string; value: string | null }[] = [
  { label: "Automatisch", value: null },
  { label: "Klein", value: "30px" },
  { label: "Normaal", value: "45px" },
  { label: "Gemiddeld", value: "65px" },
  { label: "Groot", value: "90px" },
  { label: "Extra groot", value: "130px" },
];

const TABLE_PICKER_SIZE = 8;
const CELL_SIZE = 18;

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
        "inline-flex h-8 min-w-8 select-none items-center justify-center rounded-md px-2 text-sm transition-colors",
        active
          ? "bg-blue-100 font-semibold text-blue-700"
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

function formatBytes(bytes: number) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function insertAtCursor(
  textarea: HTMLTextAreaElement | null,
  value: string,
  insert: string
) {
  if (!textarea) {
    return `${value}${value && !value.endsWith("\n") ? "\n" : ""}${insert}`;
  }

  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;

  return value.slice(0, start) + insert + value.slice(end);
}

function getDocumentAssetUrl(id: string) {
  return adminEndpoints.documentContent(id);
}

function buildImageHtml(asset: DocumentAsset) {
  return `<img src="${getDocumentAssetUrl(asset.id)}" alt="${asset.fileName.replace(/"/g, "&quot;")}" style="max-width: 100%; height: auto;" />`;
}

function buildHeaderSnippet(asset: DocumentAsset) {
  return `<table style="width:100%; border-collapse:collapse;">
  <tbody>
    <tr>
      <td style="border:none; padding:18px 0 22px 0; text-align:center;">
        <img 
          src="${getDocumentAssetUrl(asset.id)}"
          alt="${asset.fileName.replace(/"/g, "&quot;")}" 
          style="display:inline-block; max-width:380px; width:100%; height:auto;" 
        />
      </td>
    </tr>
  </tbody>
</table>`;
}

function buildFooterSnippet(asset: DocumentAsset) {
  return `<table style="width:100%; border-collapse:collapse;">
  <tbody>
    <tr>
      <td style="width:120px; vertical-align:middle; border:none; padding:0;">
        <img src="${getDocumentAssetUrl(asset.id)}" alt="${asset.fileName.replace(/"/g, "&quot;")}" style="max-width:90px; height:auto;" />
      </td>
      <td style="vertical-align:middle; border:none; padding:0 12px; color:#666; font-size:10pt;">
        <p style="margin:0;">Eefting Uitvaartverzorging</p>
        <p style="margin:0;">begrafenissen en crematies</p>
      </td>
      <td style="width:24px; border:none; padding:0; text-align:right;">
        <img src="${getDocumentAssetUrl(asset.id)}" alt="" style="max-width:24px; height:auto; opacity:.3;" />
      </td>
    </tr>
  </tbody>
</table>`;
}

type AdminSectionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  summary: string;
  children: React.ReactNode;
};

function AdminSection({
  title,
  isOpen,
  onToggle,
  summary,
  children,
}: AdminSectionProps) {
  return (
    <div className="shrink-0 border-b bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-3 text-left hover:bg-gray-50"
      >
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-800">{title}</div>
          <div className="truncate text-xs text-gray-500">{summary}</div>
        </div>
        <div className="shrink-0 text-xs font-medium text-gray-500">
          {isOpen ? "Inklappen" : "Uitklappen"}
        </div>
      </button>

      {isOpen && <div className="border-t px-6 py-4">{children}</div>}
    </div>
  );
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = (props) => {
  const { isOpen, onClose, title, initialContent, header, footer } = props;
  const adminMode = props.adminMode === true;

  const modalRef = useRef<HTMLDivElement | null>(null);
  const loadedInitialContentRef = useRef<string | null>(null);

  const headerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const footerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const headerUploadInputRef = useRef<HTMLInputElement | null>(null);
  const footerUploadInputRef = useRef<HTMLInputElement | null>(null);

  const [documentTitle, setDocumentTitle] = useState(title ?? "");
  const [headerContent, setHeaderContent] = useState(header ?? "");
  const [footerContent, setFooterContent] = useState(footer ?? "");
  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [tableRows, setTableRows] = useState(0);
  const [tableCols, setTableCols] = useState(0);
  const [rowHeightInput, setRowHeightInput] = useState("");

  const [assets, setAssets] = useState<DocumentAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [assetPanelTarget, setAssetPanelTarget] = useState<AssetTarget>(null);
  const [uploadingTarget, setUploadingTarget] = useState<AssetTarget>(null);

  const [headerOpen, setHeaderOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);
  const [showHeaderPreview, setShowHeaderPreview] = useState(false);
  const [showFooterPreview, setShowFooterPreview] = useState(false);

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
          link: false,
          underline: false,
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
        CustomTableRow,
        CustomTableHeader,
        CustomTableCell,
      ],
      content: initialContent || "<p></p>",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "tiptap-prosemirror",
          spellcheck: "true",
          style: "color: #000000;",
        },
      },
    },
    []
  );

  const isInsideTable =
    !!editor?.isActive("tableCell") || !!editor?.isActive("tableHeader");

  const sortedAssets = useMemo(
    () =>
      [...assets].sort((a, b) => {
        const byDate =
          new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime();
        if (byDate !== 0) return byDate;
        return a.fileName.localeCompare(b.fileName);
      }),
    [assets]
  );

  const headerSummary = headerContent.trim()
    ? `${headerContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 90)}${headerContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length > 90 ? "…" : ""}`
    : "Geen header ingesteld";

  const footerSummary = footerContent.trim()
    ? `${footerContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 90)}${footerContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length > 90 ? "…" : ""}`
    : "Geen footer ingesteld";

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
      setAssetPanelTarget(null);
      setAssetsError(null);
      setHeaderOpen(false);
      setFooterOpen(false);
      setShowHeaderPreview(false);
      setShowFooterPreview(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !adminMode) return;

    const loadAssets = async () => {
      try {
        setAssetsLoading(true);
        setAssetsError(null);

        const data = await apiClient<DocumentAssetsResponse>(
          adminEndpoints.documentAssets
        );

        setAssets(data.assets ?? []);
      } catch (err) {
        setAssetsError(
          (err as Error).message ?? "Kon document assets niet laden."
        );
      } finally {
        setAssetsLoading(false);
      }
    };

    loadAssets();
  }, [adminMode, isOpen]);

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      const { $from } = editor.state.selection;
      for (let d = $from.depth; d >= 0; d--) {
        if ($from.node(d).type.name === "tableRow") {
          const h = $from.node(d).attrs.height as string | null;
          setRowHeightInput(h ?? "");
          return;
        }
      }
      setRowHeightInput("");
    };
    editor.on("selectionUpdate", sync);
    editor.on("update", sync);
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("update", sync);
    };
  }, [editor]);

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
    setLinkUrl(
      typeof currentHref === "string" && currentHref ? currentHref : "https://"
    );
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

  const setCellBgColor = (color: string | null) => {
    if (!editor) return;
    const { state } = editor;
    const { $from } = state.selection;
    for (let d = $from.depth; d >= 0; d--) {
      const node = $from.node(d);
      if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
        editor.view.dispatch(
          state.tr.setNodeMarkup($from.before(d), undefined, {
            ...node.attrs,
            backgroundColor: color,
          })
        );
        return;
      }
    }
  };

  const insertTable = (rows: number, cols: number) => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setTablePickerOpen(false);
  };

  const refreshAssets = async () => {
    const data = await apiClient<DocumentAssetsResponse>(
      adminEndpoints.documentAssets
    );
    setAssets(data.assets ?? []);
  };

  const insertIntoHeader = (html: string) => {
    setHeaderContent((current) =>
      insertAtCursor(headerTextareaRef.current, current, html)
    );
    setHeaderOpen(true);
    setAssetPanelTarget("header");
  };

  const insertIntoFooter = (html: string) => {
    setFooterContent((current) =>
      insertAtCursor(footerTextareaRef.current, current, html)
    );
    setFooterOpen(true);
    setAssetPanelTarget("footer");
  };

  const insertAsset = (
    asset: DocumentAsset,
    target: AssetTarget,
    mode: "image" | "header" | "footer"
  ) => {
    const html =
      mode === "header"
        ? buildHeaderSnippet(asset)
        : mode === "footer"
          ? buildFooterSnippet(asset)
          : buildImageHtml(asset);

    if (target === "header") {
      insertIntoHeader(html);
    }

    if (target === "footer") {
      insertIntoFooter(html);
    }
  };

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    target: AssetTarget
  ) => {
    const file = event.target.files?.[0];
    if (!file || !target) return;

    try {
      setUploadingTarget(target);
      setAssetsError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(adminEndpoints.documentAssets, {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const uploaded: DocumentAsset = await response.json();

      await refreshAssets();

      if (target === "header") {
        insertIntoHeader(buildImageHtml(uploaded));
      } else {
        insertIntoFooter(buildImageHtml(uploaded));
      }
    } catch (err) {
      setAssetsError((err as Error).message ?? "Uploaden van asset mislukt.");
    } finally {
      setUploadingTarget(null);
      event.target.value = "";
    }
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
          padding: 4px 8px;
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

        .document-html-preview {
          background: #fff;
        }

        .document-html-preview img {
          max-width: 100%;
          height: auto;
        }

        .document-html-preview table {
          width: 100%;
          border-collapse: collapse;
        }

        .document-html-preview td,
        .document-html-preview th {
          vertical-align: top;
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
            <AdminSection
              title="Header"
              isOpen={headerOpen}
              onToggle={() => {
                setHeaderOpen((v) => !v);
                if (assetPanelTarget === "header" && headerOpen) {
                  setAssetPanelTarget(null);
                }
              }}
              summary={headerSummary}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="block text-xs font-medium text-gray-600">
                  Header HTML
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={headerUploadInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleUpload(e, "header")}
                  />
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => headerUploadInputRef.current?.click()}
                    disabled={uploadingTarget === "header"}
                  >
                    {uploadingTarget === "header" ? "Uploaden..." : "Afbeelding uploaden"}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() =>
                      setAssetPanelTarget((current) =>
                        current === "header" ? null : "header"
                      )
                    }
                  >
                    {assetPanelTarget === "header" ? "Assets sluiten" : "Assets kiezen"}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowHeaderPreview((v) => !v)}
                  >
                    {showHeaderPreview ? "Preview verbergen" : "Preview tonen"}
                  </button>
                </div>
              </div>

              <textarea
                ref={headerTextareaRef}
                value={headerContent}
                onChange={(e) => setHeaderContent(e.target.value)}
                className="min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
              />

              {assetPanelTarget === "header" && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      Header assets
                    </span>
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-white"
                      onClick={() => refreshAssets()}
                    >
                      Vernieuwen
                    </button>
                  </div>

                  {assetsLoading && (
                    <div className="text-sm text-gray-500">Assets laden...</div>
                  )}

                  {!assetsLoading && assetsError && (
                    <div className="text-sm text-red-600">{assetsError}</div>
                  )}

                  {!assetsLoading && !assetsError && sortedAssets.length === 0 && (
                    <div className="text-sm text-gray-500">
                      Nog geen document assets gevonden.
                    </div>
                  )}

                  {!assetsLoading && !assetsError && sortedAssets.length > 0 && (
                    <div className="grid max-h-64 grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2">
                      {sortedAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <div className="mb-2 h-28 overflow-hidden rounded border bg-gray-50">
                            <img
                              src={getDocumentAssetUrl(asset.id)}
                              alt={asset.fileName}
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <div className="mb-3">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {asset.fileName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatBytes(asset.size)}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
                              onClick={() => insertAsset(asset, "header", "image")}
                            >
                              Voeg afbeelding toe
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100"
                              onClick={() => insertAsset(asset, "header", "header")}
                            >
                              Header snippet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showHeaderPreview && (
                <div className="mt-3">
                  <div className="mb-1 text-xs font-medium text-gray-500">Preview</div>
                  <div
                    className="document-html-preview min-h-[80px] rounded-lg border border-gray-200 bg-white px-4 py-3"
                    dangerouslySetInnerHTML={{ __html: headerContent || "<div></div>" }}
                  />
                </div>
              )}
            </AdminSection>
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
                onChange={(e) =>
                  editor.chain().focus().setFontFamily(e.target.value).run()
                }
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
                onChange={(e) =>
                  editor.chain().focus().setFontSize(e.target.value).run()
                }
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
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleBold().run()
                )}
              >
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton
                title="Italic"
                active={editor.isActive("italic")}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleItalic().run()
                )}
              >
                <em>I</em>
              </ToolbarButton>
              <ToolbarButton
                title="Underline"
                active={editor.isActive("underline")}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleUnderline().run()
                )}
              >
                <span className="underline">U</span>
              </ToolbarButton>
              <ToolbarButton
                title="Highlight"
                active={editor.isActive("highlight")}
                onMouseDown={runCommand(() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({ color: "#FFF2CC" })
                    .run()
                )}
              >
                ✦
              </ToolbarButton>

              <Divider />

              <select
                value={
                  editor.isActive("heading", { level: 1 })
                    ? "h1"
                    : editor.isActive("heading", { level: 2 })
                      ? "h2"
                      : editor.isActive("heading", { level: 3 })
                        ? "h3"
                        : "p"
                }
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
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleBulletList().run()
                )}
              >
                • List
              </ToolbarButton>
              <ToolbarButton
                title="Numbered list"
                active={editor.isActive("orderedList")}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleOrderedList().run()
                )}
              >
                1. List
              </ToolbarButton>
              <ToolbarButton
                title="Task list"
                active={editor.isActive("taskList")}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleTaskList().run()
                )}
              >
                ☑ Task
              </ToolbarButton>
              <ToolbarButton
                title="Quote"
                active={editor.isActive("blockquote")}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleBlockquote().run()
                )}
              >
                " "
              </ToolbarButton>
              <ToolbarButton
                title="Horizontal rule"
                onMouseDown={runCommand(() =>
                  editor.chain().focus().setHorizontalRule().run()
                )}
              >
                ―
              </ToolbarButton>

              <Divider />

              <ToolbarButton
                title="Links uitlijnen"
                active={editor.isActive({ textAlign: "left" })}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().setTextAlign("left").run()
                )}
              >
                <svg width="15" height="13" viewBox="0 0 15 13" fill="currentColor">
                  <rect x="0" y="0"  width="15" height="2" rx="1"/>
                  <rect x="0" y="4"  width="10" height="2" rx="1"/>
                  <rect x="0" y="8"  width="13" height="2" rx="1"/>
                  <rect x="0" y="12" width="8"  height="1" rx="0.5"/>
                </svg>
              </ToolbarButton>
              <ToolbarButton
                title="Centreren"
                active={editor.isActive({ textAlign: "center" })}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().setTextAlign("center").run()
                )}
              >
                <svg width="15" height="13" viewBox="0 0 15 13" fill="currentColor">
                  <rect x="0"   y="0"  width="15" height="2" rx="1"/>
                  <rect x="2.5" y="4"  width="10" height="2" rx="1"/>
                  <rect x="1"   y="8"  width="13" height="2" rx="1"/>
                  <rect x="3.5" y="12" width="8"  height="1" rx="0.5"/>
                </svg>
              </ToolbarButton>
              <ToolbarButton
                title="Rechts uitlijnen"
                active={editor.isActive({ textAlign: "right" })}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().setTextAlign("right").run()
                )}
              >
                <svg width="15" height="13" viewBox="0 0 15 13" fill="currentColor">
                  <rect x="0"  y="0"  width="15" height="2" rx="1"/>
                  <rect x="5"  y="4"  width="10" height="2" rx="1"/>
                  <rect x="2"  y="8"  width="13" height="2" rx="1"/>
                  <rect x="7"  y="12" width="8"  height="1" rx="0.5"/>
                </svg>
              </ToolbarButton>
              <ToolbarButton
                title="Uitvullen"
                active={editor.isActive({ textAlign: "justify" })}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().setTextAlign("justify").run()
                )}
              >
                <svg width="15" height="13" viewBox="0 0 15 13" fill="currentColor">
                  <rect x="0" y="0"  width="15" height="2" rx="1"/>
                  <rect x="0" y="4"  width="15" height="2" rx="1"/>
                  <rect x="0" y="8"  width="15" height="2" rx="1"/>
                  <rect x="0" y="12" width="10" height="1" rx="0.5"/>
                </svg>
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
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Link URL
                    </label>
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
                    setTablePickerOpen((value) => {
                      const next = !value;
                      if (next) {
                        setTableRows(0);
                        setTableCols(0);
                      }
                      return next;
                    });
                    setLinkMenuOpen(false);
                  })}
                >
                  ▦
                </ToolbarButton>

                {tablePickerOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close table picker"
                      className="fixed inset-0 z-10 cursor-default"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setTablePickerOpen(false);
                        setTableRows(0);
                        setTableCols(0);
                      }}
                    />

                    <div className="absolute left-0 top-10 z-20 w-[220px] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                      <div
                        className="grid gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${TABLE_PICKER_SIZE}, ${CELL_SIZE}px)`,
                        }}
                      >
                        {Array.from({
                          length: TABLE_PICKER_SIZE * TABLE_PICKER_SIZE,
                        }).map((_, index) => {
                          const row = Math.floor(index / TABLE_PICKER_SIZE) + 1;
                          const col = (index % TABLE_PICKER_SIZE) + 1;
                          const active = row <= tableRows && col <= tableCols;

                          return (
                            <button
                              key={`${row}-${col}`}
                              type="button"
                              aria-label={`Insert ${row} by ${col} table`}
                              className={[
                                "h-[18px] w-[18px] rounded-[3px] border transition-colors",
                                active
                                  ? "border-blue-500 bg-blue-100"
                                  : "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50",
                              ].join(" ")}
                              onMouseEnter={() => {
                                setTableRows(clampTableValue(row));
                                setTableCols(clampTableValue(col));
                              }}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                insertTable(row, col);
                                setTableRows(0);
                                setTableCols(0);
                              }}
                            />
                          );
                        })}
                      </div>

                      <div className="mt-3 border-t border-gray-100 pt-2 text-center text-sm text-gray-600">
                        {tableRows > 0 && tableCols > 0
                          ? `${tableRows} × ${tableCols}`
                          : "Tabel invoegen"}
                      </div>
                    </div>
                  </>
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
                <span className="mr-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Tabel
                </span>
                <ToolbarButton
                  title="Kolom voor invoegen"
                  disabled={!editor.can().addColumnBefore()}
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().addColumnBefore().run()
                  )}
                >
                  ←Col+
                </ToolbarButton>
                <ToolbarButton
                  title="Kolom na invoegen"
                  disabled={!editor.can().addColumnAfter()}
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().addColumnAfter().run()
                  )}
                >
                  Col+→
                </ToolbarButton>
                <ToolbarButton
                  title="Kolom verwijderen"
                  disabled={!editor.can().deleteColumn()}
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().deleteColumn().run()
                  )}
                >
                  Col−
                </ToolbarButton>
                <Divider />
                <ToolbarButton
                  title="Rij boven invoegen"
                  disabled={!editor.can().addRowBefore()}
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().addRowBefore().run()
                  )}
                >
                  ↑Row+
                </ToolbarButton>
                <ToolbarButton
                  title="Rij onder invoegen"
                  disabled={!editor.can().addRowAfter()}
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().addRowAfter().run()
                  )}
                >
                  Row+↓
                </ToolbarButton>
                <ToolbarButton
                  title="Rij verwijderen"
                  disabled={!editor.can().deleteRow()}
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().deleteRow().run()
                  )}
                >
                  Row−
                </ToolbarButton>
                <select
                  title="Rijhoogte"
                  value={rowHeightInput}
                  className="ml-1 h-8 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700"
                  onChange={(e) => {
                    const val = e.target.value;
                    setRowHeightInput(val);
                    editor.chain().focus().updateAttributes("tableRow", { height: val || null }).run();
                  }}
                >
                  {ROW_HEIGHTS.map(({ label, value }) => (
                    <option key={value ?? ""} value={value ?? ""}>
                      {label}
                    </option>
                  ))}
                </select>
                <Divider />
                <ToolbarButton
                  title="Cellen samenvoegen"
                  disabled={!editor.can().mergeCells()}
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().mergeCells().run()
                  )}
                >
                  Merge
                </ToolbarButton>
                <ToolbarButton
                  title="Cel splitsen"
                  disabled={!editor.can().splitCell()}
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().splitCell().run()
                  )}
                >
                  Split
                </ToolbarButton>
                <Divider />
                <ToolbarButton
                  title="Headerrij in-/uitschakelen"
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().toggleHeaderRow().run()
                  )}
                >
                  Header rij
                </ToolbarButton>
                <ToolbarButton
                  title="Headerkolom in-/uitschakelen"
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().toggleHeaderColumn().run()
                  )}
                >
                  Header kolom
                </ToolbarButton>
                <Divider />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Achtergrond</span>
                  <div className="flex items-center gap-0.5 rounded-md border border-gray-200 px-1 py-1">
                    {CELL_BG_COLORS.map((color) => (
                      <button
                        key={color ?? "none"}
                        type="button"
                        title={color ? color : "Geen achtergrond"}
                        className="h-5 w-5 rounded border border-gray-300 transition-colors hover:border-blue-400"
                        style={{ backgroundColor: color ?? "transparent" }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setCellBgColor(color);
                        }}
                      >
                        {color === null && (
                          <svg viewBox="0 0 20 20" className="h-full w-full text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="3" y1="3" x2="17" y2="17"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <Divider />
                <ToolbarButton
                  title="Tabel verwijderen"
                  disabled={!editor.can().deleteTable()}
                  onMouseDown={runCommand(() =>
                    editor.chain().focus().deleteTable().run()
                  )}
                  className="text-red-600 hover:bg-red-50"
                >
                  Tabel verwijderen
                </ToolbarButton>
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <BubbleMenu
              editor={editor}
              options={{ placement: "top" }}
              updateDelay={100}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
            >
              <ToolbarButton
                title="Bold"
                active={editor.isActive("bold")}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleBold().run()
                )}
              >
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton
                title="Italic"
                active={editor.isActive("italic")}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleItalic().run()
                )}
              >
                <em>I</em>
              </ToolbarButton>
              <ToolbarButton
                title="Underline"
                active={editor.isActive("underline")}
                onMouseDown={runCommand(() =>
                  editor.chain().focus().toggleUnderline().run()
                )}
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
            <div className="border-t">
              <AdminSection
                title="Footer"
                isOpen={footerOpen}
                onToggle={() => {
                  setFooterOpen((v) => !v);
                  if (assetPanelTarget === "footer" && footerOpen) {
                    setAssetPanelTarget(null);
                  }
                }}
                summary={footerSummary}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="block text-xs font-medium text-gray-600">
                    Footer HTML
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={footerUploadInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleUpload(e, "footer")}
                    />
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white"
                      onClick={() => footerUploadInputRef.current?.click()}
                      disabled={uploadingTarget === "footer"}
                    >
                      {uploadingTarget === "footer" ? "Uploaden..." : "Afbeelding uploaden"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white"
                      onClick={() =>
                        setAssetPanelTarget((current) =>
                          current === "footer" ? null : "footer"
                        )
                      }
                    >
                      {assetPanelTarget === "footer" ? "Assets sluiten" : "Assets kiezen"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white"
                      onClick={() => setShowFooterPreview((v) => !v)}
                    >
                      {showFooterPreview ? "Preview verbergen" : "Preview tonen"}
                    </button>
                  </div>
                </div>

                <textarea
                  ref={footerTextareaRef}
                  value={footerContent}
                  onChange={(e) => setFooterContent(e.target.value)}
                  className="min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
                />

                {assetPanelTarget === "footer" && (
                  <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">
                        Footer assets
                      </span>
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        onClick={() => refreshAssets()}
                      >
                        Vernieuwen
                      </button>
                    </div>

                    {assetsLoading && (
                      <div className="text-sm text-gray-500">Assets laden...</div>
                    )}

                    {!assetsLoading && assetsError && (
                      <div className="text-sm text-red-600">{assetsError}</div>
                    )}

                    {!assetsLoading && !assetsError && sortedAssets.length === 0 && (
                      <div className="text-sm text-gray-500">
                        Nog geen document assets gevonden.
                      </div>
                    )}

                    {!assetsLoading && !assetsError && sortedAssets.length > 0 && (
                      <div className="grid max-h-64 grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2">
                        {sortedAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                          >
                            <div className="mb-2 h-28 overflow-hidden rounded border bg-white">
                              <img
                                src={getDocumentAssetUrl(asset.id)}
                                alt={asset.fileName}
                                className="h-full w-full object-contain"
                              />
                            </div>

                            <div className="mb-3">
                              <div className="truncate text-sm font-medium text-gray-900">
                                {asset.fileName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatBytes(asset.size)}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-white"
                                onClick={() => insertAsset(asset, "footer", "image")}
                              >
                                Voeg afbeelding toe
                              </button>
                              <button
                                type="button"
                                className="rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100"
                                onClick={() => insertAsset(asset, "footer", "footer")}
                              >
                                Footer snippet
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showFooterPreview && (
                  <div className="mt-3">
                    <div className="mb-1 text-xs font-medium text-gray-500">
                      Preview
                    </div>
                    <div
                      className="document-html-preview min-h-[80px] rounded-lg border border-gray-200 bg-white px-4 py-3"
                      dangerouslySetInnerHTML={{ __html: footerContent || "<div></div>" }}
                    />
                  </div>
                )}
              </AdminSection>
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