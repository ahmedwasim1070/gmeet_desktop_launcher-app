import { Timer } from "lucide-react";

function ComingSoon() {
  return (
    <section className="min-w-full p-4 space-y-5">
      {/* Main Content Box */}
      <div className="w-full bg-white rounded-lg p-8 flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
        {/* Icon Wrapper */}
        <div className="p-4 bg-blue-50 rounded-full">
          <Timer className="w-12 h-12 text-blue-400 animate-pulse" />
        </div>

        {/* Typography matching your Home component */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-800">Coming Soon</h2>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            We are currently working on backgrounds. It will be available in a
            future update!
          </p>
        </div>

        <div className="pt-4">
          <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">
            Work in progress
          </span>
        </div>
      </div>
    </section>
  );
}

export default ComingSoon;
