// Imports
import type React from "react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

//
interface DraggableScrollListProps
	extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

//
export const DraggableScrollList = forwardRef<
	HTMLDivElement,
	DraggableScrollListProps
>(({ children, className = "", ...props }, ref) => {
	const internalRef = useRef<HTMLDivElement>(null);

	// Forward the internal ref to the parent so ScrollArrows can use it
	useImperativeHandle(ref, () => internalRef.current as HTMLDivElement);

	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [scrollLeft, setScrollLeft] = useState(0);

	const handleMouseDown = (e: React.MouseEvent) => {
		// e.button === 0 ensures we only trigger on Left-Click
		if (e.button !== 0 || !internalRef.current) return;
		setIsDragging(true);
		setStartX(e.pageX - internalRef.current.offsetLeft);
		setScrollLeft(internalRef.current.scrollLeft);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging || !internalRef.current) return;
		e.preventDefault(); // Prevents text highlighting while dragging
		const x = e.pageX - internalRef.current.offsetLeft;
		const walk = (x - startX) * 1.5; // Drag speed multiplier
		internalRef.current.scrollLeft = scrollLeft - walk;
	};

	const closeDrag = () => setIsDragging(false);

	return (
		<div
			ref={internalRef}
			onMouseDown={handleMouseDown}
			onMouseLeave={closeDrag}
			onMouseUp={closeDrag}
			onMouseMove={handleMouseMove}
			className={`flex overflow-x-auto scrollbar-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
			{...props}
		>
			{children}
		</div>
	);
});
