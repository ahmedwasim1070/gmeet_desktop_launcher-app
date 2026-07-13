// Imports
// Providers
import AppProvider, { UseApp } from "./providers/AppProvider";
import { TimeProvider } from "./providers/TimeProvider";
import ReminderProvider, { UseReminder } from "./providers/ReminderProvider";
import PremiumProvider, { UsePremium } from "./providers/PremiumProvider";
import ClipboardProvider, { UseClipboard } from "./providers/ClipboardProvider";
// Components
import { PrimaryBox } from "./components/ui/PrimaryBox";
import { GreetingsCard } from "./components/home/GreetingsCard";
import { CreateMeetingCard } from "./components/home/CreateMeetingCard";
import { JoinMeetingCard } from "./components/home/JoinMeetingCard";
import { UpcomingMeetingsSection } from "./components/schedule/UpcomingMeetingsSection";
import { ScheduleMeetingPopup } from "./components/schedule/ScheduleMeetingPopup";
import { MeetingReminderPopup } from "./components/schedule/MeetingReminderPopup";
import { ClipboardMeetingPopup } from "./components/clipboard/ClipboardMeetingPopup";
import { PremiumPlansPopup } from "./components/premium/PremiumPlansPopup";
import { BackgroundsSection } from "./components/backgrounds/BackgroundsSection";
import { Header } from "./components/layout/Header";
import { SettingsPopup } from "./components/settings/SettingsPopup";

//
function AppContent() {
	// App state
	const {
		isSettingsOpen,
		setIsSettingsOpen,
		isSchedulePopupOpen,
		setIsSchedulePopupOpen,
	} = UseApp();
	// Reminder state
	const { nextReminder, isReminderPopupOpen, dismissReminder } = UseReminder();
	// Premium state
	const { isPremium, isPremiumPopupOpen, openPremiumPopup, closePremiumPopup, purchase } = UsePremium();
	// Clipboard state
	const { clipboardMeetingUrl, dismissClipboardMeeting } = UseClipboard();

	return (
		/* Designated scroll region — fills the window below the fixed TitleBar
		   (h-8); scrolls with wheel/drag/keys but the bar itself stays hidden */
		<section id="App" className="h-[calc(100vh-2rem)] mt-8 overflow-y-auto scrollbar-hidden space-y-4 p-4">

			{/* Popups */}
			{/* Meeting Reminder */}
			{isReminderPopupOpen && nextReminder && (
				<MeetingReminderPopup meeting={nextReminder} onClose={dismissReminder} />
			)}

			{/* Schedule Meeting */}
			{isSchedulePopupOpen && (
				<ScheduleMeetingPopup
					onClose={() => setIsSchedulePopupOpen(false)}
				/>
			)}

			{/* Settings Popup */}
			{isSettingsOpen && (
				<SettingsPopup onClose={() => setIsSettingsOpen(false)} />
			)}

			{/* Clipboard Meeting */}
			{clipboardMeetingUrl && (
				<ClipboardMeetingPopup
					meetingUrl={clipboardMeetingUrl}
					onClose={dismissClipboardMeeting}
				/>
			)}

			{/* Premium Plans */}
			{isPremiumPopupOpen && (
				<PremiumPlansPopup onClose={closePremiumPopup} onPurchase={purchase} />
			)}

			{/* Header */}
			<Header  />

			{/* Greetings */}
			<PrimaryBox Child={<GreetingsCard  />} />

			{/* Create / Join */}
			<div className="flex flex-row gap-x-4">
				<PrimaryBox Child={<CreateMeetingCard />} className="flex-1" />
				<PrimaryBox Child={<JoinMeetingCard />} className="flex-1" />
			</div>

			{/* Upcoming Meetings — scheduling is a premium feature */}
			<UpcomingMeetingsSection
				onScheduleNew={() =>
					isPremium ? setIsSchedulePopupOpen(true) : openPremiumPopup()
				}
			/>

			{/* Backgrounds */}
			<BackgroundsSection />
		</section>
	);
}

//
function App() {
	return (
		<AppProvider>
			<PremiumProvider>
				<ClipboardProvider>
					<TimeProvider>
						<ReminderProvider>
							<AppContent />
						</ReminderProvider>
					</TimeProvider>
				</ClipboardProvider>
			</PremiumProvider>
		</AppProvider>
	);
}
export default App;