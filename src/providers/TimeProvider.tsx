// Import
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { TimeService } from "../services/TimeService";

// interface
interface TimeContextValue {
	currentTime: Date;
	formattedDate: string;
}

//
const TimeProviderContext = createContext<TimeContextValue | null>(null);

//
export function TimeProvider({ children }: { children: ReactNode }) {
    // States
	const [currentTime, setCurrentTime] = useState<Date>(() => TimeService.now());
	const [formattedDate, setFormattedDate] = useState<string>(() =>
		TimeService.formatDate(TimeService.now()),
	);

    //
	useEffect(() => {
		const interval = setInterval(() => {
			const now = TimeService.now();
			setCurrentTime(now);

			const nextDate = TimeService.formatDate(now);
			setFormattedDate((prev) => (prev !== nextDate ? nextDate : prev));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	//
	const values= useMemo(
		() => ({ currentTime, formattedDate }),
		[currentTime, formattedDate],
	);
	return (
		<TimeProviderContext.Provider value={values}>
			{children}
		</TimeProviderContext.Provider>
	);
}

//
export function useTime(): TimeContextValue {
	const context = useContext(TimeProviderContext);
	if (!context) {
		throw new Error("useTime must be used inside <TimeProvider>");
	}
	return context;
}