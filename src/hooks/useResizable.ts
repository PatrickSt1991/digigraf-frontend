import { useRef } from "react";

export const useResizable = (
  options?: { minHeight?: number; maxHeight?: number; minWidth?: number; maxWidth?: number }
) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = targetRef.current;
    if (!target) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = target.offsetWidth;
    const startHeight = target.offsetHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let newWidth = startWidth + (moveEvent.clientX - startX);
      let newHeight = startHeight + (moveEvent.clientY - startY);

      if (options?.minWidth) newWidth = Math.max(options.minWidth, newWidth);
      if (options?.maxWidth) newWidth = Math.min(options.maxWidth, newWidth);
      if (options?.minHeight) newHeight = Math.max(options.minHeight, newHeight);
      if (options?.maxHeight) newHeight = Math.min(options.maxHeight, newHeight);

      target.style.width = `${newWidth}px`;
      target.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return { targetRef, startResizing };
};