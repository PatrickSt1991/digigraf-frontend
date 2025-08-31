import { useState, useEffect, useRef, useCallback } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// --- Divider Embed ---
const Embed = Quill.import('blots/embed') as any;

class Divider extends Embed {
  static blotName = 'divider';
  static tagName = 'hr';
  static create(value: any) {
    const node = super.create(value);
    node.setAttribute('style', 'border: 0; border-top: 1px solid rgba(0,0,0,.1); margin:10px 0;');
    return node;
  }
}
Quill.register(Divider);

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
  const quillRef = useRef<ReactQuill | null>(null);

  // Sync bodyContent whenever template changes
  useEffect(() => {
    setBodyContent(initialContent);
  }, [initialContent]);

  const handleSave = () => onSave(bodyContent);

  const dividerHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    let index = quill.getSelection()?.index ?? quill.getLength();
    quill.insertEmbed(index, 'divider', null, 'user');
    quill.setSelection(index + 1);
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["blockquote", "image", "clean"],
        ["divider"], // custom divider button
      ],
      handlers: {
        divider: dividerHandler,
      },
    },
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'color', 'background',
    'blockquote', 'image', 'divider'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[80vw] h-[80vh] min-w-[400px] min-h-[300px] p-6 relative flex flex-col overflow-auto">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>

        {header && (
          <div className="bg-gray-100 p-3 mb-4 rounded">
            <strong>Header:</strong>
            <div dangerouslySetInnerHTML={{ __html: header }} />
          </div>
        )}

        <div className="mb-4 flex-1 flex flex-col">
          <label className="block font-semibold mb-2">Body:</label>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={bodyContent}
            onChange={setBodyContent}
            modules={modules}
            formats={formats}
            style={{ flex: 1 }}
          />
        </div>

        {footer && (
          <div className="bg-gray-100 p-3 mt-4 rounded">
            <strong>Footer:</strong>
            <div dangerouslySetInnerHTML={{ __html: footer }} />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-green-600 text-white">Save</button>
        </div>

        <style>{`
          .ql-divider::before {
            content: "HR";
            font-size: 10px;
            font-weight: bold;
          }
        `}</style>
      </div>
    </div>
  );
};
