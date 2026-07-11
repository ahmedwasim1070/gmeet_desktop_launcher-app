// Imports
import { useEffect, useState } from "react";
import {
	requestPermission,
	sendNotification,
} from "@tauri-apps/plugin-notification";
import type { ScheduledMeeting } from "./types";
// Services
import { AppServices } from "./components/services/AppServices";
// Components
import { PrimaryBox } from "./components/ui/PrimaryBox";
import { GreetingsCard } from "./components/home/GreetingsCard";
import { CreateMeetingCard } from "./components/home/CreateMeetingCard";
import { JoinMeetingCard } from "./components/home/JoinMeetingCard";
import { UpcomingMeetingsSection } from "./components/schedule/UpcomingMeetingsSection";
import { ScheduleMeetingPopup } from "./components/schedule/ScheduleMeetingPopup";
import { MeetingReminderPopup } from "./components/schedule/MeetingReminderPopup";
import { BackgroundsSection } from "./components/backgrounds/BackgroundsSection";

function App() {
	// States
	// Notification permission (persisted so we only ask once)
	const [hasNotificationPermission, setHasNotificationPermission] = useState<
		boolean | null
	>(() => {
		const stored = localStorage.getItem("notificationPermission");
		return stored ? JSON.parse(stored) : null;
	});
	// Machine readable time
	const [currentTime, setCurrentTime] = useState<Date>(new Date());
	// Human readable time
	const [formattedDate, setFormattedDate] = useState<string>(() =>
		new Date().toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		}),
	);
	// Schedule Meeting popup visibility
	const [isSchedulePopupOpen, setIsSchedulePopupOpen] =
		useState<boolean>(false);
	// Scheduled Meetings (past ones are dropped on load)
	const [scheduledMeetings, setScheduledMeetings] = useState<
		ScheduledMeeting[]
	>(() => {
		const stored = localStorage.getItem("scheduledMeetings");
		const meetings: ScheduledMeeting[] = stored ? JSON.parse(stored) : [];
		return meetings.filter((meeting) => meeting.date > Date.now());
	});
	// Next meeting to remind about
	const [nextReminder, setNextReminder] = useState<ScheduledMeeting | null>(
		null,
	);
	// Reminder popup visibility
	const [isReminderPopupOpen, setIsReminderPopupOpen] =
		useState<boolean>(false);

	// Effects
	// Ask for notification permission once
	useEffect(() => {
		async function checkPermission() {
			if (hasNotificationPermission === null) {
				const ask = await requestPermission();
				setHasNotificationPermission(ask === "granted");
			}
		}
		checkPermission();
	}, [hasNotificationPermission]);
	// Persist notification permission
	useEffect(() => {
		if (hasNotificationPermission !== null) {
			localStorage.setItem(
				"notificationPermission",
				JSON.stringify(hasNotificationPermission),
			);
		}
	}, [hasNotificationPermission]);
	// Update time and date every second
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();

			setCurrentTime(new Date(now));

			const newFormattedDate = new Date(now).toLocaleDateString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});

			setFormattedDate((prev) =>
				prev !== newFormattedDate ? newFormattedDate : prev,
			);
		}, 1000);

		return () => clearInterval(interval);
	}, []);
	// Check for schedule reminder
	useEffect(() => {
		if (
			nextReminder &&
			Math.abs(nextReminder.date - currentTime.getTime()) < 1000
		) {
			setIsReminderPopupOpen(true);

			if (hasNotificationPermission === true) {
				sendNotification({
					title: "Meeting Reminder",
					body: `You have a Scheduled Meeting`,
				});
			}
		}

		if (!nextReminder && scheduledMeetings.length > 0) {
			const sorted = [...scheduledMeetings].sort((a, b) => a.date - b.date);
			setNextReminder(sorted[0]);
		}
	}, [currentTime, scheduledMeetings, nextReminder, hasNotificationPermission]);
	// Persist scheduled meetings
	useEffect(() => {
		localStorage.setItem("scheduledMeetings", JSON.stringify(scheduledMeetings));
	}, [scheduledMeetings]);

	// Removes the reminded meeting and closes the reminder popup
	const dismissReminder = () => {
		if (nextReminder) {
			setScheduledMeetings((prev) =>
				prev.filter((meeting) => meeting.serial !== nextReminder.serial),
			);
		}
		setNextReminder(null);
		setIsReminderPopupOpen(false);
	};

	return (
		<AppServices>
			<section id="App" className="space-y-4 mt-10 p-4">
				{/* Popups */}
				{/* Meeting Reminder */}
				{isReminderPopupOpen && nextReminder && (
					<MeetingReminderPopup
						meeting={nextReminder}
						onClose={dismissReminder}
					/>
				)}
				{/* Schedule Meeting */}
				{isSchedulePopupOpen && (
					<ScheduleMeetingPopup
						currentTime={currentTime}
						scheduledMeetings={scheduledMeetings}
						setScheduledMeetings={setScheduledMeetings}
						onClose={() => setIsSchedulePopupOpen(false)}
					/>
				)}

				{/* Greetings */}
				<PrimaryBox Child={<GreetingsCard formattedDate={formattedDate} />} />

				{/* Create / Join */}
				<div className="flex flex-row gap-x-4">
					<PrimaryBox Child={<CreateMeetingCard />} className="flex-1" />
					<PrimaryBox Child={<JoinMeetingCard />} className="flex-1" />
				</div>

				{/* Upcoming Meetings */}
				<UpcomingMeetingsSection
					currentTime={currentTime}
					scheduledMeetings={scheduledMeetings}
					setScheduledMeetings={setScheduledMeetings}
					onScheduleNew={() => setIsSchedulePopupOpen(true)}
				/>

				{/* Backgrounds */}
				<BackgroundsSection />
			</section>
		</AppServices>
	);
}

export default App;
