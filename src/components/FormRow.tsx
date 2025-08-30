import React from "react";

type Props = {
  children: React.ReactNode;
  cols?: number;         // number of columns on md+
  gap?: string;          // tailwind gap class, e.g. "gap-4"
  className?: string;
};

export default function FormRow({ children, cols = 3, gap = "gap-4", className = "" }: Props) {
  const cls = `form-row-cols-${cols}`;

  // media query uses 768px as Tailwind's md breakpoint
  const css = `
    @media (min-width: 768px) {
      .${cls} { grid-template-columns: repeat(${cols}, minmax(0,1fr)); }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className={`grid grid-cols-1 ${gap} ${cls} ${className}`}>
        {children}
      </div>
    </>
  );
}
