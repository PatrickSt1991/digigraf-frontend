import { Fragment } from "react";

export default function TitleCard({ 
  title, 
  className = "",
  showDivider = true
}: { 
  title: string;
  className?: string;
  showDivider?: boolean;
}) {
  return (
    <div className="rounded-lg">
      <Fragment>
        <h2 className={`text-xl font-bold ${className}`}>
          {title}
        </h2>
        {showDivider && <hr className="border-gray-200 my-3" />}
      </Fragment>
    </div>
  );
}