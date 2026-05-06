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
  Download
} from 'lucide-react';

// Assets
const LOGO_URL = "https://uniqueraclinic.com/wp-content/uploads/2024/09/Group-17.svg";
const LOGO_WHITE_URL = "https://uniqueraclinic.com/wp-content/uploads/2024/04/Group-1111.svg";

// Components
const TopBar = () => {
  const [index, setIndex] = useState(0);
  const messages = [
    "Book your flight fast",
    "Now is the time to act",
    "Achieve stunning hair results with UniqueEra Clinic",
    "UniquEra Clinic: Best Hair Transplant in Turkey"
  ];
  const whatsappUrl = "https://wa.me/905388770199";

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
            href={whatsappUrl}
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

const Header = () => (
  <header className="sticky top-0 z-50 bg-primary-bg/80 backdrop-blur-lg border-b border-white/5 py-4">
    <div className="container mx-auto px-4 flex justify-between items-center">
      <img src={LOGO_WHITE_URL} alt="UniquEra Clinic" className="h-10 md:h-12" referrerPolicy="no-referrer" />
      <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
        <a href="#about" className="hover:text-brand-cyan transition-colors">About Us</a>
        <a href="#transformations" className="hover:text-brand-cyan transition-colors">Transformations</a>
        <a href="#doctors" className="hover:text-brand-cyan transition-colors">Doctors</a>
        <button 
          onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn-cyan text-sm py-2.5"
        >
          Request An Appointment
        </button>
      </div>
      <button className="lg:hidden text-white">
        <Menu size={24} />
      </button>
    </div>
  </header>
);

const Hero = () => (
  <section id="about" className="relative overflow-hidden">
    {/* Main Hero Banner */}
    <div className="relative w-full aspect-[2/1] md:aspect-[3/1] lg:aspect-[2560/1280] max-h-[85vh]">
      <img 
        src="https://uniqueraclinic.com/wp-content/uploads/2026/04/Website-banner-final-soft-2560-x-1280-px-5-2-e1776191336605.webp" 
        alt="Hair Transplant Results" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-bg/20 via-transparent to-primary-bg"></div>
    </div>

    <div className="container mx-auto px-4 text-center z-10 relative -mt-16 md:-mt-24 lg:-mt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-[50px]"
      >
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 tracking-tight leading-[1.1]">
          The <span className="text-white">Most Trusted Clinic</span> by patients <span className="text-brand-cyan italic">World Wide</span>
        </h1>
        <p className="text-gray-300 text-sm md:text-xl font-medium max-w-3xl mx-auto mb-10">
          31,000+ procedures performed on patients from 40+ countries over 13+ years
        </p>
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn-cyan px-10 py-4 text-base font-bold uppercase tracking-tight shadow-xl"
        >
          Claim My Free Virtual Consultation
        </motion.button>
      </motion.div>
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
    <section id="transformations" className="py-24 bg-primary-bg overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-4xl mx-auto">
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
          <div className="pt-8 border-t border-white/5">
            <h2 className="text-4xl md:text-5xl font-bold">Real <span className="text-brand-cyan">Transformations</span></h2>
          </div>
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
          <button className="btn-cyan flex items-center gap-2 mx-auto">
            <Play size={16} fill="currentColor" /> View More
          </button>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <div className="bg-accent-bg rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-gradient-to-l from-brand-cyan to-transparent"></div>
        <div className="w-full md:w-1/2 relative z-10">
            <img 
            src="https://uniqueraclinic.com/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-05-at-02.35.29.webp" 
            alt="Doctor and Patient" 
            className="rounded-2xl shadow-well" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="w-full md:w-1/2 z-10 text-center md:text-left">
          <span className="text-brand-cyan font-bold uppercase tracking-widest text-sm">You could be our next transformation</span>
          <h2 className="text-4xl md:text-6xl font-bold mt-4 mb-6 leading-tight">Your transformation <span className="text-brand-cyan">starts here</span></h2>
          <p className="text-[#d1d5dc] text-lg mb-8 max-w-md">Real planning. Real outcomes. No guesswork. Schedule a free consultation for a graft assessment based on your hair loss.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button 
              onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-cyan"
            >
              Book an Appointment
            </button>
            <button 
              onClick={() => document.getElementById('transformations')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline"
            >
              View Before and Afters
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center md:justify-start gap-6 opacity-60 text-xs font-bold uppercase">
            <span className="flex items-center gap-1"><Star size={14} className="fill-brand-cyan text-brand-cyan" /> Trustpilot 4.9/5</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-brand-cyan" /> ProvenExpert 5/5</span>
            <span className="flex items-center gap-1"><Star size={14} className="fill-brand-cyan text-brand-cyan" /> Google Reviews 5/5</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section id="testimonials" className="py-24 bg-primary-bg">
    <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-12 items-center">
      <div className="lg:col-span-1 space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold">Trusted <span className="text-brand-cyan italic">Worldwide</span></h2>
        <div className="flex flex-col gap-4">
           <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-5 mb-2 grayscale brightness-200" referrerPolicy="no-referrer" />
                <div className="text-3xl font-bold">200+</div>
                <div className="text-[10px] uppercase font-bold text-gray-500">Google Reviews</div>
              </div>
              <div className="flex gap-0.5 text-yellow-500">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
              </div>
           </div>

        </div>
      </div>
      <div className="lg:col-span-2 relative">
        <div className="bg-accent-bg p-8 md:p-12 rounded-4xl relative overflow-hidden">
          <div className="text-6xl text-brand-cyan/20 absolute top-4 left-4 font-serif">"</div>
          <p className="text-[18px] text-gray-300 leading-[30.5px] relative z-10 italic">
            “Almost a year ago, I had my hair transplant at UniquEra Hair Transplant Clinic in Istanbul, and I’m beyond impressed with the results! The entire experience was top-notch from start to finish. The team was professional, warm, and incredibly thorough, explaining every detail of the process so I felt at ease. I had 4,500 grafts done, and despite the scale of the procedure, it was surprisingly comfortable once the numbing kicked in. The clinic’s modern facilities and the surgeons’ expertise really shone through. They even followed up with me during my stay, offering personalized care and some great recommendations for exploring Istanbul. Now, nearly a year later, my hair looks full, natural, and better than I ever imagined. UniquEra’s dedication to their patients is unmatched!”
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-cyan/20 flex items-center justify-center font-bold text-xl border border-brand-cyan/40">DG</div>
            <div>
              <div className="font-bold text-lg">Delvis Gomez</div>
              <div className="text-gray-500 text-sm">United States</div>
            </div>
            <div className="ml-auto flex gap-4">
               <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><ChevronLeft size={20}/></button>
               <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
            <button className="btn-cyan flex items-center gap-2">
              <MessageSquare size={18} /> View Testimonials
            </button>
        </div>
      </div>
    </div>
  </section>
);

const MedicalGuideSection = () => {
  const items = [
    "Temporary hair loss vs genetic hair loss",
    "DHT and follicle miniaturization explained simply",
    "Blood tests that may reveal hidden deficiencies",
    "The truth about oils, shampoos, fibers, microneedling, and red light therapy",
    "Clear explanation of medications, PRP, stem cell-based therapies, and exosomes",
    "When surgery becomes the only reliable option"
  ];

  return (
    <section className="py-24 bg-accent-bg">
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
              <button className="btn-cyan w-full flex items-center justify-center gap-2">
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
    </section>
  );
};

const ConsultationSection = () => {
  const scrollToTransformations = () => {
    const el = document.getElementById('transformations');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-24 bg-[#043a40] border-y border-white/5">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 italic">
            Consultation Slots Are <span className="text-brand-cyan">Limited This Month</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            You’ve seen real patient results, WhatsApp conversations, and reviews. Now let UniquEra’s team review your hair loss stage, donor area, and goals before you decide your next step.
          </p>
          <button 
            onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-cyan px-10 py-5 text-lg font-bold shadow-[0_20px_40px_-10px_rgba(45,199,204,0.3)] hover:translate-y-[-4px] transition-all"
          >
            Secure My Free Consultation
          </button>
        </div>
      </div>
    </section>
  );
};

const MedicalTeam = () => {
  const [activeTab, setActiveTab] = useState<'MEDICAL' | 'OPERATIONAL'>('MEDICAL');
  
  const medicalDoctors = [
    { name: "Emir Doğan", role: "DHI & FUE Sapphire Hair Transplant Specialist", img: "https://uniqueraclinic.com/wp-content/uploads/2024/11/Stafff-2-min.jpg" },
    { name: "Cengiz Yerlikaya", role: "Senior Sapphire Dhi Specialist", img: "https://uniqueraclinic.com/wp-content/uploads/2024/11/Stafff-1-min.jpg" },
    { name: "Çağri Çelik", role: "Medical team Director", img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/9-1.jpg" },
    { name: "Yagmur Dalioğlu", role: "Anesthesiologist", img: "https://uniqueraclinic.com/wp-content/uploads/2024/04/4.jpg" },
  ];

  const operationalDocs = [
    { name: "Juliana Koci", role: "Head Medical Consultant & Patient Care", img: "https://uniqueraclinic.com/wp-content/uploads/2025/08/PHOTO-2025-08-20-17-08-30-e1755705661225.jpg" },
    { name: "Raffa Dabbas", role: "Medical Interpreter", img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/10-1.jpg" },
    { name: "Emad Albeni", role: "Operations Manager", img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/Stafff-2-min.jpg" },
  ];

  const doctors = activeTab === 'MEDICAL' ? medicalDoctors : operationalDocs;

  return (
    <section id="doctors" className="py-24 bg-primary-bg">
      <div className="container mx-auto px-4 text-center">
        <h4 className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">Doctors</h4>
        <h2 className="text-4xl md:text-6xl font-bold mb-16">Our Expert Doctors <span className="text-brand-cyan italic">For The Patients</span></h2>
        
        <div className="flex justify-center gap-4 mb-12">
           <button 
             onClick={() => setActiveTab('MEDICAL')}
             className={`${activeTab === 'MEDICAL' ? 'btn-cyan' : 'bg-white/5'} text-xs py-2 px-8 rounded-full font-bold transition-all`}
           >
             MEDICAL
           </button>
           <button 
             onClick={() => setActiveTab('OPERATIONAL')}
             className={`${activeTab === 'OPERATIONAL' ? 'btn-cyan' : 'bg-white/5'} text-xs py-2 px-8 rounded-full font-bold transition-all`}
           >
             OPERATIONAL
           </button>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {doctors.map((doc, idx) => (
            <motion.div 
              key={`${activeTab}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-accent-bg rounded-3xl p-6 border border-white/5"
            >
              <div className="aspect-[4/5] bg-primary-bg rounded-2xl mb-6 overflow-hidden relative group">
                <img 
                  src={doc.img} 
                  alt={doc.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-xl font-bold text-brand-cyan mb-1">{doc.name}</h3>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-tight mb-4">{doc.role}</p>
              <button 
                onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-3 rounded-xl border border-brand-cyan/20 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-cyan hover:text-primary-bg transition-all"
              >
                Book An Appointment
              </button>
            </motion.div>
          ))}
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
        <button className="ml-auto bg-brand-cyan text-white text-[10px] px-3 py-1 rounded">View profile</button>
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

const InstagramSection = () => {
  const posts = [
    { 
      user: "uniquerahairtransplant", 
      time: "1 year ago", 
      likes: "178", 
      reelId: "DWJ0lOqDfex",
      content: "Natanael trusted the process and this is the result. Full hair, natural hairline, real confidence.",
      img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/Ig-Post-1.jpg"
    },
    { 
      user: "uniquerahairtransplant", 
      time: "1 year ago", 
      likes: "171", 
      reelId: "DWJ0lOqDfex", // Using placeholder or same for now if others not known
      content: "What does a year really change? For Christopher, it changed everything without anyone noticing at first.",
      img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/Ig-Post-2.jpg"
    },
    { 
      user: "uniquerahairtransplant", 
      time: "1 year ago", 
      likes: "14", 
      reelId: "DWJ0lOqDfex",
      content: "Natanel trusted the process and this is the result. Fuller hair, natural hairline, real confidence.",
      img: "https://uniqueraclinic.com/wp-content/uploads/2024/10/Ig-Post-3.jpg"
    },
  ];

  return (
    <section className="py-24 bg-primary-bg">
      <div className="container mx-auto px-4">
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
    <section className="py-24 bg-accent-bg overflow-hidden border-y border-white/5">
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
                <img 
                  key={idx} 
                  src={src} 
                  alt="Certification" 
                  className="h-20 md:h-28 object-contain transition-all duration-500 bg-white p-2 rounded-lg" 
                  referrerPolicy="no-referrer"
                />
              ))}
           </div>
        </div>
      </div>
    </section>
  );
};

const BloombergSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-24 bg-primary-bg border-y border-white/5">
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
                src="https://www.youtube.com/embed/bKTyYS0b624?autoplay=1" 
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
  <section className="py-24 bg-accent-bg border-y border-white/5">
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

const AnniversaryCTA = () => (
  <section className="py-24 bg-[#043a40] border-y border-white/5">
    <div className="container mx-auto px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
          Claim your <span className="text-brand-cyan italic">Anniversary Priority Consultation Slots</span>
        </h2>
        <p className="text-gray-300 text-lg mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
          Only 50 priority consultation slots are open for new patients. Complete the form and mention “E-Book” during your consultation to access the Anniversary Medical Priority Program benefits.
        </p>
        <button 
          onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn-cyan px-12 py-5 text-xl font-black uppercase tracking-tighter shadow-[0_20px_50px_rgba(45,199,204,0.3)] hover:translate-y-[-5px] transition-all"
        >
          Secure My Free Consultation
        </button>
      </div>
    </div>
  </section>
);

const ConsultationEmbed = () => {
  const src = 'https://uniqueraclinic.com/consultation-embed/';

  return (
    <section id="consultation-form" aria-label="Consultation form" className="bg-primary-bg">
      <div className="w-full">
        <div className="bg-white overflow-hidden shadow-2xl border-white/10">
          <iframe
            title="Hair consultation form"
            src={src}
            style={{ border: '0', width: '100%', minHeight: '900px', display: 'block' }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="pt-24 pb-12 bg-[#031011] border-t border-white/5">
    <div className="container mx-auto px-4">
       <div className="grid md:grid-cols-5 gap-12 mb-20">
          <div className="col-span-1">
             <img src={LOGO_WHITE_URL} alt="UniquEra Clinic" className="h-12 mb-8" referrerPolicy="no-referrer" />
             <div className="space-y-6">
                <div>
                  <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">Visiting Hours:</h5>
                  <p className="text-gray-500 text-xs">Monday - Saturday: 09:00 - 18:00</p>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Phone className="text-brand-cyan shrink-0" size={18} />
                       <p className="text-gray-400 text-sm font-medium">+90 538 877 01 99</p>
                    </div>
                    <div className="flex items-start gap-3">
                       <MapPin className="text-brand-cyan shrink-0" size={18} />
                       <p className="text-gray-400 text-sm">Istanbul, Turkey</p>
                    </div>
                </div>
             </div>
          </div>
          <div>
             <h4 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Quick Links</h4>
             <ul className="space-y-3 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Home</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">About UniquEra</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Results</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Products</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">VIP Treatment Package</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Patient Guide</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Contact Us</a></li>
             </ul>
          </div>
          <div>
             <h4 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Services</h4>
             <ul className="space-y-3 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Receding Hairline</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Repair Botched Hair Transplant</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Afro hair transplant</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Female Hair Transplant</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">DHI</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">FUE Sapphire</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">FUE Manual</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Stem Cell Hair Transplant</a></li>
             </ul>
          </div>
          <div>
             <h4 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Resources</h4>
             <ul className="space-y-3 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Patient Guide</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Blog</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Case Study</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">FAQ</a></li>
             </ul>
          </div>
          <div>
             <h4 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Support Page</h4>
             <ul className="space-y-3 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors italic">Contact Us</a></li>
             </ul>
             <div className="flex gap-4 pt-10">
                   <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all"><Instagram size={16}/></a>
                   <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all"><Twitter size={16}/></a>
                   <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all"><Facebook size={16}/></a>
                   <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cyan hover:text-primary-bg transition-all"><Youtube size={16}/></a>
             </div>
          </div>
       </div>
       <div className="pt-8 border-t border-white/5 text-center text-gray-600 text-[10px] mt-12 tracking-[0.2em] font-medium">
          © UNIQUERA 2025, All rights reserved.
       </div>
    </div>
    <div className="fixed bottom-6 left-6 z-50">
       <a 
         href="https://wa.me/905388770199?text=Hi%20i%20want%20to%20know%20more%20about%20the%20process."
         target="_blank"
         rel="noopener noreferrer"
         className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
       >
          <MessageCircle size={32} fill="currentColor" />
       </a>
    </div>
    
    {/* Floating Action Tabs */}
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-1">
       <div 
        onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
        className="bg-brand-cyan text-[#031011] py-6 px-3 flex flex-col items-center gap-4 rounded-l-2xl shadow-2xl cursor-pointer hover:bg-white hover:text-brand-cyan transition-all group"
       >
          <Calendar size={18} className="group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] rotate-180 font-bold text-[10px] tracking-widest uppercase">Book Now</span>
       </div>
       <div 
        onClick={() => {
          const testimonials = document.getElementById('testimonials');
          if (testimonials) testimonials.scrollIntoView({ behavior: 'smooth' });
        }}
        className="bg-white text-[#031011] py-6 px-3 flex flex-col items-center gap-4 rounded-l-2xl shadow-2xl cursor-pointer hover:bg-brand-cyan hover:text-white transition-all group"
       >
          <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] rotate-180 font-bold text-[10px] tracking-widest uppercase">Testimonials</span>
       </div>
    </div>
  </footer>
);

const PromoPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const whatsappUrl = "https://wa.me/905388770199";

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

              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closePopup}
                className="block w-full btn-cyan py-4 text-xs font-bold uppercase tracking-[0.1em] shadow-[0_15px_30px_-5px_rgba(45,199,204,0.4)]"
              >
                Book My Hair Transplant
              </a>

              <p className="text-[9px] text-gray-500 mt-7 font-medium italic opacity-60">
                *Offer valid for bookings and procedures until the end of June 2026.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen selection:bg-brand-cyan selection:text-primary-bg">
      <PromoPopup />
      <TopBar />
      <Header />
      
      <main>
        <Hero />
        <TrustFeatures />
        <ConsultationEmbed />
        <Transformations />
        <CTASection />
        <Testimonials />
        <ConsultationSection />
        <InstagramSection />
        <MedicalStandards />
        <BloombergSection />
        



        <MedicalGuideSection />
        <MedicalTeam />
        <AnniversaryProgram />
        <AnniversaryCTA />
      </main>

      <Footer />

      {/* Floating CTA for Mobile */}
      <div className="md:hidden fixed bottom-20 left-4 right-4 z-50">
         <button className="w-full btn-cyan py-4 text-lg shadow-2xl">Book Now</button>
      </div>
    </div>
  );
}
