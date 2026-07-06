// Imports
import { openUrl } from "@tauri-apps/plugin-opener";

// Interface
interface MeetingUrlPopProps {
    clipMeetingUrl: URL | null;
    setClipMeetingUrl: React.Dispatch<React.SetStateAction<URL | null>>;
    setIsMeetingPop: React.Dispatch<React.SetStateAction<boolean>>;
}

// 
function MeetingUrlPop({ clipMeetingUrl, setClipMeetingUrl, setIsMeetingPop }: MeetingUrlPopProps) {
    // handle close or cancel
    const handleCancel = () => {
        // 
        setIsMeetingPop(false);
        // 
        setClipMeetingUrl(null);
    }
    // handle add or join
    const handleAdd = async () => {
        try {
            if (clipMeetingUrl) {
                await openUrl(clipMeetingUrl);
            }
        } catch (err) {
            console.error("Error in handleAdd from MeetingUrlPop : ", err);
        } finally {
            setIsMeetingPop(false);
            setClipMeetingUrl(null);
        }
    }
    return (
        <section
            onClick={() => setIsMeetingPop(false)}
            className="inset-0 fixed z-40 min-w-screen h-full bg-gray-900/30 flex justify-center items-center"
        >
            {/*  */}
            <div className="bg-white shadow-sm rounded-lg w-1/4 flex flex-col items-center p-3 text-center">
                <p className="font-semibold text-lg">Add this meeting link ?</p>

                {/*  */}
                <p className="text-gray-600 my-2">{clipMeetingUrl?.toString()}</p>

                {/*  */}
                <div className="w-full flex flex-row items-stretch gap-x-2 flex-nowrap mt-2">
                    <button onClick={handleCancel} className="w-1/2 py-1 bg-gray-300 rounded-lg text-gray-800 cursor-pointer hover:bg-gray-200 active:bg-gray-400 transition-colors ">Cancel</button>
                    <button onClick={handleAdd} className="w-1/2 py-1 bg-blue-500 rounded-lg text-white cursor-pointer hover:bg-blue-400 active:bg-blue-600 transition-colors">Join</button>
                </div>
            </div>
        </section>
    )
}

export default MeetingUrlPop;