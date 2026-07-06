// Imports
import { MouseEventHandler } from "react";

// Interface
interface PrimaryButtonProps {
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

//
export const PrimaryButton = ({
  label,
  onClick,
  className,
}: PrimaryButtonProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`primary-button ${className}`}
    >
      {label}
    </button>
  );
};
