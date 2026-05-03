import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => navigate(user ? '/dashboard' : '/signup');

  return (
    <div className="w-full min-h-screen bg-background text-on-surface font-body-md flex flex-col">
      <NavBar />
      <main className="flex-grow">

        {/* Hero */}
        <section className="relative bg-white border-b border-outline-variant overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed font-['Public_Sans'] text-[11px] font-bold tracking-widest uppercase mb-6 rounded-sm">
                Official Non-Partisan Resource — India
              </span>
              <h1 className="font-['Public_Sans'] text-[40px] font-bold leading-tight tracking-tight text-primary mb-6">
                Empowering Your Voice Through Education
              </h1>
              <p className="font-['Lexend'] text-[18px] text-on-surface-variant mb-8 max-w-lg leading-relaxed">
                Navigate India's election process with confidence. Our AI-driven assistant provides personalized, factual guidance for every step of your civic journey — from voter registration to results certification.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="bg-primary text-white h-[48px] px-8 font-semibold rounded-lg hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Get Started
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <Link
                  to="/timeline"
                  className="border-2 border-primary text-primary h-[48px] px-8 font-semibold rounded-lg hover:bg-primary-fixed/20 transition-all flex items-center justify-center"
                >
                  View Election Timeline
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-surface-container-high rounded-full absolute -top-12 -right-12 w-full max-w-[500px] z-0 opacity-50"></div>
              <img
                alt="Citizens participating in India's democratic process"
                className="relative z-10 w-full h-auto rounded-xl shadow-2xl border-4 border-white"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCynNMKTsWpd1xTokHP2fn-yL6Hn2Zhf4WxSUCfJK7D8VeYEeHWcJpeE_K_d__pBTSn98_Czu_MBVm2lF8GJbaB641Ie8Tl9a-koWAPSXZU4nqstaZsn4mIWw5dRwAGvnUTndO_bPr0fW99_1QfYLNNSQhmvBpMrpMczSL3HJ9UcSksCBSJ2b5YTWG94ncWrBaH-r58qkN9dA3-Ni8FWctTMrQBii81LZTQd2TvlGZgR-4Aan0VSMpLjdrljP6hOUetpwqUMwdW-A"
                fetchpriority="high"
              />
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-surface-container-low py-16 border-b border-outline-variant">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { value: '100%', label: 'Non-Partisan Data' },
                { value: '28+', label: 'States & UTs Covered' },
                { value: '24/7', label: 'Educational Access' },
              ].map(({ value, label }, i) => (
                <div key={label} className={`p-6 ${i === 1 ? 'border-x border-outline-variant' : ''}`}>
                  <div className="font-['Public_Sans'] text-[32px] font-semibold text-primary mb-2">{value}</div>
                  <p className="font-['Public_Sans'] text-[12px] font-bold tracking-widest uppercase text-on-surface-variant">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature bento */}
        <section className="py-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="mb-16 max-w-2xl">
              <h2 className="font-['Public_Sans'] text-[32px] font-semibold text-primary mb-4">Precision Tools for Modern Voters</h2>
              <p className="font-['Lexend'] text-[16px] text-on-surface-variant">
                We've broken down the barriers to election information using state-of-the-art technology focused on clarity and accessibility.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* AI card */}
              <div className="md:col-span-7 bg-surface-container-lowest p-8 border-l-4 border-primary shadow-sm hover:shadow-md transition-all rounded-r-lg">
                <span className="material-symbols-outlined text-primary text-4xl mb-4 block">smart_toy</span>
                <h3 className="font-['Public_Sans'] text-[24px] font-semibold mb-3">Conversational AI</h3>
                <p className="font-['Lexend'] text-[16px] text-on-surface-variant mb-6">
                  Ask questions about voter registration, polling booths, or EVM procedures and get instant, simplified explanations grounded in ECI guidelines.
                </p>
                <Link to="/chat" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                  Try the Assistant <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
              {/* Progress card */}
              <div className="md:col-span-5 bg-surface-container-lowest p-8 border-l-4 border-secondary shadow-sm hover:shadow-md transition-all rounded-r-lg">
                <span className="material-symbols-outlined text-secondary text-4xl mb-4 block">auto_graph</span>
                <h3 className="font-['Public_Sans'] text-[24px] font-semibold mb-3">Learning Progress</h3>
                <p className="font-['Lexend'] text-[16px] text-on-surface-variant mb-6">
                  Track your mastery of civic topics. Our dashboard shows what you've learned and what steps remain before you're ready to vote.
                </p>
                <div className="space-y-2">
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-3/4 rounded-full"></div>
                  </div>
                  <div className="flex justify-between font-['Public_Sans'] text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    <span>Voter Readiness</span><span>75% Complete</span>
                  </div>
                </div>
              </div>
              {/* Timeline card */}
              <div className="md:col-span-12 bg-surface-container-lowest p-8 border-l-4 border-primary shadow-sm hover:shadow-md transition-all rounded-r-lg">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="material-symbols-outlined text-primary text-4xl mb-4 block">timeline</span>
                    <h3 className="font-['Public_Sans'] text-[24px] font-semibold mb-3">Visual Election Timeline</h3>
                    <p className="font-['Lexend'] text-[16px] text-on-surface-variant mb-4">
                      Never miss a deadline. Our interactive roadmap covers India's full election cycle — from Model Code of Conduct to results certification.
                    </p>
                    <ul className="space-y-3">
                      {['Voter Registration Windows', 'Nomination & Scrutiny Dates', 'Polling Day Schedule', 'Result Counting & Certification'].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span className="font-['Lexend'] text-[16px]">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/timeline" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                      View Full Timeline <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                  <img
                    alt="Election calendar planning"
                    className="w-full h-64 object-cover rounded-lg"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVETkW8UEuQL-pEbwKt8IJwQScZIkXunu8CedgsiZ0nS2GlQOIm_xeMqniLy6-P1UMvHwbmh53SjFVOx3injhiYT-4nus3R8HtPVIrVSSZM-6o1FfUjtIE3VklKvd4HQXskztUD0pydrC_YKgNYDKo0Kjp19ehYhGnVe-gzibCaXT5K4gOru227sRNrFWB9WbI5d4mlmzVs8Qr8BgFMXNS4Wqwwt1KaPKgTjjsys49NcLFdA1-TxYeKtvLpEh6IzFj_fh1BKX4Gw"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center">
            <h2 className="font-['Public_Sans'] text-[32px] font-semibold mb-6">Ready to lead with knowledge?</h2>
            <p className="font-['Lexend'] text-[18px] text-on-primary-container mb-10 max-w-2xl mx-auto">
              Join thousands of Indian citizens using Civic Clarity to navigate their local and national elections with ease.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="bg-white text-primary px-10 h-[56px] rounded-lg font-bold text-lg hover:bg-gray-50 transition-all shadow-xl"
              >
                Get Started Free
              </button>
              <Link
                to="/timeline"
                className="border-2 border-on-primary-container text-on-primary-container px-10 h-[56px] rounded-lg font-bold text-lg hover:bg-primary-container transition-all flex items-center justify-center"
              >
                Explore Timeline
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
