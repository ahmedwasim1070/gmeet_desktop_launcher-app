// Imports
import { ReactNode } from "react";

//
interface ActionIconButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
}

//
export const ActionIconButton = ({
  label,
  icon,
  onClick,
  className = "",
}: ActionIconButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 bg-brand-blue text-white rounded-lg flex flex-row items-center gap-x-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm ${className}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};
