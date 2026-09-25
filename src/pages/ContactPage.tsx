import React, { useState } from 'react';
import { 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Check, 
  ArrowRight, 
  ArrowUpRight,
  ShieldCheck 
} from 'lucide-react';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/config';
import { SectionHeading } from '../components/common/SectionHeading';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bespoke Footwear Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const generateContactWhatsAppUrl = () => {
    const msg = `*NEW CONTACT MESSAGE*\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;
    return getWhatsAppUrl(msg);
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-20">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
            DIRECT COMMUNICATIONS
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-[#F5F1E8] leading-tight">
            CONTACT THE ATELIER
          </h1>
          <p className="text-xs md:text-sm text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
            Whether inquiring about a bespoke commission, scheduling an atelier fitting, or discussing leather allocations, our cordwainers are at your service.
          </p>
        </div>

        {/* Contact Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-t border-[#D8CBB8]/15 pt-16">
          
          {/* Left Column: Direct Atelier Coordinates */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Primary WhatsApp Channel */}
            <div className="p-8 bg-[#121212] border border-[#B89B5E]/50 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[#B89B5E] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#B89B5E]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] font-semibold block">
                    FASTEST RESPONSE
                  </span>
                  <h3 className="font-serif text-xl text-[#F5F1E8]">
                    WhatsApp Direct Concierge
                  </h3>
                </div>
              </div>

              <p className="text-xs text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
                Direct channel to the shoemaker for instantaneous sizing questions, leather photographs, or bespoke consultation bookings.
              </p>

              <a
                href={getWhatsAppUrl("Hello Nelson Atelier, I would like to inquire about your bespoke footwear services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors flex items-center justify-center gap-2"
              >
                <span>OPEN WHATSAPP ATELIER</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Channels & Location */}
            <div className="space-y-6 text-xs font-sans">
              <div className="space-y-1.5 pb-6 border-b border-[#D8CBB8]/10">
                <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] block font-medium">
                  ATELIER SANCTUARY & CONSULTATIONS
                </span>
                <p className="text-[#F5F1E8] font-medium text-sm">
                  {BRAND_CONFIG.contact.workshopLocation.city}, {BRAND_CONFIG.contact.workshopLocation.country}
                </p>
                <p className="text-[#D8CBB8]/70">
                  {BRAND_CONFIG.contact.workshopLocation.addressNote}
                </p>
                <p className="text-[#B89B5E] text-[11px] pt-1">
                  {BRAND_CONFIG.contact.workshopLocation.shippingNote}
                </p>
              </div>

              <div className="space-y-1.5 pb-6 border-b border-[#D8CBB8]/10">
                <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] block font-medium">
                  ATELIER HOURS
                </span>
                <p className="text-[#D8CBB8]/80">
                  {BRAND_CONFIG.contact.operatingHours}
                </p>
              </div>

              <div className="space-y-1.5 pb-6 border-b border-[#D8CBB8]/10">
                <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] block font-medium">
                  VERIFIED SOCIAL MEDIA
                </span>
                <p>
                  <a 
                    href={BRAND_CONFIG.social.tiktok}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#B89B5E] hover:underline"
                  >
                    TikTok: {BRAND_CONFIG.social.tiktokHandle}
                  </a>
                </p>
                <p>
                  <a 
                    href={BRAND_CONFIG.social.instagram}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#D8CBB8]/70 hover:text-[#B89B5E]"
                  >
                    Instagram: {BRAND_CONFIG.social.instagramHandle}
                  </a>
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] block font-medium">
                  DIRECT EMAIL INQUIRIES
                </span>
                <p className="text-[#F5F1E8]">
                  {BRAND_CONFIG.contact.email}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Dossier Form */}
          <div className="lg:col-span-7 bg-[#121212] border border-[#D8CBB8]/15 p-8 md:p-12 space-y-6">
            
            <div className="space-y-2 border-b border-[#D8CBB8]/10 pb-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B89B5E] font-medium block">
                MESSAGE DOSSIER
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#F5F1E8]">
                SEND A WRITTEN INQUIRY
              </h2>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 or Country Code"
                      className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  >
                    <option>Bespoke Footwear Inquiry</option>
                    <option>Sizing & Last Guidance</option>
                    <option>Wedding & Ceremony Party Commission</option>
                    <option>International Shipping / Courier</option>
                    <option>Press & Editorial Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Message *</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details regarding your commission or questions..."
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-3.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors"
                  >
                    TRANSMIT MESSAGE TO ATELIER
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 border border-[#B89B5E] mx-auto flex items-center justify-center text-[#B89B5E]">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-[#F5F1E8]">
                  MESSAGE TRANSMITTED
                </h3>
                <p className="text-xs text-[#D8CBB8]/75 font-sans max-w-sm mx-auto">
                  Thank you, {formData.name}. Our master shoemaker has received your message and will reply shortly.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={generateContactWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-[#B89B5E] text-[#0A0A0A] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>ALSO SEND VIA WHATSAPP</span>
                  </a>

                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 border border-[#D8CBB8]/20 text-xs uppercase tracking-wider text-[#D8CBB8]"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
