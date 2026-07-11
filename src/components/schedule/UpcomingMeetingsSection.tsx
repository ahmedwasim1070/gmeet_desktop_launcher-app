// Imports
import { useRef } from "react";
import { Plus } from "lucide-react";
import { DraggableScrollList } from "../ui/DraggableScrollList";
import { ScrollButtons } from "../ui/ScrollButtons";
import { ActionIconButton } from "../ui/ActionIconButton";
import { NoMeetingsPlaceholder } from "./NoMeetingsPlaceholder";
import { ScheduledMeetingCard } from "./ScheduledMeetingCard";
import { useTime } from "../../providers/TimeProvider";
import { UseApp } from "../../providers/AppProvider";

// Interface
interface UpcomingMeetingsSectionProps {
	onScheduleNew: () => void;
}

// Horizontal list of upcoming scheduled meetings with a "Schedule New" action
export const UpcomingMeetingsSection = ({
	onScheduleNew,
}: UpcomingMeetingsSectionProps) => {
	// Providers
	const {currentTime} = useTime();
	const {scheduledMeetings,setScheduledMeetings} = UseApp();
	//
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const hasMeetings = scheduledMeetings.length > 0;

	const handleMeetingDeletion = (meetingSerialNumber: number) => {
		setScheduledMeetings((prev) =>
			prev.filter((m) => m.serial !== meetingSerialNumber),
		);
	};

	return (
		<section className="w-full bg-bg-base rounded-2xl">
			{/* Top Header Row */}
			<div className="w-full flex flex-row items-center justify-between mb-6">
				<div className="flex flex-col">
					<h2 className="font-bold text-2xl text-text-primary tracking-tight">
						Upcoming Meetings
					</h2>
					{hasMeetings && (
						<p className="text-sm text-text-muted mt-1">
							You have {scheduledMeetings.length} Meetings Scheduled
						</p>
					)}
				</div>

				{/* Actions Cluster */}
				<div className="flex flex-row items-center gap-x-4">
					<ScrollButtons
						scrollContainerRef={scrollContainerRef}
						disabled={!hasMeetings}
						scrollAmount={340} // Card width + gap
					/>
					<ActionIconButton
						label="Schedule New"
						icon={<Plus className="w-4 h-4" />}
						onClick={onScheduleNew}
					/>
				</div>
			</div>

			{/* Content Area */}
			{hasMeetings ? (
				<DraggableScrollList
					ref={scrollContainerRef}
					className="w-full gap-x-5 py-2"
				>
					{scheduledMeetings.map((meeting) => (
						<ScheduledMeetingCard
							key={meeting.serial}
							meeting={meeting}
							currentTime={currentTime}
							onDelete={handleMeetingDeletion}
						/>
					))}
				</DraggableScrollList>
			) : (
				<NoMeetingsPlaceholder />
			)}
		</section>
	);
};
