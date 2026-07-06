// Imports
import { ReactElement } from "react";

// Interface
interface PrimaryBoxProps {
  Child: ReactElement;
  className?: string;
}

//
export const PrimaryBox = ({ Child, className }: PrimaryBoxProps) => {
  return (
    <div className={`p-4 bg-bg-surface rounded-lg ${className}`}>{Child}</div>
  );
};
