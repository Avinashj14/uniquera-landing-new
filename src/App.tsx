/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Star, 
  MapPin, 
  Phone, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Camera,
  Play, 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube,
  Search,
  MessageSquare,
  MessageCircle,
  CheckCircle2,
  Download,
  ArrowRight,
  Mail
} from 'lucide-react';
import UniqueraConsultationForm from './components/UniqueraConsultationForm';
import FreeGuideModal from './components/FreeGuideModal';
import {absoluteLandingUrl, matchesThankYouPath, normalizeBasePath} from './routeUtils';
import {pushConsultationFormThankYouIfPending} from './gtmTrack';

// Assets
const LOGO_URL = "https://uniqueraclinic.com/wp-content/uploads/2024/09/Group-17.svg";
const LOGO_WHITE_URL = "https://uniqueraclinic.com/wp-content/uploads/2024/04/Group-1111.svg";
const WHATSAPP_URL = "https://wa.me/905388770199?text=Hi%20I%20want%20to%20know%20more%20about%20the%20services%20-%20I%20checked%20your%20landing%20page";

// Components
const TopBar = () => {
  const [index, setIndex] = useState(0);
  const messages = [
    "Book your flight fast",
    "Now is the time to act",
    "Achieve stunning hair results with UniquEra Hair Transplant Clinic",
    "UniquEra Clinic: Best Hair Transplant in Turkey"
  ];
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="bg-brand-cyan text-primary-bg py-1.5 px-4 text-center md:flex md:justify-between items-center text-[10px] md:text-xs font-bold tracking-wider overflow-hidden min-h-[32px]">
      <div className="flex-1 flex justify-center md:justify-start items-center relative h-5">
        <AnimatePresence mode="wait">
          <motion.a
            key={index}
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-x-0 md:relative flex justify-center md:justify-start items-center whitespace-nowrap hover:opacity-80 transition-opacity uppercase"
          >
            {messages[index]}
          </motion.a>
        </AnimatePresence>
      </div>
      <a 
        href="tel:+905388770199"
        className="hidden md:flex items-center gap-2 hover:underline decoration-primary-bg/30"
      >
        <Phone size={14} className="fill-primary-bg" /> 
        <span className="tabular-nums">+90 538 877 01 99</span>
      </a>
    </div>
  );
};


type HeaderProps = {
  /** Logo link — landing root. Defaults to /. */
  homeHref?: string;
  /** Prefix for section links (#about …). Defaults to \"\" (same-page hashes on landing). On thank-you, pass landing home URL without trailing slash. */
  navHashBase?: string;
  /** When set, overrides default scroll-to consultation for the CTA button. */
  bookNowHref?: string;
};

