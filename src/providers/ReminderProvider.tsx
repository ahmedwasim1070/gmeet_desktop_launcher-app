// Imports
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { ScheduledMeeting } from "../types";
import { ReminderService, MAX_TIMEOUT_MS } from "../services/ReminderService";
import { UseApp } from "./AppProvider";

// Interface
interface ReminderProvidedProps {
	nextReminder: ScheduledMeeting | null;
	isReminderPopupOpen: boolean;
	dismissReminder: () => void;
}
interface ReminderProviderProps {
	children: ReactNode;
}

//
const ReminderProviderContext = createContext<ReminderProvidedProps | undefined>(undefined);

//
export default function ReminderProvider({children}:ReminderProviderProps) {
	// Meetings from the app state
	const { scheduledMeetings, setScheduledMeetings } = UseApp();
	// Meeting currently being reminded about (popup is open while non-null)
	const [nextReminder, setNextReminder] = useState<ScheduledMeeting | null>(null);
	// Fire the reminder for a due meeting
	const fireReminder = useCallback((meeting: ScheduledMeeting) => {
		setNextReminder(meeting);
		ReminderService.notify(meeting);
	}, []);

	// Schedule a single timeout for the earliest upcoming meeting
	useEffect(() => {
		// Don't re-arm while a reminder is on screen
		if (nextReminder) return;
		const next = ReminderService.getNextMeeting(scheduledMeetings);
		if (!next) return;
		const delay = ReminderService.msUntil(next);
		const timeout = setTimeout(() => {
			// If the delay was clamped (meeting > ~24 days away), this re-arms
			// via the effect instead of firing early.
			if (ReminderService.isDue(next)) fireReminder(next);
			else setNextReminder((prev) => prev); // no-op; effect re-runs on deps anyway
		}, delay);
		// After sleep/suspend, timers can drift — re-check when the app regains focus
		const recheck = () => {
			if (ReminderService.isDue(next)) fireReminder(next);
		};
		window.addEventListener("focus", recheck);
		document.addEventListener("visibilitychange", recheck);
		return () => {
			clearTimeout(timeout);
			window.removeEventListener("focus", recheck);
			document.removeEventListener("visibilitychange", recheck);
		};
	}, [scheduledMeetings, nextReminder, fireReminder]);

	// Removes the reminded meeting and closes the reminder popup
	const dismissReminder = useCallback(() => {
		setNextReminder((current) => {
			if (current) {
				setScheduledMeetings((prev) =>
					prev.filter((meeting) => meeting.serial !== current.serial),
				);
			}
			return null;
		});
	}, [setScheduledMeetings]);

	//
	const values = useMemo(()=>({
		nextReminder,
		isReminderPopupOpen: nextReminder !== null,
		dismissReminder,
	}),[nextReminder, dismissReminder])

	return(
		<ReminderProviderContext.Provider value={values}>
			{/*  */}
			{children}
		</ReminderProviderContext.Provider>
	)
}

//
export function UseReminder(){
	const context = useContext(ReminderProviderContext);
	if (!context) {
		throw new Error("UseReminder must be used inside <ReminderProvider>");
	}
	return context;
};