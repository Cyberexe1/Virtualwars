

export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-[#F8F9FA] border-t border-[#DEE2E6]">
      <div className="max-w-[1400px] mx-auto py-4 px-4 md:px-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold text-gray-900 font-['Public_Sans']">Civic Clarity</span>
          <p className="font-['Public_Sans'] text-xs text-gray-500 max-w-sm">
            © 2024 Civic Clarity India Election Initiative. Official Non-Partisan Resource.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a href="#" className="font-['Public_Sans'] text-xs text-gray-500 hover:underline decoration-2 underline-offset-4">Accessibility</a>
          <a href="#" className="font-['Public_Sans'] text-xs text-gray-500 hover:underline decoration-2 underline-offset-4">Privacy Policy</a>
          <a href="#" className="font-['Public_Sans'] text-xs text-gray-500 hover:underline decoration-2 underline-offset-4">Contact Support</a>
        </div>
        <div className="flex items-center gap-2 border-l border-outline-variant pl-4 hidden md:flex">
          <span className="material-symbols-outlined text-primary text-[18px]">language</span>
          <select className="bg-transparent border-none font-['Public_Sans'] text-xs text-[#004492] focus:ring-0 cursor-pointer" aria-label="Select language">
            <option>English (EN)</option>
            <option>हिन्दी (HI)</option>
            <option>தமிழ் (TA)</option>
            <option>తెలుగు (TE)</option>
          </select>
        </div>
      </div>
    </footer>
  );
}
