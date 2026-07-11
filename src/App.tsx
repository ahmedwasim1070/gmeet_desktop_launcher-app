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
	const { isPremiumPopupOpen, closePremiumPopup, purchase } = UsePremium();
	// Clipboard state
	const { clipboardMeetingUrl, dismissClipboardMeeting } = UseClipboard();

	return (
		<section id="App" className="space-y-4 mt-10 p-4">

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

			{/* Upcoming Meetings */}
			<UpcomingMeetingsSection
				onScheduleNew={() => setIsSchedulePopupOpen(true)}
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