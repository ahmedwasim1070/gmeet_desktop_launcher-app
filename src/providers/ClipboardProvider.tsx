// Import
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useMeetClipboardWatcher } from "../hooks/useMeetClipboardWatcher";

// Interface
interface ClipboardProvidedProps {
	clipboardMeetingUrl: URL | null;
	dismissClipboardMeeting: () => void;
}
interface ClipboardProviderProps {
	children: ReactNode;
}

//
const ClipboardProviderContext = createContext<ClipboardProvidedProps | undefined>(undefined);

//
export default function ClipboardProvider({children}:ClipboardProviderProps) {
	// Google Meet url detected on the clipboard
	const [clipboardMeetingUrl, setClipboardMeetingUrl] = useState<URL | null>(null);
	// Clipboard watcher service
	const handleMeetUrlDetected = useCallback((url: URL) => {
		setClipboardMeetingUrl(url);
	}, []);
	useMeetClipboardWatcher(handleMeetUrlDetected);

	// Clears the detected url and closes the popup
	const dismissClipboardMeeting = useCallback(() => {
		setClipboardMeetingUrl(null);
	}, []);

	//
	const values = useMemo(()=>({
		clipboardMeetingUrl,
		dismissClipboardMeeting,
	}),[clipboardMeetingUrl, dismissClipboardMeeting])

	return(
		<ClipboardProviderContext.Provider value={values}>
			{/*  */}
			{children}
		</ClipboardProviderContext.Provider>
	)
}

//
export function UseClipboard(){
	const context = useContext(ClipboardProviderContext);
	if (!context) {
		throw new Error("UseClipboard must be used inside <ClipboardProvider>");
	}
	return context;
};