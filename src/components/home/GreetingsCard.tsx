// Imports
import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { useTime } from "../../providers/TimeProvider";

//
export const GreetingsCard = () => {
	// Provider
	const {formattedDate} = useTime();
	// States
	// User Name
	const [userName, setUserName] = useState<string>(() => {
		return localStorage.getItem("userName") || "User";
	});
	// Is Edit Bar
	const [isEditingName, setIsEditingName] = useState<boolean>(false);

	// Saves to local storage
	useEffect(() => {
		if (userName !== "User") {
			localStorage.setItem("userName", userName);
		}
	}, [userName]);

	return (
		<div className="space-y-2">
			<div className="flex gap-x-1 text-xl font-bold">
				<p>Hey, </p>
				<p>👋</p>

				{/* Editable Name */}
				{isEditingName ? (
					<input
						onChange={(e) => setUserName(e.target.value)}
						onBlur={() => setIsEditingName(false)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								setIsEditingName(false);
							}
						}}
						type="text"
						className="max-w-20 border-b outline-none"
						value={userName}
						placeholder="Enter name"
					/>
				) : (
					<div className="flex flex-row items-center gap-x-2 max-w-90 ">
						<p>{userName}</p>
						<button
							className="cursor-pointer"
							onClick={() => {
								setIsEditingName(true);
							}}
						>
							<Edit className="w-4 h-4 text-brand-blue" />
						</button>
					</div>
				)}
			</div>

			{/*  */}
			<p className="text-sm text-text-muted">{formattedDate}</p>
		</div>
	);
};
