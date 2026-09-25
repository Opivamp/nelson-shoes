import React, { useState } from 'react';
import { 
  Check, 
  MessageCircle, 
  Upload, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Compass,
  FileCheck
} from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { getWhatsAppUrl } from '../data/config';

export const BespokePage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneWhatsApp: '',
    shoeType: 'Oxford Wholecut',
    colorPreference: 'Espresso & Burgundy Patina',
    materialPreference: 'French Full-Grain Box Calf',
    occasion: 'Executive / Corporate Presence',
    footSize: 'EU 42',
    budgetRange: '₦250,000 – ₦400,000 ($330 - $550)',
    additionalDetails: '',
  });

  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');

  const timelineSteps = [
    {
      num: "01",
      title: "CONSULTATION",
      desc: "An in-depth conversation via WhatsApp, digital meeting, or in-person at our Lagos atelier to understand your sartorial taste, aesthetic preferences, and intended wear."
    },
    {
      num: "02",
      title: "DESIGN & SILHOUETTE",
      desc: "Selecting the toe chiseled profile, heel pitch, waist beveling, and upper geometry that harmonizes with your personal posture."
    },
    {
      num: "03",
      title: "ANATOMICAL MEASUREMENT",
      desc: "Comprehensive dimensional mapping capturing foot length, metatarsal width, ball girth, instep height, and arch curvature."
    },
    {
      num: "04",
      title: "MATERIAL SELECTION",
      desc: "Choosing from our curated stocks of French box calf, Italian suedes, pull-up leathers, and oak-bark vegetable-tanned soles."
    },
    {
      num: "05",
      title: "HAND-CRAFTING",
      desc: "Carving your personalized last, clicking the hide, hand-sewing the Goodyear welt, and shaping the stacked heel breast over 3 to 6 weeks."
    },
    {
      num: "06",
      title: "TRIAL FITTING & ADJUSTMENT",
      desc: "Evaluating the glove-like feel, walking stride, and heel grip to ensure zero pinch points before final glazing."
    },
    {
      num: "07",
      title: "DELIVERY & ARCHIVE",
      desc: "Presented with bespoke cedar shoe trees and cotton dust bags. Your wooden last is permanently archived for future commissions."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `NS-BESPOKE-${Math.floor(1000 + Math.random() * 9000)}`;
    setInquiryId(id);
    setSubmitted(true);
  };

  const getConfirmationWhatsAppMessage = () => {
    let msg = `*NEW BESPOKE INQUIRY: ${inquiryId}*\n`;
    msg += `------------------------------------\n`;
    msg += `*Name:* ${formData.fullName}\n`;
    msg += `*WhatsApp:* ${formData.phoneWhatsApp}\n`;
    msg += `*Email:* ${formData.email}\n`;
    msg += `*Shoe Silhouette:* ${formData.shoeType}\n`;
    msg += `*Color / Patina:* ${formData.colorPreference}\n`;
    msg += `*Leather:* ${formData.materialPreference}\n`;
    msg += `*Size:* ${formData.footSize}\n`;
    msg += `*Occasion:* ${formData.occasion}\n`;
    msg += `*Budget Range:* ${formData.budgetRange}\n`;
    if (formData.additionalDetails) {
      msg += `*Notes:* ${formData.additionalDetails}\n`;
    }
    msg += `------------------------------------\n`;
    msg += `Hello Nelson Atelier, I have submitted this bespoke footwear request on the website and would like to confirm my consultation schedule.`;
    return getWhatsAppUrl(msg);
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-24">
        
        {/* ========================================================
            HERO: "BESPOKE, BY DESIGN."
        ======================================================== */}
        <div className="relative py-16 md:py-24 border-b border-[#D8CBB8]/15 overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
              PRIVATE COMMISSION ATELIER
            </span>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-[#F5F1E8] leading-tight">
              BESPOKE,<br />
              <span className="italic font-normal text-[#B89B5E]">BY DESIGN.</span>
            </h1>

            <p className="text-sm md:text-base text-[#D8CBB8]/80 font-sans leading-relaxed font-light max-w-xl">
              A bespoke shoe is not merely made to your size; it is formed around your rhythm, posture, and personality. Nelson Shoes builds personalized wooden lasts that translate your anatomy into wearable art.
            </p>

            <div className="pt-2 flex items-center gap-6 text-xs text-[#B89B5E] font-sans tracking-widest uppercase">
              <span>Hand-Carved Lasts</span>
              <span>•</span>
              <span>100% Hand-Welted</span>
              <span>•</span>
              <span>Lagos Atelier</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            THE 7-STEP TIMELINE
        ======================================================== */}
        <div className="space-y-16">
          <SectionHeading
            category="THE DISCIPLINE"
            title="THE SEVEN STEPS OF COMMISSIONING"
            subtitle="From initial dialogue to final mirror glazing, every bespoke pair journeys through seven stages of master craftsmanship."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {timelineSteps.map((step, idx) => (
              <div
                key={step.num}
                className="p-8 bg-[#121212] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/50 transition-colors space-y-4 group relative"
              >
                <div className="flex items-center justify-between border-b border-[#D8CBB8]/10 pb-4">
                  <span className="font-serif text-3xl text-[#B89B5E] group-hover:scale-105 transition-transform">
                    {step.num}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#D8CBB8]/40 font-sans">
                    STEP {idx + 1} OF 7
                  </span>
                </div>

                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors">
                  {step.title}
                </h3>

                <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            BESPOKE INQUIRY FORM OR CONFIRMATION
        ======================================================== */}
        <div id="inquiry-form" className="max-w-4xl mx-auto bg-[#111111] border border-[#D8CBB8]/20 p-8 md:p-14 space-y-10 shadow-2xl">
          
          {!submitted ? (
            <>
              <div className="space-y-3 text-center md:text-left border-b border-[#D8CBB8]/15 pb-8">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-medium block">
                  COMMISSION APPLICATION
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F1E8]">
                  BEGIN YOUR BESPOKE REQUEST
                </h2>
                <p className="text-xs text-[#D8CBB8]/70 font-sans max-w-xl">
                  Complete this dossier to schedule your private consultation. Our master shoemaker will review your aesthetic criteria and respond within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 font-sans">
                
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold">
                    01. CLIENT IDENTITY
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Adebayo Adeleke"
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="client@domain.com"
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Phone / WhatsApp *</label>
                      <input
                        type="text"
                        required
                        value={formData.phoneWhatsApp}
                        onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                        placeholder="+234 or Country Code"
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Footwear Criteria */}
                <div className="space-y-4 pt-4 border-t border-[#D8CBB8]/10">
                  <h3 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold">
                    02. FOOTWEAR SPECIFICATIONS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Preferred Silhouette</label>
                      <select
                        value={formData.shoeType}
                        onChange={(e) => setFormData({ ...formData, shoeType: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                      >
                        <option>Oxford Wholecut</option>
                        <option>Belgian Tassel Loafer</option>
                        <option>Double Monkstrap</option>
                        <option>Chelsea Boot</option>
                        <option>Bespoke Artisan Sandal</option>
                        <option>Full Brogue Derby</option>
                        <option>One-of-One Custom Concept</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Leather & Tannery Preference</label>
                      <select
                        value={formData.materialPreference}
                        onChange={(e) => setFormData({ ...formData, materialPreference: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                      >
                        <option>French Full-Grain Box Calf</option>
                        <option>Italian Reverse Suede</option>
                        <option>Oil-Infused Pull-Up Leather</option>
                        <option>Vegetal-Tanned Harness Leather</option>
                        <option>Exotic Skin (Consultation Required)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Color / Patina Direction</label>
                      <input
                        type="text"
                        value={formData.colorPreference}
                        onChange={(e) => setFormData({ ...formData, colorPreference: e.target.value })}
                        placeholder="e.g. Deep Espresso, Obsidian Black, Tobacco Cognac"
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Size (EU / UK) or Custom Last</label>
                      <select
                        value={formData.footSize}
                        onChange={(e) => setFormData({ ...formData, footSize: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                      >
                        {[39, 40, 41, 42, 43, 44, 45, 46, 47].map((s) => (
                          <option key={s}>EU {s}</option>
                        ))}
                        <option>Custom Hand-Carved Last (Personal Foot Map)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Occasion / Context</label>
                      <select
                        value={formData.occasion}
                        onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                      >
                        <option>Executive / Corporate Presence</option>
                        <option>Black Tie Wedding / State Gala</option>
                        <option>Traditional / Native Ceremonial Attire</option>
                        <option>Daily Discretion & Casual Luxury</option>
                        <option>Heirloom Collector Commission</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Anticipated Budget Range</label>
                      <select
                        value={formData.budgetRange}
                        onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                      >
                        <option>₦200,000 – ₦300,000 ($260 - $400)</option>
                        <option>₦300,000 – ₦500,000 ($400 - $660)</option>
                        <option>₦500,000+ (Full Custom Last + Exotic / Fine Calf)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Details & Image Upload */}
                <div className="space-y-4 pt-4 border-t border-[#D8CBB8]/10">
                  <h3 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold">
                    03. PERSONAL FIT NOTES & INSPIRATION
                  </h3>
                  
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">
                      Anatomical Notes or Unique Aesthetic Requirements
                    </label>
                    <textarea
                      rows={4}
                      value={formData.additionalDetails}
                      onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                      placeholder="e.g. Higher instep, preference for bevelled waist with brass toe taps, wedding date, monogramming initials..."
                      className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>

                  {/* Upload placeholder */}
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">
                      Upload Inspiration or Outfit Reference (Optional)
                    </label>
                    <div 
                      onClick={() => setUploadedFile('Client_Inspiration_Reference.jpg')}
                      className="border border-dashed border-[#D8CBB8]/30 hover:border-[#B89B5E] p-6 text-center cursor-pointer bg-[#161616] transition-colors"
                    >
                      <Upload className="w-6 h-6 text-[#B89B5E] mx-auto mb-2" />
                      <p className="text-xs text-[#D8CBB8]/80 font-medium">
                        {uploadedFile ? (
                          <span className="text-[#B89B5E] flex items-center justify-center gap-1">
                            <FileCheck className="w-4 h-4" /> Attached: {uploadedFile}
                          </span>
                        ) : (
                          "Click to attach moodboard, shoe reference photo, or fabric swatch"
                        )}
                      </p>
                      <p className="text-[10px] text-[#D8CBB8]/40 mt-1">
                        PNG, JPG, or PDF up to 25MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-6 border-t border-[#D8CBB8]/15 space-y-3 text-center">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.25em] uppercase hover:bg-[#D4BD86] transition-all shadow-xl"
                  >
                    SUBMIT BESPOKE REQUEST
                  </button>
                  <p className="text-[11px] text-[#D8CBB8]/50 italic">
                    Strict confidentiality maintained. We never share client profiles or shoe last measurements.
                  </p>
                </div>

              </form>
            </>
          ) : (
            /* Confirmation Screen */
            <div className="py-8 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 border-2 border-[#B89B5E] mx-auto flex items-center justify-center bg-[#181818]">
                <Check className="w-8 h-8 text-[#B89B5E]" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-medium">
                  APPLICATION CONFIRMED
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F1E8]">
                  REQUEST REGISTERED WITH NELSON ATELIER
                </h2>
                <p className="text-xs text-[#B89B5E] font-mono">
                  REFERENCE ID: {inquiryId}
                </p>
              </div>

              <div className="p-6 bg-[#161616] border border-[#D8CBB8]/15 max-w-lg mx-auto text-left space-y-2 text-xs font-sans text-[#D8CBB8]/80">
                <p>• <strong className="text-[#F5F1E8]">Client:</strong> {formData.fullName}</p>
                <p>• <strong className="text-[#F5F1E8]">Selected Piece:</strong> {formData.shoeType}</p>
                <p>• <strong className="text-[#F5F1E8]">Leather & Patina:</strong> {formData.materialPreference} ({formData.colorPreference})</p>
                <p>• <strong className="text-[#F5F1E8]">Size / Last:</strong> {formData.footSize}</p>
                <p>• <strong className="text-[#F5F1E8]">Occasion:</strong> {formData.occasion}</p>
              </div>

              <p className="text-xs text-[#D8CBB8]/70 max-w-md mx-auto font-sans leading-relaxed">
                Thank you for your commission application. To expedite your consultation and lock in your atelier bench allocation, transmit this dossier directly to Nelson on WhatsApp below:
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={getConfirmationWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>TRANSMIT VIA WHATSAPP</span>
                </a>

                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3.5 bg-transparent border border-[#D8CBB8]/20 text-xs tracking-[0.2em] uppercase text-[#D8CBB8] hover:text-[#F5F1E8]"
                >
                  CREATE ANOTHER REQUEST
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
