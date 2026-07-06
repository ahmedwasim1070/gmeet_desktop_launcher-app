// Imports
import { ChevronLeft, ChevronRight } from "lucide-react";

//
interface ScrollButtonsProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  scrollAmount?: number;
  disabled?: boolean;
}

//
export const ScrollButtons = ({
  scrollContainerRef,
  scrollAmount = 370,
  disabled = false,
}: ScrollButtonsProps) => {
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const btnBase =
    "p-1.5 rounded-full transition-colors flex items-center justify-center";
  const btnActive =
    "bg-bg-surface border border-border/20 text-text-primary hover:bg-gray-100 active:bg-gray-200 cursor-pointer shadow-sm";
  const btnDisabled =
    "bg-bg-base text-text-muted opacity-50 cursor-not-allowed";

  return (
    <div className="flex flex-row items-center gap-x-2">
      <button
        onClick={() => scroll("left")}
        disabled={disabled}
        className={`${btnBase} ${disabled ? btnDisabled : btnActive}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        disabled={disabled}
        className={`${btnBase} ${disabled ? btnDisabled : btnActive}`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
