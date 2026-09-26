import React from 'react';
import { Ruler, Sparkles, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../../data/config';

export const AdminBespokePage: React.FC = () => {
  const sampleInquiries = [
    {
      id: "inq-01",
      client: "Chief Olusegun Balogun",
      email: "o.balogun@energy.ng",
      phone: "+234 802 333 4455",
      silhouette: "Wholecut Oxford with Bevelled Waist",
      leather: "Museum Calfskin in Bordeaux",
      size: "EU 43 (High Instep)",
      occasion: "Investiture Ceremony & Black Tie",
      fittingPref: "Atelier Measurement at Lagos Workshop",
      date: "March 22, 2026",
      status: "Consultation Booked"
    },
    {
      id: "inq-02",
      client: "Tariq Al-Mansoor",
      email: "t.mansoor@gulfcapital.ae",
      phone: "+971 50 123 4567",
      silhouette: "Belgian Tassel Loafer",
      leather: "Midnight Obsidian French Box Calf",
      size: "EU 42.5",
      occasion: "Executive Wardrobe",
      fittingPref: "Virtual Digital Consultation",
      date: "March 18, 2026",
      status: "Measurement Sent"
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="pb-6 border-b border-[#D8CBB8]/15">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
          Bespoke Consultation Registry
        </span>
        <h1 className="font-serif text-2xl md:text-3xl text-[#F5F1E8] font-light">
          Private Fitting & Consultation Dossiers
        </h1>
        <p className="text-xs text-[#D8CBB8]/60 font-sans mt-0.5">
          Inquiries received through the Bespoke Commission questionnaire for custom wooden last carving.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleInquiries.map((inq) => (
          <div key={inq.id} className="bg-[#121212] border border-[#D8CBB8]/15 p-6 rounded-lg space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8CBB8]/10">
              <span className="font-serif text-base text-[#F5F1E8] font-medium">
                {inq.client}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/30">
                {inq.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-[#D8CBB8]/80">
              <div><span className="text-[#D8CBB8]/50">Silhouette:</span> {inq.silhouette}</div>
              <div><span className="text-[#D8CBB8]/50">Leather Spec:</span> {inq.leather}</div>
              <div><span className="text-[#D8CBB8]/50">Foot Size & Last:</span> {inq.size}</div>
              <div><span className="text-[#D8CBB8]/50">Fitting Mode:</span> {inq.fittingPref}</div>
              <div><span className="text-[#D8CBB8]/50">Inquiry Date:</span> {inq.date}</div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#D8CBB8]/60 font-sans">{inq.phone}</span>
              <a
                href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${inq.client}, this is Nelson from Nelson Shoes Atelier regarding your bespoke consultation request.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B89B5E] text-[#0A0A0A] rounded text-xs font-semibold uppercase tracking-wider"
              >
                <MessageCircle size={13} />
                <span>Contact Client</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
