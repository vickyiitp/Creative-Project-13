
import React, { useEffect, useState } from 'react';

interface LandingPageProps {
  onPlay: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onPlay, onPrivacy, onTerms }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll listener for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const SocialLink = ({ href, icon, label }: { href: string; icon: string; label: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-all p-2 transform hover:scale-110 hover:bg-white/5 rounded-full" aria-label={label}>
       <span className="sr-only">{label}</span>
       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d={icon}/></svg>
    </a>
  );

  const SVGIcons = {
    x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    github: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
    linkedin: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    youtube: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
  };

  const NavItem = ({ href, children, action }: { href: string; children?: React.ReactNode; action?: () => void }) => (
    <a 
      href={href} 
      onClick={(e) => {
        if (action) { e.preventDefault(); action(); }
        setIsMenuOpen(false);
      }}
      className="text-slate-300 hover:text-cyan-400 font-medium transition-colors block px-3 py-2 rounded-md text-base hover:bg-white/5 font-mono"
    >
      {children}
    </a>
  );

  return (
    <div className="relative w-full h-full font-montserrat overflow-y-auto scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/50 backdrop-blur-lg border-b border-white/5 transition-all shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex-shrink-0 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
                   <span className="font-black text-xl tracking-tighter text-white font-mono group-hover:text-cyan-400 transition-colors">
                      [VICKY<span className="text-cyan-500">IITP</span>]
                   </span>
                </div>
                {/* Desktop Menu */}
                <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-8">
                        <NavItem href="#hero">HOME</NavItem>
                        <NavItem href="#how-it-works">SYSTEM</NavItem>
                        <NavItem href="#story">MISSION</NavItem>
                        <a href="https://vickyiitp.tech" className="bg-cyan-600/90 hover:bg-cyan-500 text-white px-6 py-2 rounded-sm font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] text-sm border border-cyan-400/30">
                           PORTFOLIO_LINK
                        </a>
                    </div>
                </div>
                {/* Mobile Menu Button */}
                <div className="-mr-2 flex md:hidden">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                    >
                        <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                           {isMenuOpen ? (
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                           ) : (
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                           )}
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden bg-slate-900/95 border-b border-slate-700 transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <NavItem href="#hero">HOME</NavItem>
                <NavItem href="#how-it-works">SYSTEM</NavItem>
                <NavItem href="#story">MISSION</NavItem>
                <a href="https://vickyiitp.tech" className="block w-full text-center bg-cyan-600 px-3 py-2 rounded-md text-base font-medium text-white font-bold mt-4 font-mono">:: LINK_PORTFOLIO ::</a>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-1 rounded-full mb-8 animate-fade-in-up shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <span className="text-cyan-300 font-bold tracking-[0.2em] text-xs uppercase font-mono">System Ready // Project 100</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl animate-fade-in-up flex flex-col md:block" style={{animationDelay: '0.1s'}}>
          <span className="opacity-80 stroke-text">POLY</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 relative inline-block">
             BRIDGE
             <span className="absolute -top-4 -right-4 text-xs font-mono text-cyan-500 opacity-50 hidden md:block">v1.0</span>
          </span>
          <span className="block text-2xl md:text-4xl text-cyan-200 font-mono font-normal mt-2 tracking-widest uppercase opacity-80">
            Architect_Protocol
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 font-light leading-relaxed animate-fade-in-up font-mono" style={{animationDelay: '0.2s'}}>
          <span className="text-cyan-500">&gt;</span> Initialize structural simulation.<br className="hidden md:block"/>
          <span className="text-cyan-500">&gt;</span> Design with precision. Defy gravity.
        </p>

        <button 
          onClick={onPlay}
          className="group relative px-14 py-6 bg-transparent border-2 border-cyan-500 text-cyan-100 font-bold text-xl transition-all duration-300 hover:bg-cyan-500/10 hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] transform hover:-translate-y-1 active:scale-95 animate-fade-in-up overflow-hidden"
          style={{animationDelay: '0.3s'}}
        >
          <span className="relative z-10 flex items-center gap-3 font-mono tracking-widest">
            [ INITIALIZE_SIM ]
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white group-hover:w-full group-hover:h-full transition-all duration-500 opacity-50" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white group-hover:w-full group-hover:h-full transition-all duration-500 opacity-50" />
        </button>
        
        <div className="absolute bottom-10 animate-bounce-slow text-cyan-500/50">
           <a href="#how-it-works" aria-label="Scroll down" className="hover:text-white transition-colors">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
           </a>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 px-4 bg-slate-950/50 border-t border-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-mono">SYSTEM_PROTOCOLS</h2>
            <div className="h-0.5 w-20 bg-cyan-500 mx-auto" />
            <p className="mt-4 text-slate-400 font-mono text-sm">LOADING INSTRUCTION SET...</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
                { title: "BLUEPRINT", icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z", desc: "Draft complex structures. Cost efficiency is mandatory." },
                { title: "PHYSICS", icon: "M13 10V3L4 14h7v7l9-11h-7z", desc: "Vector-based stress analysis. Red joints indicate critical failure points." },
                { title: "EXECUTE", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", desc: "Validate structural integrity with heavy payload transit." }
            ].map((card, i) => (
                <div key={i} className="group relative p-8 bg-white/5 border border-white/10 hover:border-cyan-500 transition-all hover:bg-white/10 backdrop-blur-md overflow-hidden rounded-xl">
                    {/* Hover Tech Pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(68,107,158,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
                    
                    <div className="absolute top-0 right-0 p-2 opacity-20 font-mono text-4xl font-bold group-hover:opacity-40 transition-opacity text-cyan-500">
                        0{i + 1}
                    </div>

                    <div className="w-16 h-16 bg-cyan-900/30 rounded-none flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform group-hover:text-white border border-cyan-500/30">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white font-mono tracking-wide">{card.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-4 group-hover:border-cyan-500 transition-colors">
                        {card.desc}
                    </p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section id="story" className="relative z-10 py-24 px-4 bg-slate-900/80 border-t border-white/5 backdrop-blur-md">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
               <div className="inline-block bg-cyan-900/30 px-3 py-1 mb-4 border border-cyan-500/20">
                   <span className="text-cyan-400 font-mono text-xs">CLASSIFIED // EYES ONLY</span>
               </div>
               <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white font-mono">MISSION_BRIEFING</h2>
               <p className="text-slate-300 mb-6 leading-relaxed text-lg handwritten text-cyan-100/80">
                 "They said it couldn't be done. The gap is too wide, the materials too scarce. But we aren't just builders; we are architects of the impossible."
               </p>
               <p className="text-slate-400 mb-6 leading-relaxed text-lg font-light">
                 Your objective is clear: Establish a viable transport route across Sector 7. Budget is limited. Gravity is not negotiable.
               </p>
               <button onClick={onPlay} className="text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-2 group text-lg font-mono mt-4">
                 [ ACCEPT_CONTRACT ] 
                 <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
               </button>
            </div>
            <div className="flex-1 w-full order-1 md:order-2">
              <div className="relative p-2 border-2 border-dashed border-slate-600 rounded-sm hover:border-cyan-500 transition-colors duration-500 group">
                 {/* Blueprint effect image */}
                 <div className="bg-slate-800/50 h-64 w-full relative overflow-hidden flex items-center justify-center backdrop-blur-sm">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                    <div className="w-32 h-32 border-4 border-white/50 opacity-80 rotate-45 group-hover:rotate-0 transition-transform duration-700"></div>
                    <div className="w-24 h-24 border-2 border-white/30 opacity-50 absolute rotate-12 group-hover:rotate-0 transition-transform duration-700"></div>
                    <span className="font-handwritten text-white/80 text-2xl absolute bottom-4 right-4 -rotate-12">Approved</span>
                 </div>
                 <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-500 bg-transparent"></div>
                 <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-500 bg-transparent"></div>
              </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0b1120]/95 border-t border-white/10 pt-16 pb-8 px-4 font-mono text-xs backdrop-blur-lg">
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-white tracking-tighter mb-2">VICKY<span className="text-cyan-500">IITP</span></h3>
                    <p className="text-slate-500">ENGINEERING THE WEB</p>
                </div>
                <div className="flex gap-4">
                    <SocialLink href="https://github.com/vickyiitp" icon={SVGIcons.github} label="GitHub" />
                    <SocialLink href="https://x.com/vickyiitp" icon={SVGIcons.x} label="X (Twitter)" />
                    <SocialLink href="https://linkedin.com/in/vickyiitp" icon={SVGIcons.linkedin} label="LinkedIn" />
                    <SocialLink href="https://instagram.com/vickyiitp" icon={SVGIcons.instagram} label="Instagram" />
                    <SocialLink href="https://youtube.com/@vickyiitp" icon={SVGIcons.youtube} label="YouTube" />
                </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600">
                <p>&copy; 2025 VICKY KUMAR. ALL SYSTEMS NOMINAL.</p>
                <div className="flex flex-wrap justify-center gap-6">
                    <a href="mailto:themvaplatform@gmail.com" className="hover:text-cyan-400 transition-colors">CONTACT</a>
                    <button onClick={onPrivacy} className="hover:text-cyan-400 transition-colors">PRIVACY</button>
                    <button onClick={onTerms} className="hover:text-cyan-400 transition-colors">TERMS</button>
                    <a href="https://vickyiitp.tech" className="hover:text-cyan-400 transition-colors">PORTFOLIO</a>
                </div>
            </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 bg-cyan-600/90 p-3 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50 transition-all transform hover:scale-110 hover:bg-cyan-500 focus:outline-none border border-cyan-400 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        aria-label="Back to Top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
      </button>
    </div>
  );
};

export default LandingPage;
