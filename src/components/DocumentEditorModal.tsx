import { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useResizable } from "../hooks/useResizable";

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialContent: string;
  header?: string;
  footer?: string;
  onSave: (content: string) => void;
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({
  isOpen,
  onClose,
  title,
  initialContent,
  header,
  footer,
  onSave,
}) => {
  const [bodyContent, setBodyContent] = useState(initialContent);
  const modalRef = useRef<HTMLDivElement>(null);

  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  // 🔹 After first render, lock maxWidth = initial width
  useEffect(() => {
    if (modalRef.current) {
      setMaxWidth(modalRef.current.offsetWidth);
    }
  }, [isOpen]);

  // Use hook with dynamic maxWidth
  const { targetRef, startResizing } = useResizable({
    minHeight: 300,
    minWidth: 400,
    maxHeight: 900,
    maxWidth, // will be set to initial width
  });

  useEffect(() => {
    setBodyContent(initialContent);
  }, [initialContent]);

  const handleSave = () => onSave(bodyContent);

  const handleEditorChange = (event: any, editor: any) => {
    setBodyContent(editor.getData());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        ref={(el) => {
          targetRef.current = el;
          modalRef.current = el;
        }}
        className="bg-white rounded-xl shadow-xl p-6 relative flex flex-col overflow-hidden"
        style={{ width: "90vw", height: "95vh", minWidth: "400px", minHeight: "300px" }}
      >
        {/* Title */}
        <h2 className="text-2xl font-bold mb-4">{title}</h2>

        {/* Optional header */}
        {header && (
          <div className="rounded mb-4">
            <div dangerouslySetInnerHTML={{ __html: header }} />
          </div>
        )}

        {/* 🔹 Editor container (scrollable) */}
        <div className="flex-1 flex flex-col overflow-hidden mb-4">
          <div className="flex-1 overflow-auto border rounded">
            <CKEditor
              editor={ClassicEditor}
              data={bodyContent}
              onChange={handleEditorChange}
              config={{
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "underline",
                  "strikethrough",
                  "|",
                  "fontColor",
                  "fontBackgroundColor",
                  "|",
                  "bulletedList",
                  "numberedList",
                  "outdent",
                  "indent",
                  "|",
                  "alignment",
                  "blockQuote",
                  "link",
                  "insertTable",
                  "imageUpload",
                  "mediaEmbed",
                  "|",
                  "horizontalLine",
                  "|",
                  "undo",
                  "redo",
                ],
              }}
            />
          </div>
        </div>

        {/* Footer pinned */}
        {footer && (
          <div className="bg-gray-100 p-3 rounded mb-4">
            <div dangerouslySetInnerHTML={{ __html: footer }} />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Sluiten
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-green-600 text-white"
          >
            Opslaan
          </button>
        </div>

        {/* Resize handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-se-resize rounded"
          onMouseDown={startResizing}
        />
      </div>
    </div>
  );
};
