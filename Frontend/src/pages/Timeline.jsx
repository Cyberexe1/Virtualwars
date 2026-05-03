import { useRef, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AlertModal from '../components/AlertModal';

const PHASES = [
  {
    label: 'Voter Registration',
    color: 'bg-primary',
    textColor: 'text-primary',
    borderColor: 'border-primary',
    events: [
      { date: 'JAN 1, 2024', title: 'Voter Roll Revision Begins', desc: 'Annual summary revision of electoral rolls starts. New voters can apply via Form 6.', urgent: false },
      { date: 'JAN 31, 2024', title: 'Final Publication of Rolls', desc: 'Revised electoral rolls published. Last date to raise objections.', urgent: true },
    ],
  },
  {
    label: 'Election Announcement',
    color: 'bg-secondary',
    textColor: 'text-secondary',
    borderColor: 'border-secondary',
    events: [
      { date: 'MAR 16, 2024', title: 'Model Code of Conduct', desc: 'ECI announces election schedule. MCC comes into immediate effect.', urgent: false },
      { date: 'MAR 20 - APR 2', title: 'Nomination Filing', desc: 'Candidates file nomination papers with Returning Officers.', urgent: false },
    ],
  },
  {
    label: 'Polling & Results',
    color: 'bg-tertiary',
    textColor: 'text-tertiary',
    borderColor: 'border-tertiary',
    events: [
      { date: 'APR 19 - JUN 1', title: 'Polling Phases (1–7)', desc: 'Lok Sabha 2024 held in 7 phases across all states and UTs.', urgent: false },
      { date: 'JUN 4, 2024', title: 'Counting & Results', desc: 'Votes counted. Results declared. New government formation begins.', urgent: false },
    ],
  },
];

const TIMELINE_NODES = [
  { date: 'Jan 1', title: 'Roll Revision', type: 'circle', color: 'bg-secondary', tooltip: 'Annual electoral roll revision begins. Apply via Form 6 at voters.eci.gov.in' },
  { date: 'Jan 31', title: 'Roll Published', type: 'circle', color: 'bg-error', tooltip: 'Final electoral rolls published. Last date to raise objections.', urgent: true },
  { date: 'Mar 16', title: 'MCC Begins', type: 'circle', color: 'bg-primary', tooltip: 'Model Code of Conduct comes into effect. Election schedule announced by ECI.' },
  { date: 'Mar 20 – Apr 2', title: 'Nominations', type: 'pill', color: 'bg-secondary', tooltip: 'Candidates file nomination papers with Returning Officers.' },
  { date: 'Apr 19 – Jun 1', title: 'Polling (7 Phases)', type: 'pill', color: 'bg-primary', tooltip: 'Lok Sabha 2024 polling across 7 phases. Polls open 7 AM – 6 PM.' },
  { date: 'Jun 4', title: 'Results Day', type: 'square', color: 'bg-primary', tooltip: 'Vote counting begins at 8 AM. Results declared by evening.' },
];

export default function Timeline() {
  const timelineRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleDownload = async () => {
    if (!timelineRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: '#f8f9fa',
        scale: 2,           // 2x resolution for crisp image
        useCORS: true,
        logging: false,
        windowWidth: 1200,
      });
      // Trigger download
      const link = document.createElement('a');
      link.download = 'india-election-timeline-2024.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Could not generate image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="space-y-10" ref={timelineRef}>

        {/* Header */}
        <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="font-['Public_Sans'] text-[12px] font-bold tracking-widest uppercase text-primary mb-2 block">
              2024 LOK SABHA ELECTION CYCLE — INDIA
            </span>
            <h1 className="font-['Public_Sans'] text-[40px] font-bold text-on-surface mb-4">Election Roadmap</h1>
            <p className="font-['Lexend'] text-[18px] text-on-surface-variant">
              Track critical deadlines, registration windows, and voting phases for India's General Elections. Stay informed through every step of the democratic process.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary-fixed duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Download Timeline
                </>
              )}
            </button>
            <button
              onClick={() => setShowAlertModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:opacity-90 duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              Get Alerts
            </button>
          </div>
        </section>

        {/* Alert banner */}
        <div className="mb-12 p-4 bg-[#FFF9E6] border-l-4 border-amber-500 flex items-start gap-4 rounded-r-lg" role="alert">
          <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
          <div>
            <p className="font-semibold text-amber-900">Voter Roll Revision Active</p>
            <p className="text-amber-800 text-sm">
              The annual summary revision of electoral rolls is ongoing. Ensure your name is on the roll at <strong>voters.eci.gov.in</strong> or call Voter Helpline <strong>1950</strong>.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-6 p-6 bg-white border border-[#DEE2E6] rounded-xl">
          <div className="flex flex-wrap gap-6">
            {[
              { color: 'bg-primary', label: 'Registration' },
              { color: 'bg-secondary', label: 'Voting Periods' },
              { color: 'bg-error', label: 'Deadlines' },
              { color: 'bg-gray-400', label: 'Milestones' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${color}`}></span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive timeline visualizer — keyboard navigable */}
        <div
          className="relative mb-16 overflow-x-auto pb-12"
          style={{ scrollbarWidth: 'none' }}
          role="region"
          aria-label="Interactive election timeline. Use left and right arrow keys to scroll."
          tabIndex={0}
          onKeyDown={(e) => {
            const el = e.currentTarget;
            if (e.key === 'ArrowRight') { e.preventDefault(); el.scrollLeft += 160; }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); el.scrollLeft -= 160; }
            if (e.key === 'Home')       { e.preventDefault(); el.scrollLeft = 0; }
            if (e.key === 'End')        { e.preventDefault(); el.scrollLeft = el.scrollWidth; }
          }}
        >
          <p className="sr-only">
            Use left and right arrow keys to navigate the timeline. Press Home to go to the start, End to go to the end.
          </p>
          <div className="min-w-[900px] py-20 relative">
            {/* Base dashed line */}
            <div
              className="absolute top-[50%] left-0 w-full h-[2px] translate-y-[-50%]"
              style={{ backgroundImage: 'linear-gradient(to right, #DEE2E6 50%, transparent 50%)', backgroundSize: '10px 1px', backgroundRepeat: 'repeat-x' }}
              aria-hidden="true"
            ></div>
            {/* TODAY marker */}
            <div
              className="absolute left-[30%] top-0 bottom-0 w-[2px] bg-primary z-10 flex flex-col items-center"
              aria-hidden="true"
            >
              <div className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">TODAY</div>
            </div>
            {/* Nodes — each is a focusable button */}
            <div className="flex justify-between relative px-10" role="list">
              {TIMELINE_NODES.map(({ date, title, type, color, tooltip, urgent }) => (
                <div
                  key={title}
                  className="relative flex flex-col items-center w-36 group"
                  role="listitem"
                >
                  <div className="mb-4 text-center">
                    <span className={`block text-xs font-bold uppercase ${urgent ? 'text-error' : 'text-on-surface-variant'}`}>
                      {urgent && <span className="sr-only">Urgent deadline: </span>}
                      {date}
                    </span>
                    <h4 className="text-sm font-bold text-on-surface">{title}</h4>
                  </div>
                  {/* Focusable node button */}
                  <button
                    className={`focus-visible:outline-2 focus-visible:outline-[#004492] focus-visible:outline-offset-4 rounded-full ${urgent ? 'ring-4 ring-error/20' : ''}`}
                    aria-label={`${title} — ${date}. ${tooltip}`}
                    aria-describedby={`tooltip-${title.replace(/\s+/g, '-')}`}
                  >
                    {type === 'circle' && (
                      <div className={`w-6 h-6 rounded-full border-4 border-white ${color} shadow-md z-20 transition-transform group-hover:scale-125`}></div>
                    )}
                    {type === 'pill' && (
                      <div className={`w-14 h-4 rounded-full ${color} shadow-sm z-20 transition-all group-hover:w-16`}></div>
                    )}
                    {type === 'square' && (
                      <div className={`w-10 h-10 rounded-xl border-4 border-white ${color} shadow-md z-20 flex items-center justify-center transition-transform group-hover:rotate-12`}>
                        <span className="material-symbols-outlined text-white text-[20px]" aria-hidden="true">how_to_vote</span>
                      </div>
                    )}
                  </button>
                  {/* Tooltip — visible on hover/focus */}
                  <div
                    id={`tooltip-${title.replace(/\s+/g, '-')}`}
                    role="tooltip"
                    className="mt-4 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute top-24 w-56 p-4 bg-white border border-outline-variant shadow-lg rounded-xl z-30 pointer-events-none"
                  >
                    <p className="text-xs text-on-surface-variant">{tooltip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PHASES.map(({ label, color, textColor, borderColor, events }) => (
            <div key={label} className="bg-white border border-[#DEE2E6] rounded-xl overflow-hidden shadow-sm">
              <div className={`p-4 ${color} text-white`}>
                <h3 className="font-['Public_Sans'] text-[18px] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    {label === 'Voter Registration' ? 'person_add' : label === 'Election Announcement' ? 'campaign' : 'flag'}
                  </span>
                  {label}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {events.map(({ date, title, desc, urgent }) => (
                  <div key={title} className={`flex gap-4 border-l-2 ${urgent ? 'border-error' : borderColor} pl-4`}>
                    <div className="flex-shrink-0 pt-1">
                      <div className={`w-3 h-3 rounded-full ${urgent ? 'bg-error' : color}`}></div>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${urgent ? 'text-error' : textColor}`}>{date}</p>
                      <h4 className="font-bold text-sm">{title}</h4>
                      <p className="text-sm text-on-surface-variant">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Info cards */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 bg-white border border-[#DEE2E6] border-l-4 border-l-primary rounded-lg shadow-sm">
            <h4 className="font-['Public_Sans'] text-[24px] font-semibold mb-4">How to use this timeline</h4>
            <p className="text-on-surface-variant mb-4">
              Hover over the timeline nodes to see expanded details. The "Today" marker tracks the current date against the election cycle. All dates follow the Election Commission of India's official schedule.
            </p>
            <p className="text-sm font-medium text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Source: Election Commission of India — eci.gov.in
            </p>
          </div>
          <div className="p-8 bg-white border border-[#DEE2E6] border-l-4 border-l-secondary rounded-lg shadow-sm">
            <h4 className="font-['Public_Sans'] text-[24px] font-semibold mb-4">Language Options</h4>
            <p className="text-on-surface-variant mb-6">
              Civic Clarity provides election information in India's major languages. Select your preferred language from the footer.
            </p>
            <div className="flex flex-wrap gap-2">
              {['हिन्दी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'मराठी', 'ਪੰਜਾਬੀ', 'More...'].map((lang) => (
                <span key={lang} className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold">{lang}</span>
              ))}
            </div>
          </div>
        </section>
      </div>
      {showAlertModal && <AlertModal onClose={() => setShowAlertModal(false)} />}
    </DashboardLayout>
  );
}
