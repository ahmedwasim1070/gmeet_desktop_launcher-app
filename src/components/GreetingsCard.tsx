// Imports
import { useState, useEffect } from "react";
import { Edit } from "lucide-react";

// Interface
interface GreetingsCardProps {
  formattedDate: string;
}

//
export const GreetingsCard = ({ formattedDate }: GreetingsCardProps) => {
  // States
  // User Name
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("userName") || "User";
  });
  // Is Edit Bar
  const [isEditName, setIsEditName] = useState<boolean>(false);

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
        {isEditName ? (
          <input
            onChange={(e) => setUserName(e.target.value)}
            onBlur={() => setIsEditName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setIsEditName(false);
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
                setIsEditName(true);
              }}
            >
              <Edit className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        )}
      </div>

      {/*  */}
      <p className="text-sm text-text-muted">{formattedDate}</p>
    </div>
  );
};
