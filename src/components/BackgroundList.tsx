// Imports
import { useRef } from "react";
import { ScrollButtons } from "./ui/ScrollButtons";
import { DraggableScrollList } from "./ui/DraggableScrollList";

//
export const BackgroundList = () => {
	//
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	return (
		<section className="w-full bg-bg-base">
			{/* Top Header Row */}
			<div className="w-full flex flex-row items-center justify-between mb-6">
				<div className="flex flex-col">
					<h2 className="font-bold text-2xl text-text-primary tracking-tight">
						Backgrounds
					</h2>
					<p className="text-sm text-text-muted mt-1">
						Download background's based on your taste.
					</p>
				</div>

				{/* Actions Cluster */}
				<div className="flex flex-row items-center gap-x-4">
					<ScrollButtons
						scrollContainerRef={scrollContainerRef}
						scrollAmount={340}
					/>
				</div>
			</div>

			<DraggableScrollList
				ref={scrollContainerRef}
				className="w-full gap-x-5 py-2"
			>
				{/* {scheduledMeetings.map((meeting) => (
						<MeetingCard
							key={meeting.serial}
							meeting={meeting}
							currentTime={currentTime}
							onDelete={handleMeetingDeletion}
						/>
					))} */}
			</DraggableScrollList>
		</section>
	);
};
