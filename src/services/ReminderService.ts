// Imports
import { sendNotification } from "@tauri-apps/plugin-notification";
import type { ScheduledMeeting } from "../types";

//
export const MAX_TIMEOUT_MS = 2_147_483_647;

//
export const ReminderService = {
    // Get's the Nex tMeeting 
	getNextMeeting(meetings: ScheduledMeeting[]): ScheduledMeeting | null {
		const upcoming = meetings.filter((meeting) => meeting.date > Date.now());
		if (upcoming.length === 0) return null;
		return upcoming.reduce((a, b) => (a.date <= b.date ? a : b));
	},

    // Fetch meeting time - ms
	msUntil(meeting: ScheduledMeeting): number {
		return Math.min(Math.max(0, meeting.date - Date.now()), MAX_TIMEOUT_MS);
	},

    // Fetch Due Meetings
	isDue(meeting: ScheduledMeeting): boolean {
		return meeting.date <= Date.now();
	},

    // System notification
	notify(meeting: ScheduledMeeting): void {
		sendNotification({
			title: "Meeting Reminder",
			body: `${meeting.name}`,
		});
	},
} as const;