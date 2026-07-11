// Import
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from "react";
import type { ScheduledMeeting } from "../types";

// Interface
interface AppProvidedProps {
	isSettingsOpen: boolean;
	setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
	isSchedulePopupOpen: boolean;
	setIsSchedulePopupOpen: Dispatch<SetStateAction<boolean>>;
	scheduledMeetings: ScheduledMeeting[];
	setScheduledMeetings: Dispatch<SetStateAction<ScheduledMeeting[]>>;
}
interface AppProviderProps {
	children: ReactNode;
}

//
const AppProviderContext = createContext<AppProvidedProps | undefined>(undefined);

//
export default function AppProvider({children}:AppProviderProps) {
	// Settings Pop
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
	// Schedule Meeting popup visibility
	const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState<boolean>(false);
	// Scheduled Meetings (past ones are dropped on load)
	const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>(()=>{
		const stored = localStorage.getItem("scheduledMeetings");
		const meetings: ScheduledMeeting[] = stored ? JSON.parse(stored) : [];
		return meetings.filter((meeting) => meeting.date > Date.now());
	});

	// Persist scheduled meetings
	useEffect(() => {
		localStorage.setItem("scheduledMeetings", JSON.stringify(scheduledMeetings));
	}, [scheduledMeetings]);
	//

	const values = useMemo(()=>({
		isSettingsOpen,
		setIsSettingsOpen,
		isSchedulePopupOpen,
		setIsSchedulePopupOpen,
		scheduledMeetings,
		setScheduledMeetings,
	}),[isSettingsOpen, isSchedulePopupOpen, scheduledMeetings])

	return(
		<AppProviderContext.Provider value={values}>
			{/*  */}
			{children}
		</AppProviderContext.Provider>
	)
}

//
export function UseApp(){
	const context = useContext(AppProviderContext);
	if (!context) {
		throw new Error("useAppProvider must be used inside <AppProvider>");
	}
	return context;
};