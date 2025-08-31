import { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

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

  // Sync bodyContent whenever a new template is loaded
  useEffect(() => {
    setBodyContent(initialContent);
  }, [initialContent]);

  const handleSave = () => {
    onSave(bodyContent);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-4/5 max-w-4xl p-6 relative">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>

        {header && (
          <div className="bg-gray-100 p-3 mb-4 rounded">
            <strong>Header:</strong>
            <div dangerouslySetInnerHTML={{ __html: header }} />
          </div>
        )}

        <div className="mb-4">
          <label className="block font-semibold mb-2">Body:</label>
          <ReactQuill theme="snow" value={bodyContent} onChange={setBodyContent} />
        </div>

        {footer && (
          <div className="bg-gray-100 p-3 mt-4 rounded">
            <strong>Footer:</strong>
            <div dangerouslySetInnerHTML={{ __html: footer }} />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-green-600 text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};