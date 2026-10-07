import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  MessageCircle, 
  Upload, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Compass,
  FileCheck,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { getWhatsAppUrl } from '../data/config';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { submitBespokeInquiryToFirestore, uploadBespokeReferenceToStorage } from '../services/firebase';
import type { BespokeReferenceAsset } from '../types';
import { SeoHead } from '../components/common/SeoHead';

export const BespokePage: React.FC = () => {
  const { customerUser, profile } = useCustomerAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || customerUser?.displayName || '',
    email: customerUser?.email || '',
    phoneWhatsApp: profile?.phone || '',
    country: 'Nigeria',
    city: 'Lagos',
    shoeType: 'Oxford Wholecut',
    colorPreference: 'Espresso & Burgundy Patina',
    materialPreference: 'French Full-Grain Box Calf',
    solePreference: 'Oak-Bark Vegetable Tanned Leather Sole',
    constructionPreference: 'hand-welted' as 'hand-welted' | 'goodyear-welted' | 'norvegese' | 'blake-rapid',
    occasion: 'Executive / Corporate Presence',
    footSize: 'EU 42',
    fittingPreference: 'atelier-measurement' as 'standard-size' | 'atelier-measurement' | 'virtual-consultation',
    budgetRange: '₦300,000 – ₦500,000 ($400 - $660)',
    monogramInitials: '',
    additionalDetails: '',
  });

  const [referenceImages, setReferenceImages] = useState<BespokeReferenceAsset[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryId, setInquiryId] = useState('');
  const [inquiryReference, setInquiryReference] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadError(null);

    try {
      const asset = await uploadBespokeReferenceToStorage(file, customerUser?.uid);
      setReferenceImages(prev => [
        ...prev,
        {
          id: `ref_${Date.now()}`,
          name: asset.name,
          url: asset.url,
          storagePath: asset.storagePath,
          contentType: asset.contentType,
          sizeBytes: asset.sizeBytes,
          uploadedAt: new Date().toISOString(),
          uploadedByUid: customerUser?.uid
        }
      ]);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadError(err?.message || 'Failed to upload inspiration image. Please choose a JPEG or PNG under 10MB.');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phoneWhatsApp,
      country: formData.country,
      city: formData.city,
      specifications: {
        silhouette: formData.shoeType,
        leatherType: formData.materialPreference,
        colorPreference: formData.colorPreference,
        solePreference: formData.solePreference,
        constructionPreference: formData.constructionPreference,
        footSize: formData.footSize,
        fittingPreference: formData.fittingPreference,
        occasion: formData.occasion,
        budgetRange: formData.budgetRange,
        monogramInitials: formData.monogramInitials ? formData.monogramInitials.trim().toUpperCase() : undefined,
        specialRequests: formData.additionalDetails
      },
      referenceImages
    };

    try {
      let idToken: string | undefined;
      if (customerUser) {
        try {
          idToken = await customerUser.getIdToken();
        } catch {}
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const res = await fetch('/api/create-bespoke-inquiry', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setInquiryId(data.inquiryId || `NS-BESP-${Date.now()}`);
        setInquiryReference(data.inquiryReference || data.inquiryId);
        setSubmitted(true);
        return;
      }

      // If server returns error, attempt fallback or display error
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create bespoke inquiry via atelier server.');
    } catch (err: any) {
      console.warn('Server endpoint error, attempting client Firestore persistence fallback:', err);
      try {
        const fallbackRef = `NS-BESPOKE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const docId = await submitBespokeInquiryToFirestore({
          fullName: formData.fullName,
          email: formData.email,
          phoneOrWhatsApp: formData.phoneWhatsApp,
          country: formData.country,
          city: formData.city,
          silhouette: formData.shoeType,
          leatherType: formData.materialPreference,
          colorPreference: formData.colorPreference,
          footSize: formData.footSize,
          occasion: formData.occasion,
          budgetRange: formData.budgetRange,
          specialRequests: formData.additionalDetails,
          fittingPreference: formData.fittingPreference,
          customerUid: customerUser?.uid
        });

        setInquiryId(docId || fallbackRef);
        setInquiryReference(fallbackRef);
        setSubmitted(true);
      } catch (fallbackErr: any) {
        setSubmitError(fallbackErr?.message || err?.message || 'Could not submit your commission dossier. Please contact atelier concierge.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfirmationWhatsAppMessage = () => {
    const refCode = inquiryReference || inquiryId;
    let msg = `*NEW BESPOKE INQUIRY: ${refCode}*\n`;
    msg += `------------------------------------\n`;
    msg += `*Name:* ${formData.fullName}\n`;
    msg += `*WhatsApp:* ${formData.phoneWhatsApp}\n`;
    msg += `*Email:* ${formData.email}\n`;
    msg += `*Shoe Silhouette:* ${formData.shoeType}\n`;
    msg += `*Color / Patina:* ${formData.colorPreference}\n`;
    msg += `*Leather:* ${formData.materialPreference}\n`;
    msg += `*Sole & Welt:* ${formData.solePreference} (${formData.constructionPreference})\n`;
    msg += `*Size:* ${formData.footSize}\n`;
    msg += `*Fitting Mode:* ${formData.fittingPreference}\n`;
    if (formData.monogramInitials) {
      msg += `*Monogram:* ${formData.monogramInitials}\n`;
    }
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
      <SeoHead
        title="Bespoke Footwear Commission | Nelson Shoes Atelier"
        description="Initiate a private bespoke footwear commission with the Nelson Shoes Lagos atelier. Hand-carved anatomical wooden lasts, French full-grain calfskin, and bespoke cordwaining."
        canonicalPath="/bespoke"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Bespoke Atelier", url: "/bespoke" }
        ]}
      />
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

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#D8CBB8]/60 font-mono">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#B89B5E]" />
                <span>Hand-Carved Lasts</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B89B5E]" />
                <span>3–6 Weeks Bench Time</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B89B5E]" />
                <span>Hand-Welted Inseam</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            THE PROCESS TIMELINE
        ======================================================== */}
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#B89B5E] font-medium block">
              ANATOMICAL METHODOLOGY
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#F5F1E8]">
              The Bespoke Journey
            </h2>
            <p className="text-xs text-[#D8CBB8]/60 font-sans">
              From our first private dialogue to the permanent archiving of your personal wooden last.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {timelineSteps.map((step, index) => (
              <div 
                key={index} 
                className="bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 p-6 rounded-lg space-y-3 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="font-mono text-xs text-[#B89B5E] block">
                    STEP {step.num}
                  </span>
                  <h3 className="font-serif text-lg text-[#F5F1E8] font-normal tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            THE COMMISSION FORM / INTAKE EXPERIENCE
        ======================================================== */}
        <div id="commission-form" className="scroll-mt-28">
          <div className="max-w-3xl mx-auto bg-[#121212] border border-[#D8CBB8]/20 rounded-xl p-8 md:p-12 shadow-2xl space-y-8">
            
            <div className="border-b border-[#D8CBB8]/15 pb-6 text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#B89B5E] block">
                ATELIER CONSULTATION DOSSIER
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-[#F5F1E8]">
                Bespoke Commission Intake
              </h2>
              <p className="text-xs text-[#D8CBB8]/70 font-sans max-w-md mx-auto">
                Share your footwear preferences. Our master cordwainer will review your specifications, prepare an authoritative quotation, and contact you for fitting calibrations.
              </p>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#B89B5E]/20 border border-[#B89B5E] flex items-center justify-center mx-auto text-[#B89B5E]">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#B89B5E]">
                    COMMISSION DOSSIER RECEIVED
                  </span>
                  <h3 className="font-serif text-2xl text-[#F5F1E8]">
                    Reference: {inquiryReference || inquiryId}
                  </h3>
                  <p className="text-xs text-[#D8CBB8]/70 max-w-md mx-auto font-sans leading-relaxed">
                    Thank you, <strong className="text-[#F5F1E8]">{formData.fullName}</strong>. Your bespoke commission specification has been transmitted directly to our Lagos workshop bench.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={getConfirmationWhatsAppMessage()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MessageCircle size={15} />
                    <span>Confirm via WhatsApp Concierge</span>
                  </a>

                  {customerUser && (
                    <Link
                      to="/account/bespoke"
                      className="w-full sm:w-auto px-6 py-3 bg-[#1A1A1A] hover:bg-[#222222] border border-[#D8CBB8]/20 text-[#F5F1E8] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span>View in Customer Portal</span>
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {submitError && (
                  <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-lg flex items-start gap-3 text-red-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* 01. Client Identity */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold font-mono">
                    01. CLIENT IDENTITY & CONTACT
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Adeyemi Adeleke"
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. adeyemi@domain.com"
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">WhatsApp / Telephone *</label>
                      <input
                        type="text"
                        required
                        value={formData.phoneWhatsApp}
                        onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                        placeholder="+234 or International code"
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">City & Country of Residence</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="City (e.g. Lagos)"
                          className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                        />
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="Country"
                          className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 02. The Silhouette & Craft */}
                <div className="space-y-4 pt-4 border-t border-[#D8CBB8]/10">
                  <h3 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold font-mono">
                    02. FOOTWEAR ARCHITECTURE & MATERIALS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Preferred Silhouette</label>
                      <select
                        value={formData.shoeType}
                        onChange={(e) => setFormData({ ...formData, shoeType: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
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
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
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
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Sole Preference</label>
                      <select
                        value={formData.solePreference}
                        onChange={(e) => setFormData({ ...formData, solePreference: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      >
                        <option>Oak-Bark Vegetable Tanned Leather Sole</option>
                        <option>Vibram Lugged Commando Rubber</option>
                        <option>Dainite Studded Rubber Sole</option>
                        <option>Combination Leather & Rubber Inset</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Construction Technique</label>
                      <select
                        value={formData.constructionPreference}
                        onChange={(e) => setFormData({ ...formData, constructionPreference: e.target.value as any })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      >
                        <option value="hand-welted">Hand-Welted Inseam (True Master Bespoke)</option>
                        <option value="goodyear-welted">Goodyear Welted (Benchmade Standard)</option>
                        <option value="norvegese">Norvegese / Norwegian Braided Welt</option>
                        <option value="blake-rapid">Blake-Rapid (Sleek Italian Profile)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Occasion / Context</label>
                      <select
                        value={formData.occasion}
                        onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      >
                        <option>Executive / Corporate Presence</option>
                        <option>Black Tie Wedding / State Gala</option>
                        <option>Traditional / Native Ceremonial Attire</option>
                        <option>Daily Discretion & Casual Luxury</option>
                        <option>Heirloom Bespoke Commission</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 03. Fit & Sizing */}
                <div className="space-y-4 pt-4 border-t border-[#D8CBB8]/10">
                  <h3 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold font-mono">
                    03. ANATOMICAL CALIBRATION & FIT MODE
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Standard Size Reference or Custom</label>
                      <select
                        value={formData.footSize}
                        onChange={(e) => setFormData({ ...formData, footSize: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      >
                        {[39, 40, 41, 42, 43, 44, 45, 46, 47].map((s) => (
                          <option key={s}>EU {s}</option>
                        ))}
                        <option>Custom Hand-Carved Last (Personal Foot Map)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Fitting Consultation Mode</label>
                      <select
                        value={formData.fittingPreference}
                        onChange={(e) => setFormData({ ...formData, fittingPreference: e.target.value as any })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      >
                        <option value="atelier-measurement">In-Person Atelier Consultation (Lagos Lounge)</option>
                        <option value="virtual-consultation">Virtual Dimensional Video Consultation</option>
                        <option value="standard-size">Standard Calibrated Size with Custom Accommodations</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Monogram / Personalized Initials (Optional)</label>
                      <input
                        id="monogramText"
                        name="monogramText"
                        type="text"
                        maxLength={5}
                        value={formData.monogramInitials}
                        onChange={(e) => setFormData({ ...formData, monogramInitials: e.target.value.toUpperCase() })}
                        placeholder="e.g. O.B."
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Anticipated Budget Range</label>
                      <select
                        value={formData.budgetRange}
                        onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                      >
                        <option>₦250,000 – ₦350,000 ($330 - $460)</option>
                        <option>₦350,000 – ₦500,000 ($460 - $660)</option>
                        <option>₦500,000+ (Full Hand-Carved Last + French Box Calf)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 04. Personal Fit Notes & Inspiration Assets */}
                <div className="space-y-4 pt-4 border-t border-[#D8CBB8]/10">
                  <h3 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold font-mono">
                    04. SARTORIAL NOTES & VISUAL INSPIRATION
                  </h3>
                  
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">
                      Anatomical Notes or Unique Aesthetic Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={formData.additionalDetails}
                      onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                      placeholder="e.g. Higher instep on left foot, preference for violin waist contours, brass toe taps, specific event milestone..."
                      className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                    />
                  </div>

                  {/* Real Firebase Storage Upload */}
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">
                      Upload Inspiration, Fabric Swatch, or Shoe Reference (Optional)
                    </label>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div 
                      onClick={() => !isUploadingFile && fileInputRef.current?.click()}
                      className={`border border-dashed p-6 text-center cursor-pointer bg-[#161616] rounded-lg transition-colors ${
                        isUploadingFile 
                          ? 'border-[#B89B5E] bg-[#1a1a1a]' 
                          : 'border-[#D8CBB8]/30 hover:border-[#B89B5E]'
                      }`}
                    >
                      {isUploadingFile ? (
                        <div className="space-y-2">
                          <Loader2 className="w-6 h-6 text-[#B89B5E] animate-spin mx-auto" />
                          <p className="text-xs text-[#B89B5E] font-mono">Uploading reference asset to atelier archive...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-[#B89B5E] mx-auto mb-2" />
                          <p className="text-xs text-[#D8CBB8]/80 font-medium">
                            Click to attach moodboard, shoe reference photo, or fabric swatch
                          </p>
                          <p className="text-[10px] text-[#D8CBB8]/40 mt-1 font-mono">
                            JPEG, PNG, WebP up to 10MB
                          </p>
                        </>
                      )}
                    </div>

                    {uploadError && (
                      <p className="text-xs text-red-400 mt-2 font-mono flex items-center gap-1">
                        <AlertCircle size={13} />
                        <span>{uploadError}</span>
                      </p>
                    )}

                    {/* Uploaded Images List */}
                    {referenceImages.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {referenceImages.map((img, idx) => (
                          <div key={img.id || idx} className="relative group rounded border border-[#D8CBB8]/20 overflow-hidden bg-[#181818] p-2 flex items-center gap-2">
                            <img src={img.url} alt={img.name} className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-[#F5F1E8] font-mono truncate">{img.name}</p>
                              <p className="text-[9px] text-[#D8CBB8]/50">{(img.sizeBytes / 1024).toFixed(0)} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="text-[#D8CBB8]/40 hover:text-red-400 p-1"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-6 border-t border-[#D8CBB8]/15 space-y-3 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-widest hover:bg-[#D4BD86] transition-colors rounded-lg flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Dossier to Atelier...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Bespoke Commission Dossier</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-[#D8CBB8]/40 font-mono">
                    Initial consultations are complimentary. Quoted prices require 50% deposit before wooden lasting commences.
                  </p>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
