// Imports
import { useCallback, useEffect, useState } from "react";
import {
	requestPermission,
	sendNotification,
} from "@tauri-apps/plugin-notification";
import type { ScheduleMeeting } from "./types";
// Components
import { PrimaryBox } from "./components/ui/PrimaryBox";
import { GreetingsCard } from "./components/GreetingsCard";
import { CreateMeetingCard } from "./components/CreateMeetingCard";
import { JoinMeetingCard } from "./components/JoinMeetingCard";
import { ScheduledMeetingBox } from "./components/ScheduledMeetingBox";
// !
import PaymentPop from "./components/PaymentPop";
import ScheduleNotficationPop from "./components/ScheduleNotficationPop";
import MeetingUrlPop from "./components/MeetingUrlPop";
import ScheduleMeetingPop from "./components/ScheduleMeetingPop";
import useClipboardGmeetWatcher from "./hooks/useClipboardGmeetWatcher";
import ComingSoon from "./components/ComingSoon";
import { BackgroundList } from "./components/BackgroundList";

function App() {
	// States
	const [notificationPermission, setNotificationPermission] = useState<
		boolean | null
	>(() => {
		const stored = localStorage.getItem("notificationPermission");
		return stored ? JSON.parse(stored) : null;
	});
	const [isPaymentPop, setIsPaymentPop] = useState<boolean>(false);
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
	// Meeting Url from clipboard
	const [clipMeetingUrl, setClipMeetingUrl] = useState<URL | null>(null);
	// Meeting Url Popup
	const [isMeetingPop, setIsMeetingPop] = useState<boolean>(false);
	// Schedule Meeting pop
	const [isScheduleMeetingPop, setIsScheduleMeetingPop] =
		useState<boolean>(false);
	// Scheduled Meetings
	const [scheduledMeetings, setScheduledMeetings] = useState<ScheduleMeeting[]>(
		() => {
			const stored = localStorage.getItem("scheduledMeetings");
			const meetings: ScheduleMeeting[] = stored ? JSON.parse(stored) : [];
			if (meetings.length > 0) {
				const cleanedInvalidMeetings = meetings.filter(
					(meeting) => meeting.date > Date.now(),
				);
				return cleanedInvalidMeetings;
			} else {
				return meetings;
			}
		},
	);
	// Next Notification
	const [scheduleNotification, setScheduleNotification] =
		useState<ScheduleMeeting | null>(null);
	// Notify Pop
	const [isScheduleNotifyPop, setIsScheduleNotifyPop] =
		useState<boolean>(false);

	// clipboardWatcher Hook that looks for google meet urls
	const handleClipboard = useCallback((text: URL) => {
		if (text) {
			setIsMeetingPop(true);
			setClipMeetingUrl(text);
		}
	}, []);
	useClipboardGmeetWatcher(handleClipboard);

	// Effects
	useEffect(() => {
		async function checkPermission() {
			if (notificationPermission === null) {
				const ask = await requestPermission();
				setNotificationPermission(ask === "granted");
			}
		}
		checkPermission();
	}, [notificationPermission]);
	//
	useEffect(() => {
		if (notificationPermission !== null) {
			localStorage.setItem(
				"notificationPermission",
				JSON.stringify(notificationPermission),
			);
		}
	}, [notificationPermission]);
	// Update time and data
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
			scheduleNotification &&
			Math.abs(scheduleNotification.date - currentTime.getTime()) < 1000
		) {
			setIsScheduleNotifyPop(true);

			if (notificationPermission === true) {
				sendNotification({
					title: "Meeting Reminder",
					body: `You have a Scheduled Meeting`,
				});
			}
		}

		if (!scheduleNotification && scheduledMeetings.length > 0) {
			const sorted = [...scheduledMeetings].sort((a, b) => a.date - b.date);
			setScheduleNotification(sorted[0]);
		}
	}, [
		currentTime,
		scheduledMeetings,
		scheduleNotification,
		notificationPermission,
	]);
	// ScheduleMeeting
	useEffect(() => {
		if (scheduledMeetings) {
			localStorage.setItem(
				"scheduleMeetings",
				JSON.stringify(scheduledMeetings),
			);
		}
	}, [scheduledMeetings]);

	return (
		<section id="App" className="space-y-4 mt-10 p-4">
			{/* Popups */}
			{/*  */}
			{isPaymentPop && <PaymentPop setIsPaymentPop={setIsPaymentPop} />}
			{/* Schedule Notification Pop */}
			{isScheduleNotifyPop && scheduleNotification && (
				<ScheduleNotficationPop
					setIsScheduleNotifyPop={setIsScheduleNotifyPop}
					scheduleNotification={scheduleNotification}
					setScheduleNotification={setScheduleNotification}
					setScheduledMeetings={setScheduledMeetings}
				/>
			)}
			{/* Meeting Url */}
			{isMeetingPop && (
				<MeetingUrlPop
					clipMeetingUrl={clipMeetingUrl}
					setClipMeetingUrl={setClipMeetingUrl}
					setIsMeetingPop={setIsMeetingPop}
				/>
			)}
			{/* Schedule Meeting */}
			{isScheduleMeetingPop && (
				<ScheduleMeetingPop
					currentTime={currentTime}
					setIsScheduleMeetingPop={setIsScheduleMeetingPop}
					scheduledMeetings={scheduledMeetings}
					setScheduledMeetings={setScheduledMeetings}
				/>
			)}

			{/* Greetings */}
			<PrimaryBox Child={<GreetingsCard formattedDate={formattedDate} />} />

			{/*  */}
			<div className="flex flex-row gap-x-4">
				<PrimaryBox Child={<CreateMeetingCard />} className="flex-1" />
				<PrimaryBox Child={<JoinMeetingCard />} className="flex-1" />
			</div>

			{/* Upcoming Meetings */}
			<ScheduledMeetingBox
				currentTime={currentTime}
				setIsScheduleMeetingPop={setIsScheduleMeetingPop}
				scheduledMeetings={scheduledMeetings}
				setScheduledMeetings={setScheduledMeetings}
			/>

			{/* Backgrounds */}
			<BackgroundList />
		</section>
	);
}

export default App;
