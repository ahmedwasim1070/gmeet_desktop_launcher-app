// Imports
import { ReactElement } from "react";

// Interface
interface PrimaryBoxProps {
	Child: ReactElement;
	className?: string;
}

//
export const PrimaryBox = ({ Child, className }: PrimaryBoxProps) => {
	return <div className={`primary-box ${className}`}>{Child}</div>;
};