const Header = ({homeHref = '/', navHashBase = '', bookNowHref}: HeaderProps = {}) => {
  const hash = (id: string) => (navHashBase ? `${navHashBase.replace(/\/+$/, '')}#${id}` : `#${id}`);
  const goBookNow = () => {
    if (bookNowHref) {
      window.location.href = bookNowHref;
      return;
    }
    document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <header className="sticky top-0 z-50 bg-primary-bg/80 backdrop-blur-lg border-b border-white/5 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href={homeHref} className="inline-block shrink-0">
          <img src={LOGO_WHITE_URL} alt="UniquEra Clinic" className="h-10 md:h-12" referrerPolicy="no-referrer" />
        </a>
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <a href={hash('about')} className="hover:text-brand-cyan transition-colors">
            About Us
          </a>
          <a href={hash('transformations')} className="hover:text-brand-cyan transition-colors">
            Transformations
          </a>
          <a href={hash('doctors')} className="hover:text-brand-cyan transition-colors">
            Doctors
          </a>
          <button type="button" onClick={goBookNow} className="btn-cyan text-sm py-2.5">
            Request An Appointment
          </button>
        </div>
        <button type="button" className="lg:hidden text-white" aria-label="Menu">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

const Hero = () => (
  <section id="about" className="relative overflow-hidden">
    {/* Main Hero Banner */}
    <div className="relative w-full aspect-[2/1]">
      <img 
        src="https://uniqueraclinic.com/wp-content/uploads/2026/05/Website-banner-final-soft.webp" 
        alt="Hair Transplant Results" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  </section>
);

const TrustFeatures = () => (
  <div className="bg-accent-bg border-y border-white/5 py-8">
    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
      {[
        { title: "Conservative donor management", desc: "Protecting your future" },
        { title: "Senior medical team, 10+ years specialization", desc: "Expert care" },
        { title: "Long term Graft Planning for future density", desc: "Visionary results" },
        { title: "Personalized natural hairline design", desc: "Aesthetic precision" }
      ].map((item, idx) => (
        <div key={idx} className="text-center md:border-r border-white/10 last:border-0 px-4">
          <h3 className="text-sm md:text-base font-bold mb-1 text-brand-cyan leading-tight">{item.title}</h3>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const EducationHeader = () => (
  <section className="pt-10 md:pt-24 bg-primary-bg overflow-hidden">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-4xl mx-auto">
        <span className="text-brand-cyan font-extrabold uppercase tracking-[0.2em] text-[10px] md:text-xs mb-4 block">
          YOU COULD BE OUR NEXT TRANSFORMATION
        </span>
        <h2 className="font-bold text-white mb-6 uppercase tracking-tight" style={{ fontSize: '46px', lineHeight: '50px' }}>
          Your transformation<br />starts <span className="text-[#2dc7cc]">here</span>
        </h2>
        <h3 className="text-brand-cyan text-lg md:text-2xl font-bold mb-6 italic tracking-tight">
          Real planning. Real outcomes. No guesswork.
        </h3>
        <p className="text-gray-300 md:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-12">
          Schedule a free consultation for a graft assessment based on your hair loss, donor area, and long-term goals. Clear answers before you make any decision.
        </p>
      </div>
    </div>
  </section>
);

const Transformations = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cases = [
    { title: "CASE 1", beforeLabel: "FUE SAPPHIRE", afterLabel: "FRONTAL DENSITY", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/1-1-768x768.webp" },
    { title: "CASE 2", beforeLabel: "DHI CHOI", afterLabel: "NATURAL LINE", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/2-1-768x768.webp" },
    { title: "CASE 3", beforeLabel: "FUE SAPPHIRE", afterLabel: "FULL COVERAGE", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/3-1-768x768.webp" },
    { title: "CASE 4", beforeLabel: "MAX DENSITY", afterLabel: "4200 GRAFTS", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/4-1-768x768.webp" },
    { title: "CASE 5", beforeLabel: "FUE SAPPHIRE", afterLabel: "CROWN WORK", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/5-1-768x768.webp" },
    { title: "CASE 6", beforeLabel: "DHI CHOI", afterLabel: "PRECISE PLACEMENT", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/6-1-768x768.webp" },
    { title: "CASE 7", beforeLabel: "FUE SAPPHIRE", afterLabel: "5400 GRAFTS", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/8-1-768x768.webp" },
    { title: "CASE 8", beforeLabel: "FUE SAPPHIRE", afterLabel: "5400 GRAFTS", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/9-1-768x768.webp" },
    { title: "CASE 9", beforeLabel: "DHI CHOI", afterLabel: "3400 GRAFTS", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/11-1-768x768.webp" },
    { title: "CASE 10", beforeLabel: "SAPPHIRE FUE", afterLabel: "3500 GRAFTS", before: "https://uniqueraclinic.com/wp-content/uploads/2026/02/12-1-768x768.webp" },
  ];

  return (
    <section id="transformations" className="pt-0 pb-10 md:py-24 bg-primary-bg overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold">Real <span className="text-brand-cyan">Transformations</span></h2>
        </div>
        
        <div ref={scrollRef} className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory pb-8 scrollbar-hide no-scrollbar">
          {cases.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-[85%] md:w-[calc(33.333%-16px)] snap-center bg-accent-bg rounded-2xl overflow-hidden border border-white/5 group shadow-2xl"
            >
              <div className="relative aspect-square">
                <img src={item.before} alt="Transformation Result" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="flex flex-col gap-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-brand-cyan">
                    <span>{item.beforeLabel}</span>
                    <span className="text-white opacity-60">{item.afterLabel}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center mt-12 gap-4">
          <button 
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => window.open('https://uniqueraclinic.com/our-gallery/', '_blank')}
            className="btn-cyan flex items-center gap-2 mx-auto"
          >
            <Play size={16} fill="currentColor" /> View More
          </button>
        </div>
      </div>
    </section>
  );
};

const WhatsappSection = () => {
  const screenshots = [
    "https://uniqueraclinic.com/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-06-at-23.45.46-e1770409872204.webp",
    "https://uniqueraclinic.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-24-at-00.38.10.webp",
    "https://uniqueraclinic.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-01-at-18.00.53-1-1.jpeg"
  ];

  return (
    <section className="py-10 md:py-24 bg-accent-bg border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-16">Real <span className="text-brand-cyan italic">Patient Conversations</span></h2>
        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto items-center">
          {screenshots.map((src, idx) => (
            <div key={idx} className="relative group perspective-1000">
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.2, duration: 0.8 }}
                 viewport={{ once: true }}
                 className="relative mx-auto border-[12px] border-gray-900 rounded-[3rem] h-[640px] w-[310px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-gray-900 overflow-hidden transform-gpu transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-4"
               >
                  {/* Speaker/Sensors Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-30 flex items-center justify-center">
                    <div className="w-10 h-1 bg-gray-800 rounded-full"></div>
                  </div>
                  
                  {/* Screen Content */}
                  <div className="h-full w-full bg-white overflow-y-auto no-scrollbar rounded-[2.2rem] relative">
                    <img 
                      src={src} 
                      alt="WhatsApp Conversation" 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>

                  {/* Surface Reflection */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-transparent z-20"></div>
               </motion.div>
               
               {/* Decorative shadow reflect */}
               <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/5 h-4 bg-brand-cyan/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    {
      text: "Almost a year ago, I had my hair transplant at UniquEra Hair Transplant Clinic in Istanbul, and I'm beyond impressed with the results! The entire experience was top-notch from start to finish. The team was professional, warm, and incredibly thorough, explaining every detail of the process so I felt at ease. I had 4,500 grafts done, and despite the scale of the procedure, it was surprisingly comfortable once the numbing kicked in. The clinic's modern facilities and the surgeons' expertise really shone through. They even followed up with me during my stay, offering personalized care and some great recommendations for exploring Istanbul. Now, nearly a year later, my hair looks full, natural, and better than I ever imagined. UniquEra's dedication to their patients is unmatched!",
      name: "Delvis Gomez",
      country: "United States",
      initials: "DG",
    },
    {
      text: "My wife and I were both treated like first class VIP visitors when we went to Istanbul for my hair replacement therapy.",
      name: "Edward Rickers",
      country: "United States",
      initials: "ER",
    },
    {
      text: "I am from the states and wanted to make my hair restoration journey exciting and unique (also more affordable). Since my procedure in Jan 2024 the company has transitioned into UniqueEra. The most important thing is the medical team is the same! The patience, kindness, warmth and professionalism I received as a patient made my experience worthwhile. I have almost completed a year of healing, and my results are truly greater than what I expected. I am impressed with the teams ability to restore my hairline, thickness on the top/sides/and front of my scalp. I am excited for the rebranding of the company and trust they will be fine after getting to know them on an individual basis. I have no regrets going to Turkey for my procedure, only amazing results! I trust this team with my friends and family any day.",
      name: "Jordan Cook",
      country: "United States",
      initials: "JC",
    },
  ];
  const [activeReview, setActiveReview] = useState(0);
  const currentReview = reviews[activeReview];

  const onPrevReview = () => {
    setActiveReview((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const onNextReview = () => {
    setActiveReview((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section id="testimonials" className="py-10 md:py-24 bg-primary-bg">
      <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-12 items-center">
        <div className="lg:col-span-1 space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Trusted <span className="text-brand-cyan italic">Worldwide</span></h2>
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-5 mb-2 brightness-200" referrerPolicy="no-referrer" />
                <div className="text-3xl font-bold">200+</div>
                <div className="text-[10px] uppercase font-bold text-gray-500">Google Reviews</div>
              </div>
              <div className="flex gap-0.5 text-yellow-500">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <div className="h-5 mb-2 text-[#00B67A] text-sm font-bold tracking-wide">Trustpilot</div>
                <div className="text-3xl font-bold">4.9</div>
                <div className="text-[10px] uppercase font-bold text-gray-500">Trustpilot Rating</div>
              </div>
              <div className="flex gap-0.5 text-green-500">
                {[1,2,3,4,5].map(i => <Star key={`tp-${i}`} size={14} fill="currentColor" />)}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 relative">
          <div className="bg-accent-bg p-8 md:p-12 rounded-4xl relative overflow-hidden">
            <div className="text-6xl text-brand-cyan/20 absolute top-4 left-4 font-serif">"</div>
            <p className="text-[17px] text-gray-300 leading-[23.5px] relative z-10 italic">
              "{currentReview.text}"
            </p>
            <div className="mt-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-cyan/20 flex items-center justify-center font-bold text-xl border border-brand-cyan/40">{currentReview.initials}</div>
              <div>
                <div className="font-bold text-lg">{currentReview.name}</div>
                <div className="text-gray-500 text-sm">{currentReview.country}</div>
              </div>
              <div className="ml-auto flex gap-4">
                <button onClick={onPrevReview} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><ChevronLeft size={20}/></button>
                <button onClick={onNextReview} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><ChevronRight size={20}/></button>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => window.open('https://uniqueraclinic.com/testimonials/', '_blank')}
              className="btn-cyan flex items-center gap-2"
            >
              <MessageSquare size={18} /> View Testimonials
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const MedicalGuideSection = () => {
  const items = [
    "Temporary hair loss vs genetic hair loss",
    "DHT and follicle miniaturization explained simply",
    "Blood tests that may reveal hidden deficiencies",
    "The truth about oils, shampoos, fibers, microneedling, and red light therapy",
    "Clear explanation of medications, PRP, stem cell-based therapies, and exosomes",
    "When surgery becomes the only reliable option"
  ];

  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  return (
    <section className="py-10 md:py-24 bg-accent-bg">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-primary-bg rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Download the Complete <span className="text-brand-cyan">Medical Guide</span> to Fixing Hair Loss
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Hair loss is not solved by guessing. This guide explains what really causes hair loss, what treatments can and cannot do, and when a hair transplant becomes the most predictable solution. Read it before choosing your next step.
            </p>
            <div className="bg-brand-cyan/5 border border-brand-cyan/10 p-6 rounded-2xl">
              <p className="text-brand-cyan font-bold italic text-sm mb-4">Guide - A Guide to fixing hair loss</p>
              <button 
                type="button"
                onClick={() => setIsGuideModalOpen(true)}
                className="btn-cyan w-full flex items-center justify-center gap-2"
              >
                <Download size={18} /> Download the Free Guide
              </button>
            </div>
          </div>
          <div className="md:w-1/2 p-8 md:p-12 bg-white/5">
            <h3 className="text-xl font-bold mb-6 uppercase tracking-widest text-brand-cyan">What’s inside:</h3>
            <ul className="space-y-4">
              {items.map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <div className="mt-1 w-2 h-2 rounded-full bg-brand-cyan shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <FreeGuideModal open={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />
    </section>
  );
};

const scrollToConsultationForm = () => {
  document.getElementById('consultation-form')?.scrollIntoView({behavior: 'smooth'});
};

/** Simple flat CTA (upper style) — used in both places on the page. */
const ConsultationSlotsCtaSection = () => (
  <section className="py-10 md:py-24 bg-[#043a40] border-y border-white/5">
    <div className="container mx-auto px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-8 italic text-white">
          Consultation Slots Are <span className="text-brand-cyan">Limited This Month</span>
        </h2>
        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
          You’ve seen real patient results, WhatsApp conversations, and reviews. Now let UniquEra’s team review your hair loss stage, donor area, and goals before you decide your next step.
        </p>
        <button
          type="button"
          onClick={scrollToConsultationForm}
          className="btn-cyan px-10 py-5 text-lg font-bold shadow-[0_20px_40px_-10px_rgba(45,199,204,0.3)] hover:translate-y-[-4px] transition-all"
        >
          Secure My Free Consultation
        </button>
      </div>
    </div>
  </section>
);

const MedicalTeam = () => {
  const doctors = [
    { name: "Atakan Akay", role: "Medical Team Director", img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/Stafff.jpg" },
    { name: "Ayşe Fedakartürk", role: "Senior Sapphire DHI Specialist", img: "https://uniqueraclinic.com/wp-content/uploads/2024/04/2.jpg" },
    { name: "Emir Doğan", role: "DHI & FUE Sapphire Hair Transplant Specialist", img: "https://uniqueraclinic.com/wp-content/uploads/2024/11/Stafff-2-min.jpg" },
    { name: "Cengiz Yerlikaya", role: "Senior Sapphire DHI Specialist", img: "https://uniqueraclinic.com/wp-content/uploads/2024/11/Stafff-1-min.jpg" },
    { name: "Çagri Çelik", role: "Medical Team Director", img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/9-1.jpg" },
    { name: "Yagmur Dalioğlu", role: "Anesthesiologist", img: "https://uniqueraclinic.com/wp-content/uploads/2024/04/4.jpg" },
    { name: "Burak Morkavuk", role: "Senior Sapphire DHI Specialist", img: "https://uniqueraclinic.com/wp-content/uploads/2024/04/5.jpg" },
    { name: "Kübra Nur Töremen", role: "Senior DHI Specialist", img: "https://uniqueraclinic.com/wp-content/uploads/2024/04/3.jpg" },
  ];
  const operations = [
    { name: "Juliana Koci", role: "Head Medical Consultant & Patient Care", img: "https://uniqueraclinic.com/wp-content/uploads/2025/08/PHOTO-2025-08-20-17-08-30-e1755705661225.jpg" },
    { name: "Raffa Dabbas", role: "Medical Interpreter", img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/10-1.jpg" },
    { name: "Emad Albeni", role: "Operations Manager", img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/Stafff-2-min.jpg" },
  ];
  const [activeTeam, setActiveTeam] = useState<'doctors' | 'operations'>('doctors');
  const teamMembers = activeTeam === 'doctors' ? doctors : operations;
  const loopedTeamMembers = [...teamMembers, ...teamMembers];
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  useEffect(() => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollLeft = 0;
  }, [activeTeam]);

  useEffect(() => {
    if (isSliderPaused) return;

    const intervalId = window.setInterval(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (maxScroll <= 0) return;

      const loopPoint = Math.min(slider.scrollWidth / 2, maxScroll);
      slider.scrollLeft = slider.scrollLeft >= loopPoint ? 0 : slider.scrollLeft + 1;
    }, 20);

    return () => window.clearInterval(intervalId);
  }, [activeTeam, isSliderPaused]);

  return (
    <section id="doctors" className="py-10 md:py-24 bg-primary-bg">
      <div className="container mx-auto px-4 text-center">
        <h4 className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">Doctors</h4>
        <h2 className="text-4xl md:text-6xl font-bold mb-16">Our Expert Doctors <span className="text-brand-cyan italic">For The Patients</span></h2>

        <div className="flex justify-center gap-3 mb-10">
          <button
            type="button"
            onClick={() => setActiveTeam('doctors')}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide transition-colors ${
              activeTeam === 'doctors'
                ? 'bg-brand-cyan text-primary-bg'
                : 'bg-accent-bg text-white border border-white/10 hover:border-brand-cyan/60'
            }`}
          >
            Doctors
          </button>
          <button
            type="button"
            onClick={() => setActiveTeam('operations')}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide transition-colors ${
              activeTeam === 'operations'
                ? 'bg-brand-cyan text-primary-bg'
                : 'bg-accent-bg text-white border border-white/10 hover:border-brand-cyan/60'
            }`}
          >
            Operations
          </button>
        </div>

        <div
          ref={sliderRef}
          className="max-w-6xl mx-auto overflow-x-auto no-scrollbar pb-4"
          onMouseEnter={() => setIsSliderPaused(true)}
          onMouseLeave={() => setIsSliderPaused(false)}
        >
          <div className="flex gap-6 w-max min-w-full px-1">
            {loopedTeamMembers.map((member, idx) => (
              <motion.div
                key={`${activeTeam}-${member.name}-${idx}-loop`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className="bg-accent-bg rounded-3xl p-6 border border-white/5 text-left group w-[260px] md:w-[280px] shrink-0"
              >
                <div className="aspect-[4/5] bg-primary-bg rounded-2xl mb-6 overflow-hidden relative">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-xl font-bold text-brand-cyan mb-1 group-hover:text-white transition-colors">{member.name}</h3>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-tight">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mt-12">
          <a
            href="https://uniqueraclinic.com/our-team/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyan inline-flex items-center gap-2"
          >
            Meet our Team <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

const InstagramPost: React.FC<{ post: any }> = ({ post }) => {
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <div className="bg-white text-black rounded-lg overflow-hidden shadow-2xl flex flex-col h-full min-h-[500px]">
      <div className="p-3 flex items-center gap-2 border-b">
        <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center font-bold text-[10px]">U</div>
        <div className="text-[10px] font-bold">{post.user}</div>
        <a 
          href="https://www.instagram.com/uniquerahairtransplant/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-auto bg-brand-cyan text-white text-[10px] px-3 py-1 rounded hover:bg-[#2dc7cc] transition-colors"
        >
          View profile
        </a>
      </div>
      
      <div className="flex-1 relative bg-gray-100">
        {!showEmbed ? (
          <div className="h-full w-full cursor-pointer group" onClick={() => setShowEmbed(true)}>
             <img src={post.img} alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                <Play className="text-white fill-white opacity-80 group-hover:scale-110 transition-transform" size={48} />
             </div>
          </div>
        ) : (
          <iframe 
            src={`https://www.instagram.com/reel/${post.reelId}/embed/captioned/`}
            className="w-full h-full border-0"
            allowTransparency={true}
            allowFullScreen={true}
            scrolling="no"
          ></iframe>
        )}
      </div>

      {!showEmbed && (
        <div className="p-4 text-xs space-y-3">
          <div className="flex gap-4">
            <Star size={18} />
            <MessageSquare size={18} />
          </div>
          <div className="font-bold">{post.likes} likes</div>
          <p><span className="font-bold">{post.user}</span> {post.content}</p>
          <div className="text-gray-400 uppercase text-[10px]">{post.time}</div>
        </div>
      )}
      
      {!showEmbed && (
        <div className="mt-auto p-3 border-t flex items-center gap-2">
           <input type="text" placeholder="Add a comment..." className="flex-1 outline-none text-[10px]" />
           <Instagram size={14} className="text-gray-400" />
        </div>
      )}
    </div>
  );
};

const YoutubeSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = "vnXJtJ7D2D8";
  const thumbnail = "https://uniqueraclinic.com/wp-content/uploads/2026/02/maxresdefault-1200x675.jpg";

  return (
    <section className="py-10 md:py-24 bg-primary-bg overflow-hidden border-y border-white/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 uppercase tracking-tight">Real Patient <span className="text-brand-cyan">Experience</span></h2>
        
        <div className="relative inline-block w-full max-w-5xl group cursor-pointer aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
          {!isPlaying ? (
            <div className="h-full w-full relative" onClick={() => setIsPlaying(true)}>
              <img 
                src={thumbnail} 
                alt="Patient Experience Video" 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all duration-500">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-brand-cyan rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-[0_0_50px_rgba(45,199,204,0.4)]">
                  <Play className="text-primary-bg fill-primary-bg ml-2" size={40} />
                </div>
              </div>
            </div>
          ) : (
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&vq=hd1080&si=U5LVU46njW-GPE2u`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </div>
    </section>
  );
};

const InstagramSection = () => {
  const posts = [
    { 
      user: "uniquerahairtransplant", 
      time: "1 year ago", 
      likes: "178", 
      reelId: "DWJ0lOqDfex",
      content: "Natanael trusted the process and this is the result. Full hair, natural hairline, real confidence.",
      img: "https://uniqueraclinic.com/wp-content/uploads/2026/05/656320603_18320203021271135_4350920196892933004_n-e1778124524815.jpg"
    },
    { 
      user: "uniquerahairtransplant", 
      time: "1 year ago", 
      likes: "171", 
      reelId: "DSfb-gDCYFz",
      content: "What does a year really change? For Christopher, it changed everything without anyone noticing at first.",
      img: "https://uniqueraclinic.com/wp-content/uploads/2026/05/587461951_18308392801271135_455230924143920892_n-e1778124542139.jpg"
    },
    { 
      user: "uniquerahairtransplant", 
      time: "1 year ago", 
      likes: "14", 
      reelId: "DVwAdqLDxUx",
      content: "Natanel trusted the process and this is the result. Fuller hair, natural hairline, real confidence.",
      img: "https://uniqueraclinic.com/wp-content/uploads/2026/05/649667389_18318288985271135_9037796182761197950_n-e1778124558261.jpg"
    },
  ];

  return (
    <section className="py-10 md:py-24 bg-primary-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 uppercase tracking-tight">Real Results on <span className="text-brand-cyan">Instagram</span></h2>
          <a 
            href="https://www.instagram.com/uniquerahairtransplant/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-brand-cyan hover:underline inline-flex items-center gap-2 font-bold tracking-widest text-sm"
          >
            <Instagram size={18} /> @uniquerahairtransplant
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <InstagramPost key={idx} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

const MedicalStandards = () => {
  const certifications = [
    "https://uniqueraclinic.com/wp-content/uploads/2026/03/Untitled-design-2-768x768.webp",
    "https://uniqueraclinic.com/wp-content/uploads/2026/03/Untitled-design-3-768x768.webp",
    "https://lh3.googleusercontent.com/d/1q413Jz8Ckgh9Xsv-5ra3PQYip9hF1naZ",
    "https://uniqueraclinic.com/wp-content/uploads/2026/03/Untitled-design-4-768x768.png",
  ];

  return (
    <section className="py-10 md:py-24 bg-accent-bg overflow-hidden border-y border-white/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
          Certified Medical Standards. <span className="text-brand-cyan italic">Trusted International Patient Care.</span>
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-lg leading-relaxed">
          UniquEra follows verified clinical, safety, and patient-care standards across consultation, procedure planning, and aftercare, so every patient knows they are choosing a medically guided journey.
        </p>

        <div className="relative">
           {/* Gradient Overlays for smooth entry/exit */}
           <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-accent-bg to-transparent z-10 hidden md:block" />
           <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-accent-bg to-transparent z-10 hidden md:block" />
           
           <div className="flex animate-scroll gap-12 md:gap-24 items-center whitespace-nowrap py-8">
              {[...certifications, ...certifications, ...certifications].map((src, idx) => (
                <a 
                  key={idx} 
                  href="https://uniqueraclinic.com/uniquera-certifications/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:scale-105 transition-transform"
                >
                  <img 
                    src={src} 
                    alt="Certification" 
                    className="h-20 md:h-28 object-contain transition-all duration-500 bg-white p-2 rounded-lg" 
                    referrerPolicy="no-referrer"
                  />
                </a>
              ))}
           </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => window.open('https://uniqueraclinic.com/uniquera-certifications/', '_blank')}
            className="btn-cyan flex items-center gap-2"
          >
            <MessageSquare size={18} /> View Certifications
          </button>
        </div>
      </div>
    </section>
  );
};

const BloombergSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-10 md:py-24 bg-primary-bg border-y border-white/5">
      <div className="container mx-auto px-4 text-center">
         <p className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-4">As Seen In</p>
         <h2 className="text-4xl md:text-8xl font-black mb-12 opacity-90 italic">Bloomberg</h2>
         
         <div className="relative inline-block w-full max-w-5xl group cursor-pointer aspect-video rounded-[3rem] overflow-hidden mb-16 shadow-2xl border border-white/5">
            {!isPlaying ? (
              <div className="h-full w-full relative" onClick={() => setIsPlaying(true)}>
                <img 
                  src="https://uniqueraclinic.com/wp-content/uploads/2026/01/hqdefault.jpg" 
                  alt="Bloomberg Feature" 
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all duration-500">
                   <div className="w-20 h-20 md:w-32 md:h-32 bg-brand-cyan rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-[0_0_50px_rgba(45,199,204,0.4)]">
                      <Play className="text-primary-bg fill-primary-bg ml-2" size={40} />
                   </div>
                </div>
                <div className="absolute bottom-10 left-10 text-left hidden md:block">
                   <p className="text-brand-cyan font-bold uppercase tracking-widest text-sm mb-2">Global Media Feature</p>
                   <h3 className="text-4xl font-bold text-white">UniquEra on <span className="italic">Bloomberg TV</span></h3>
                </div>
              </div>
            ) : (
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/bKTyYS0b624?autoplay=1&vq=hd1080" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            )}
         </div>

         <p className="text-xl md:text-3xl font-bold max-w-4xl mx-auto italic text-gray-300 leading-relaxed">
           “Trusted globally for expert hair transplant Turkey results that speak louder than promises.”
         </p>
      </div>
    </section>
  );
};

const AnniversaryProgram = () => (
  <section className="py-10 md:py-24 bg-accent-bg border-y border-white/5">
    <div className="container mx-auto px-4 text-center">
      <div className="max-w-4xl mx-auto bg-primary-bg p-8 md:p-16 rounded-[2.5rem] border border-brand-cyan/20 shadow-glow relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-cyan/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <span className="text-brand-cyan font-bold uppercase tracking-widest text-sm mb-4 block">Limited Time Milestone</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">UniquEra Anniversary <span className="text-brand-cyan italic">Medical Priority Program</span></h2>
          
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            To mark a clinical milestone at UniquEra, we are opening <span className="text-white font-bold">50 priority consultation slots</span> for new patients.
          </p>

          <div className="text-left bg-white/5 p-8 rounded-3xl mb-10 border border-white/5 mt-12">
            <h3 className="text-xl font-bold mb-6 text-brand-cyan italic">Patients who do our free video consultation and mention "E-Book" will receive:</h3>
            <ul className="space-y-6">
              {[
                "Priority case review by our senior medical team",
                "Extended consultation time",
                "Detailed donor safety and long-term planning assessment",
                "Complimentary product / service as a free add-on for your surgery as per your case diagnosis"
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <CheckCircle2 className="text-brand-cyan shrink-0 mt-1" size={20} />
                  <span className="text-gray-300 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="inline-block px-6 py-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan font-bold text-sm uppercase tracking-widest">
              Limited to the first 50 bookings only
            </div>
            
            <p className="text-white text-xl font-bold italic">
              Secure your consultation today before priority slots close.
            </p>

            <button 
              onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-cyan mt-4 px-12 py-5 text-xl font-black uppercase tracking-tighter shadow-[0_20px_50px_rgba(45,199,204,0.3)] hover:translate-y-[-5px] transition-all"
            >
              Claim My Priority Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

type FooterProps = {
  /** When set, footer “Book now” targets use navigation instead of in-page scroll. */
  consultationHref?: string;
};

const Footer = ({consultationHref}: FooterProps = {}) => {
  const goConsultation = () => {
    if (consultationHref) {
      window.location.href = consultationHref;
      return;
    }
    document.getElementById('consultation-form')?.scrollIntoView({behavior: 'smooth'});
  };
  const goTestimonials = () => {
    if (consultationHref) {
      const base = consultationHref.split('#')[0] || consultationHref;
      window.location.href = `${base.replace(/\/+$/, '')}#testimonials`;
      return;
    }
    document.getElementById('testimonials')?.scrollIntoView({behavior: 'smooth'});
  };
  return (
  <footer className="pt-10 md:pt-24 pb-10 md:pb-12 bg-[#031011] border-t border-white/5">
    <div className="container mx-auto px-4">
       <div className="grid md:grid-cols-5 gap-12 mb-20">
          <div className="col-span-1">
             <img src={LOGO_WHITE_URL} alt="UniquEra Clinic" className="h-12 mb-8" referrerPolicy="no-referrer" />
             <div className="space-y-6">
                <div>
                  <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">Visiting Hours:</h5>
                  <p className="text-gray-500 text-xs">Monday - Saturday: 08:00 - 18:00</p>
                  <p className="text-gray-500 text-xs">Sunday: Off</p>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Mail className="text-brand-cyan shrink-0" size={18} />
                       <p className="text-gray-400 text-sm font-medium">info@uniqueraclinic.com</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <Phone className="text-brand-cyan shrink-0" size={18} />
                       <p className="text-gray-400 text-sm font-medium">+90 538 877 01 99</p>
                    </div>
                </div>
             </div>
          </div>
          <div>
             <h4 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Quick Links</h4>
             <ul className="space-y-3 text-gray-500 text-sm">
                <li><a href="https://uniqueraclinic.com/" className="hover:text-brand-cyan transition-colors italic">Home</a></li>
                <li><a href="https://uniqueraclinic.com/about-us-uniquera-clinic-turkey/" className="hover:text-brand-cyan transition-colors italic">About UniquEra</a></li>
                <li><a href="https://uniqueraclinic.com/hazem-altal/" className="hover:text-brand-cyan transition-colors italic">Founder</a></li>
                <li><a href="https://uniqueraclinic.com/our-team/" className="hover:text-brand-cyan transition-colors italic">Our Team</a></li>
                <li><a href="https://uniqueraclinic.com/products/" className="hover:text-brand-cyan transition-colors italic">Our Products</a></li>
                <li><a href="https://uniqueraclinic.com/vip-treatment/" className="hover:text-brand-cyan transition-colors italic">VIP Treatment Package</a></li>
             </ul>
          </div>
          <div>
             <h4 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Services</h4>
             <ul className="space-y-3 text-gray-500 text-sm">
                <li><a href="https://uniqueraclinic.com/receding-hairline-transplant/" className="hover:text-brand-cyan transition-colors italic">Receding Hairline</a></li>
                <li><a href="https://uniqueraclinic.com/crown-hair-transplant/" className="hover:text-brand-cyan transition-colors italic">Thinning Crown</a></li>
                <li><a href="https://uniqueraclinic.com/diffuse-thinning-hair-transplant/" className="hover:text-brand-cyan transition-colors italic">Diffuse Hair Thinning</a></li>
                <li><a href="https://uniqueraclinic.com/beard-transplant-turkey/" className="hover:text-brand-cyan transition-colors italic">Beard Transplants</a></li>
                <li><a href="https://uniqueraclinic.com/eyebrow-transplant-turkey/" className="hover:text-brand-cyan transition-colors italic">Eyebrow Transplant</a></li>
                <li><a href="https://uniqueraclinic.com/fix-botched-hair-transplant/" className="hover:text-brand-cyan transition-colors italic">Repair Botched Hair Transplant</a></li>
                <li><a href="https://uniqueraclinic.com/afro-hair-transplant-turkey/" className="hover:text-brand-cyan transition-colors italic">Afro hair transplant</a></li>
                <li><a href="https://uniqueraclinic.com/female-hair-transplant-turkey/" className="hover:text-brand-cyan transition-colors italic">Female Hair Transplant</a></li>
                <li><a href="https://uniqueraclinic.com/dhi-hair-transplant-turkey/" className="hover:text-brand-cyan transition-colors italic">DHI</a></li>
                <li><a href="https://uniqueraclinic.com/sapphire-fue-hair-transplant/" className="hover:text-brand-cyan transition-colors italic">FUE Sapphire</a></li>
                <li><a href="https://uniqueraclinic.com/manual-fue-hair-transplant/" className="hover:text-brand-cyan transition-colors italic">FUE Manual</a></li>
                <li><a href="https://uniqueraclinic.com/stem-cell-hair-transplant-in-turkey/" className="hover:text-brand-cyan transition-colors italic">Stem Cell Hair Transplant</a></li>
             </ul>
          </div>
          <div>
             <h4 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Resources</h4>
             <ul className="space-y-3 text-gray-500 text-sm">
                <li><a href="https://uniqueraclinic.com/patient-guide/" className="hover:text-brand-cyan transition-colors italic">Patient Guide</a></li>
                <li><a href="https://uniqueraclinic.com/blog/" className="hover:text-brand-cyan transition-colors italic">Blog</a></li>
                <li><a href="https://uniqueraclinic.com/testimonials/" className="hover:text-brand-cyan transition-colors italic">Testimonials</a></li>
                <li><a href="https://uniqueraclinic.com/our-gallery/" className="hover:text-brand-cyan transition-colors italic">Before and Afters</a></li>
                <li><a href="https://uniqueraclinic.com/case-study/" className="hover:text-brand-cyan transition-colors italic">Case Study</a></li>
                <li><a href="https://uniqueraclinic.com/faqs/" className="hover:text-brand-cyan transition-colors italic">FAQ</a></li>
             </ul>
          </div>
          <div>
             <h4 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Support Page</h4>
             <ul className="space-y-3 text-gray-500 text-sm">
                <li><a href="https://uniqueraclinic.com/privacy-policy/" className="hover:text-brand-cyan transition-colors italic">Privacy Policy</a></li>
                <li><a href="https://uniqueraclinic.com/contact-us/" className="hover:text-brand-cyan transition-colors italic">Contact Us</a></li>
             </ul>
             <div className="flex gap-4 pt-10">
                   <a href="https://www.instagram.com/uniquerahairtransplant/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all"><Instagram size={16}/></a>
                   <a href="https://www.facebook.com/profile.php?id=61568174116410#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all"><Facebook size={16}/></a>
                   <a href="https://www.youtube.com/@UniquEraHairTransplant" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all"><Youtube size={16}/></a>
                   <a href="https://www.tiktok.com/@uniquerahairtransplant?_t=8pEDacrfmpa&_r=1" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                       <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.89-.23-2.74.24-.81.47-1.34 1.31-1.43 2.24-.02.91.28 1.84.94 2.48.65.66 1.54.89 2.44.9 1.03-.01 2-.54 2.62-1.35.49-.67.6-1.47.59-2.29V.02z"/>
                     </svg>
                   </a>
             </div>
          </div>
       </div>
       <div className="pt-8 border-t border-white/5 text-center text-gray-600 text-[10px] mt-12 tracking-[0.2em] font-medium">
          © UNIQUERA 2025, All rights reserved.
       </div>
    </div>
    <div className="hidden md:block fixed bottom-6 left-[5%] z-50 pointer-events-auto">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle size={32} fill="currentColor" />
      </a>
    </div>
    
    {/* Floating Action Tabs */}
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-1">
       <div 
        onClick={goConsultation}
        className="bg-brand-cyan text-[#031011] py-6 px-3 flex flex-col items-center gap-4 rounded-l-2xl shadow-2xl cursor-pointer hover:bg-white hover:text-brand-cyan transition-all group"
       >
          <Calendar size={18} className="group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] rotate-180 font-bold text-[10px] tracking-widest uppercase">Book Now</span>
       </div>
       <div 
        onClick={goTestimonials}
        className="bg-white text-[#031011] py-6 px-3 flex flex-col items-center gap-4 rounded-l-2xl shadow-2xl cursor-pointer hover:bg-brand-cyan hover:text-white transition-all group"
       >
          <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] rotate-180 font-bold text-[10px] tracking-widest uppercase">Testimonials</span>
       </div>
    </div>
  </footer>
);
};

const PromoPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after 1 second
    const timer = setTimeout(() => {
      // Temporarily disabled storage check for development visibility
      // const hasSeenPopup = sessionStorage.getItem('hasSeenPromo');
      // if (!hasSeenPopup) {
      setIsVisible(true);
      // }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenPromo', 'true');
  };

  const openConsultationForm = () => {
    closePopup();
    window.setTimeout(() => {
      document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative max-w-md w-full max-h-[80vh] bg-[#043a40] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_50px_100px_-20px_rgba(45,199,204,0.3)] overflow-hidden flex flex-col"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-cyan/10 blur-[80px] -z-10" />

            {/* Close Button */}
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="text-center pr-0">
              <div className="inline-block px-4 py-1.5 border border-brand-cyan/20 rounded-full text-[9px] font-bold text-brand-cyan uppercase tracking-[0.2em] mb-7 mt-2">
                Exclusive Summer Offer
              </div>

              <h4 className="text-white font-medium uppercase tracking-[0.1em] text-[10px] md:text-xs mb-3.5 opacity-80 leading-relaxed">
                The Best Time For A Hair Transplant?
              </h4>
              
              <h2 className="text-3xl md:text-4xl font-black text-white mb-5 uppercase tracking-tight leading-none">
                Now Is <span className="text-brand-cyan">The Time!</span>
              </h2>
              
              <div className="h-1 w-16 bg-brand-cyan/20 mx-auto rounded-full mb-7" />

              <div className="space-y-3 mb-7">
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl text-left hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-brand-cyan flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-primary-bg" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-white/90">Before summer begins</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl text-left hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-brand-cyan flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-primary-bg" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-white/90">Before flight prices rise</span>
                </div>
              </div>

              <p className="text-brand-cyan font-bold italic text-xs md:text-sm mb-5">
                Get your exclusive offer now!
              </p>

              <button
                type="button"
                onClick={openConsultationForm}
                className="block w-full btn-cyan py-4 text-xs font-bold uppercase tracking-[0.1em] shadow-[0_15px_30px_-5px_rgba(45,199,204,0.4)]"
              >
                Book My Hair Transplant
              </button>

              <p className="text-[9px] text-white mt-7 font-medium italic opacity-80">
                *Offer valid for bookings and procedures until the end of June 2026.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uniquera-cookie-consent');
      if (!saved) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const setConsent = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem('uniquera-cookie-consent', value);
      localStorage.setItem('uniquera-cookie-consent-at', new Date().toISOString());
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[120] md:left-auto md:right-6 md:max-w-xl">
      <div className="rounded-2xl border border-white/10 bg-[#031011]/95 backdrop-blur-md p-4 md:p-5 shadow-2xl">
        <p className="text-sm text-gray-200 leading-relaxed mb-4">
          We use cookies to improve your experience, analyze traffic, and personalize content.
          By clicking <span className="text-brand-cyan font-semibold">Accept</span>, you agree to our use of cookies.
        </p>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => setConsent('rejected')}
            className="px-4 py-2 rounded-full border border-white/20 text-white text-xs md:text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => setConsent('accepted')}
            className="px-4 py-2 rounded-full bg-brand-cyan text-primary-bg text-xs md:text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

type MobileBookingBarProps = {
  consultationHref?: string;
};

const MobileBookingBar = ({consultationHref}: MobileBookingBarProps) => {
  const goConsultation = () => {
    if (consultationHref) {
      window.location.href = consultationHref;
      return;
    }
    document.getElementById('consultation-form')?.scrollIntoView({behavior: 'smooth'});
  };
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col items-start gap-3">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-[5%] w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle size={32} fill="currentColor" />
      </a>
      <button
        type="button"
        onClick={goConsultation}
        className="w-[95%] self-center mb-[3px] btn-cyan py-4 text-lg shadow-2xl"
      >
        Book Now
      </button>
    </div>
  );
};

const ThankYouPage = ({basePath}: {basePath: string}) => {
  const landingHome = absoluteLandingUrl(basePath);
  const bookHref = `${landingHome.replace(/\/+$/, '')}#consultation-form`;

  useEffect(() => {
    pushConsultationFormThankYouIfPending();
  }, []);

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-cyan selection:text-primary-bg bg-primary-bg">
      <TopBar />
      <Header
        homeHref={landingHome}
        navHashBase={landingHome.replace(/\/+$/, '')}
        bookNowHref={bookHref}
      />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 md:py-24">
        <div className="glass-card border border-white/10 rounded-3xl max-w-lg w-full px-8 py-12 text-center shadow-2xl">
          <div
            className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cyan text-primary-bg text-3xl font-bold"
            aria-hidden
          >
            ✓
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">Thank you</h1>
          <p className="text-gray-300 text-base leading-relaxed mb-3">
            Your consultation form has been submitted successfully.
          </p>
          <p className="text-gray-300 text-base leading-relaxed mb-6">
            One of our medical consultants will contact you within 24 hours.
          </p>
          <p className="text-brand-cyan font-semibold">
            <a href="https://wa.me/905388770199" target="_blank" rel="noopener noreferrer" className="underline">
              Chat on WhatsApp
            </a>
          </p>
          <div className="mt-10">
            <a href={landingHome} className="btn-cyan inline-block">
              Back to home
            </a>
          </div>
        </div>
      </main>
      <Footer consultationHref={bookHref} />
      <MobileBookingBar consultationHref={bookHref} />
    </div>
  );
};

export default function App() {
  const basePath = normalizeBasePath(import.meta.env.BASE_URL || '/');
  const [isThankYou, setIsThankYou] = useState(
    () => typeof window !== 'undefined' && matchesThankYouPath(window.location.pathname, basePath),
  );

  useEffect(() => {
    const sync = () => setIsThankYou(matchesThankYouPath(window.location.pathname, basePath));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [basePath]);

  if (isThankYou) {
    return <ThankYouPage basePath={basePath} />;
  }

  return (
    <div className="min-h-screen selection:bg-brand-cyan selection:text-primary-bg">
      <PromoPopup />
      <CookieConsent />
      <TopBar />
      <Header />
      
      <main>
        <Hero />
        <EducationHeader />
        <UniqueraConsultationForm />
        <Transformations />
        <WhatsappSection />
        <Testimonials />
        <ConsultationSlotsCtaSection />
        <YoutubeSection />
        <InstagramSection />
        <MedicalStandards />
        <BloombergSection />
        



        <MedicalGuideSection />
        <ConsultationSlotsCtaSection />
        <MedicalTeam />
        <AnniversaryProgram />
      </main>

      <Footer />

      <MobileBookingBar />
    </div>
  );
}
