import React from "react";

export default function FormCard({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <hr />
      {children}
    </div>
  );
}