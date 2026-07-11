// Imports
import { Download } from "lucide-react";
import { ActionIconButton } from "../ui/ActionIconButton";

// Interface
interface BackgroundCardProps {
	imageLocation: string;
	imageDescription: string;
}

// Card for a single downloadable virtual background
export const BackgroundCard = ({
	imageLocation,
	imageDescription,
}: BackgroundCardProps) => {
	return (
		<div className="w-[320px] shrink-0 bg-bg-surface rounded-xl p-5 relative border border-border/15 shadow-sm flex flex-col justify-between gap-y-4 transition-all hover:shadow-md">
			{/*  */}
			<div className="absolute z-10 w-full h-full inset-0 flex justify-center">
				<ActionIconButton
					label="Download"
					icon={<Download className="w-5 h-5" />}
					onClick={() => {
						// TODO: implement background download
					}}
				/>
			</div>

			{/*  */}
			<img src={imageLocation} alt={imageDescription} />
		</div>
	);
};
