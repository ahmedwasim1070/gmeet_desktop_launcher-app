// Imports
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ScheduledMeeting } from "../../types";
import { CloseButton } from "../ui/CloseButton";
import { useTime } from "../../providers/TimeProvider";
import { UseApp } from "../../providers/AppProvider";
import { Popup } from "../ui/Popup";

// Interfaces
interface ScheduleMeetingPopupProps {
	onClose: () => void;
}

// Popup with a calendar to schedule a meeting within the next 30 days
export function ScheduleMeetingPopup({onClose}:ScheduleMeetingPopupProps) {
	// Provider
	const {currentTime} = useTime();
	const { scheduledMeetings,setScheduledMeetings} = UseApp();

	// States
	const [selectedDate, setSelectedDate] = useState<Date | null>(currentTime);
	const [selectedTime, setSelectedTime] = useState("09:00");
	const [currentMonth, setCurrentMonth] = useState(currentTime.getMonth());
	const [currentYear, setCurrentYear] = useState(currentTime.getFullYear());
	const [meetingType, setMeetingType] = useState<"new" | "existing">("new");
	const [meetingUrl, setMeetingUrl] = useState("");
	const [urlError, setUrlError] = useState(false);
	const [meetingName, setMeetingName] = useState<string>("");

	// Regex patterns
	const googleMeetLinkRegex =
		/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;
	const googleMeetCodeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;

	// Get days in month
	const getDaysInMonth = (month: number, year: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	// Get first day of month (0 = Sunday, 1 = Monday, etc.)
	const getFirstDayOfMonth = (month: number, year: number) => {
		return new Date(year, month, 1).getDay();
	};

	// Check if date is within 30 days
	const isDateWithin30Days = (date: Date) => {
		const today = new Date(currentTime);
		today.setHours(0, 0, 0, 0);

		const checkDate = new Date(date);
		checkDate.setHours(0, 0, 0, 0);

		const diffTime = checkDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return diffDays >= 0 && diffDays <= 30;
	};

	// Check if date is in the past
	const isDateInPast = (date: Date) => {
		const today = new Date(currentTime);
		today.setHours(0, 0, 0, 0);

		const checkDate = new Date(date);
		checkDate.setHours(0, 0, 0, 0);

		return checkDate < today;
	};

	// Check if selected time is in the past for today's date
	const isTimeInPast = (selectedTime: string, selectedDate: Date) => {
		const today = new Date(currentTime);
		const checkDate = new Date(selectedDate);

		// Only check time if the selected date is today
		if (checkDate.toDateString() === today.toDateString()) {
			const [hours, minutes] = selectedTime.split(":").map(Number);
			const selectedDateTime = new Date(selectedDate);
			selectedDateTime.setHours(hours, minutes, 0, 0);

			return selectedDateTime <= currentTime;
		}

		return false;
	};

	// Get minimum time for today
	const getMinTimeForToday = () => {
		const today = new Date(currentTime);
		const selectedDateObj = new Date(selectedDate!);

		if (selectedDateObj.toDateString() === today.toDateString()) {
			// Add 15 minutes buffer to current time
			const minTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
			const hours = minTime.getHours().toString().padStart(2, "0");
			const minutes = minTime.getMinutes().toString().padStart(2, "0");
			return `${hours}:${minutes}`;
		}

		return "00:00";
	};

	// Navigate months
	const navigateMonth = (direction: "prev" | "next") => {
		if (direction === "prev") {
			if (currentMonth === 0) {
				setCurrentMonth(11);
				setCurrentYear(currentYear - 1);
			} else {
				setCurrentMonth(currentMonth - 1);
			}
		} else {
			if (currentMonth === 11) {
				setCurrentMonth(0);
				setCurrentYear(currentYear + 1);
			} else {
				setCurrentMonth(currentMonth + 1);
			}
		}
	};

	// Validate meeting URL/code
	useEffect(() => {
		if (meetingUrl && meetingType === "existing") {
			const isValidLink = googleMeetLinkRegex.test(meetingUrl);
			const isValidCode = googleMeetCodeRegex.test(meetingUrl);
			if (isValidCode) {
				setMeetingUrl(`https://meet.google.com/${meetingUrl}`);
			}
			setUrlError(!isValidLink && !isValidCode);
		} else {
			setUrlError(false);
		}
	}, [meetingUrl, meetingType]);

	// Update selected time if it becomes invalid when date changes
	useEffect(() => {
		if (selectedDate && isTimeInPast(selectedTime, selectedDate)) {
			const minTime = getMinTimeForToday();
			setSelectedTime(minTime);
		}
	}, [selectedDate, selectedTime, currentTime]);

	// Handle add meeting
	const handleAddMeeting = () => {
		if (!selectedDate) {
			alert("Please select a date");
			return;
		}

		if (isTimeInPast(selectedTime, selectedDate)) {
			alert("Please select a future time");
			return;
		}

		if (meetingType === "existing" && (!meetingUrl || urlError)) {
			alert("Please enter a valid Google Meet URL or code");
			return;
		}

		const meetingDateTime = new Date(selectedDate);
		const [hours, minutes] = selectedTime.split(":");
		meetingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

		const meetingData: ScheduledMeeting = {
			serial: scheduledMeetings.length + 1,
			name: meetingName ? meetingName : "meet.google.com",
			date: meetingDateTime.getTime(),
			type: meetingType,
			url:
				meetingType === "existing" ? meetingUrl : "https://meet.google.com/new",
		};

		setScheduledMeetings((prev) => {
			const updated = [...prev, meetingData];
			updated.sort((a, b) => a.date - b.date);
			return updated;
		});

		onClose();
	};

	// Render calendar days
	const renderCalendarDays = () => {
		const daysInMonth = getDaysInMonth(currentMonth, currentYear);
		const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
		const days = [];

		// Empty cells for days before the first day of the month
		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
		}

		// Days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(currentYear, currentMonth, day);
			const isWithin30Days = isDateWithin30Days(date);
			const isInPast = isDateInPast(date);
			const isSelected =
				selectedDate &&
				selectedDate.getDate() === day &&
				selectedDate.getMonth() === currentMonth &&
				selectedDate.getFullYear() === currentYear;
			const isDisabled = isInPast || !isWithin30Days;

			days.push(
				<button
					key={day}
					onClick={() => !isDisabled && setSelectedDate(date)}
					disabled={isDisabled}
					className={`w-8 h-8 text-sm rounded-md transition-colors ${
						isSelected
							? "bg-brand-blue text-white"
							: isDisabled
								? "text-text-muted/40 cursor-not-allowed"
								: "hover:bg-bg-base text-text-primary"
					}`}
				>
					{day}
				</button>,
			);
		}

		return days;
	};

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	return (
		<Popup onClose={onClose} className="gap-y-1">
				<div className="text-center mb-4">
					<h2 className="font-semibold text-lg mb-2 text-text-primary">
						Schedule Meeting
					</h2>
					<p className="text-text-muted text-sm">
						Meetings can be scheduled within the next 30 days
					</p>
				</div>

				{/* Calendar */}
				<div className="mb-4">
					<div className="flex items-center justify-between mb-3">
						<button
							onClick={() => navigateMonth("prev")}
							className="p-1 rounded-md text-text-primary hover:bg-bg-base transition-colors"
						>
							<ChevronLeft size={20} />
						</button>
						<h3 className="font-medium text-lg text-text-primary">
							{monthNames[currentMonth]} {currentYear}
						</h3>
						<button
							onClick={() => navigateMonth("next")}
							className="p-1 rounded-md text-text-primary hover:bg-bg-base transition-colors"
						>
							<ChevronRight size={20} />
						</button>
					</div>

					{/* Days of week header */}
					<div className="grid grid-cols-7 gap-1 mb-2">
						{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
							<div
								key={day}
								className="text-center text-xs font-medium text-text-muted p-1"
							>
								{day}
							</div>
						))}
					</div>

					{/* Calendar grid */}
					<div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
				</div>

				{/* Meeting name input */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-text-primary mb-2">
						Meeting Name (Optional):
					</label>
					<input
						type="text"
						value={meetingName}
						onChange={(e) => setMeetingName(e.target.value)}
						placeholder="Enter meeting name (default: meet.google.com)"
						className="w-full px-3 py-2 bg-bg-elevated border border-border/40 rounded-md placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
					/>
				</div>

				{/* Time selection */}
				{selectedDate && (
					<div className="mb-4">
						<label className="block text-sm font-medium text-text-primary mb-2">
							Select Time:
						</label>
						<input
							type="time"
							value={selectedTime}
							min={getMinTimeForToday()}
							onChange={(e) => setSelectedTime(e.target.value)}
							className={`w-full px-3 py-2 bg-bg-elevated border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
								isTimeInPast(selectedTime, selectedDate)
									? "border-red-500 bg-red-50 focus:ring-red-500"
									: "border-border/40 focus:ring-brand-blue"
							}`}
						/>
						{isTimeInPast(selectedTime, selectedDate) && (
							<p className="text-red-500 text-sm mt-1">
								Please select a future time
							</p>
						)}
					</div>
				)}

				{/* Meeting type selection */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-text-primary mb-2">
						Meeting Type:
					</label>
					<div className="flex gap-4">
						<label className="flex items-center text-text-primary">
							<input
								type="radio"
								name="meetingType"
								value="new"
								checked={meetingType === "new"}
								onChange={(e) =>
									setMeetingType(e.target.value as "new" | "existing")
								}
								className="mr-2 accent-brand-blue"
							/>
							Create New Meeting
						</label>
						<label className="flex items-center text-text-primary">
							<input
								type="radio"
								name="meetingType"
								value="existing"
								checked={meetingType === "existing"}
								onChange={(e) =>
									setMeetingType(e.target.value as "new" | "existing")
								}
								className="mr-2 accent-brand-blue"
							/>
							Add Existing URL
						</label>
					</div>
				</div>

				{/* Meeting URL input */}
				{meetingType === "existing" && (
					<div className="mb-4">
						<label className="block text-sm font-medium text-text-primary mb-2">
							Google Meet URL or Code:
						</label>
						<input
							type="text"
							value={meetingUrl}
							onChange={(e) => setMeetingUrl(e.target.value)}
							placeholder="https://meet.google.com/abc-defg-hij or abc-defg-hij"
							className={`w-full px-3 py-2 bg-bg-elevated border rounded-md placeholder:text-text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
								urlError
									? "border-red-500 bg-red-50 focus:ring-red-500"
									: "border-border/40 focus:ring-brand-blue"
							}`}
						/>
						{urlError && (
							<p className="text-red-500 text-sm mt-1">
								Please enter a valid Google Meet URL or code
							</p>
						)}
					</div>
				)}

				{/* Selected date display */}
				{selectedDate && (
					<div className="mb-4 p-3 bg-brand-blue/10 rounded-md">
						<p className="text-sm text-brand-blue">
							<span className="font-medium">Selected:</span>{" "}
							{selectedDate.toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}{" "}
							at {selectedTime}
						</p>
					</div>
				)}

				<button
					onClick={handleAddMeeting}
					className="py-2 bg-brand-blue rounded-lg text-white cursor-pointer hover:opacity-90 active:opacity-100 transition-opacity"
				>
					Add
				</button>
		</Popup>
	);
}
