import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  CheckCircle2, 
  X, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';
import type { CustomerAddress } from '../../types';

export const CustomerAddressesPage: React.FC = () => {
  const { 
    addresses, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
  } = useCustomerAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingAddress(null);
    setRecipientName('');
    setPhone('');
    setAddressLine('');
    setCity('');
    setState('');
    setCountry('Nigeria');
    setPostalCode('');
    setIsDefault(addresses.length === 0); // First address is default by default
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setRecipientName(addr.recipientName);
    setPhone(addr.phone);
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setState(addr.state);
    setCountry(addr.country);
    setPostalCode(addr.postalCode || '');
    setIsDefault(addr.isDefault);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          addressLine: addressLine.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          postalCode: postalCode.trim(),
          isDefault
        });
      } else {
        await addAddress({
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          addressLine: addressLine.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          postalCode: postalCode.trim(),
          isDefault
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Could not save address. Please verify the form and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this delivery address?')) {
      await deleteAddress(id);
    }
  };

  return (
    <CustomerPortalLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-widest text-[#B89B5E] block">
              DISPATCH DESTINATIONS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#F5F1E8]">
              Address Book ({addresses.length})
            </h2>
            <p className="text-xs text-[#D8CBB8]/70 font-sans">
              Manage international and domestic delivery destinations for your bespoke and ready-to-wear orders.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-lg"
          >
            <Plus size={14} />
            <span>Add Delivery Address</span>
          </button>
        </div>

        {/* ========================================================
            ADDRESS MODAL (ADD / EDIT)
        ======================================================== */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#121212] border border-[#D8CBB8]/20 rounded-xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-[#D8CBB8]/50 hover:text-[#F5F1E8] transition-colors p-1"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#B89B5E] block">
                  {editingAddress ? 'EDIT ADDRESS' : 'NEW DESTINATION'}
                </span>
                <h3 className="font-serif text-xl text-[#F5F1E8]">
                  {editingAddress ? 'Update Delivery Address' : 'Add Delivery Address'}
                </h3>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg flex items-start gap-2 text-xs text-red-300 font-mono">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adekunle Gold"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+234..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                    Street Address Line *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 Marina Road, Victoria Island"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lagos"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lagos State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      placeholder="101241"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nigeria"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D8CBB8]/30 bg-[#181818] text-[#B89B5E] focus:ring-[#B89B5E] cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-xs text-[#F5F1E8] font-mono cursor-pointer select-none">
                    Set as default delivery address for all commissions
                  </label>
                </div>

                <div className="pt-4 border-t border-[#D8CBB8]/15 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-[#D8CBB8]/20 text-[#D8CBB8]/70 text-xs font-mono rounded hover:text-[#F5F1E8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded hover:bg-[#D4BD86] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                    <span>{isSubmitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Address Cards Grid */}
        {addresses.length === 0 ? (
          <div className="p-12 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-4">
            <MapPin className="w-10 h-10 text-[#B89B5E]/30 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-[#F5F1E8]">No delivery addresses saved</h3>
              <p className="text-xs text-[#D8CBB8]/60 font-sans max-w-sm mx-auto">
                Save your home or executive office addresses for swift DHL Express delivery across Nigeria and internationally.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-colors"
              >
                Add First Address
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-6 bg-[#121212] border rounded-xl space-y-4 transition-all flex flex-col justify-between ${
                  addr.isDefault 
                    ? 'border-[#B89B5E]/60 shadow-[0_0_20px_rgba(184,155,94,0.08)]' 
                    : 'border-[#D8CBB8]/15 hover:border-[#D8CBB8]/30'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif text-base text-[#F5F1E8] font-medium">
                      {addr.recipientName}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/40 font-semibold uppercase flex items-center gap-1">
                        <Check size={10} />
                        <span>DEFAULT</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs font-sans text-[#D8CBB8]/80 leading-relaxed">
                    <p>{addr.addressLine}</p>
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p>{addr.country}</p>
                    <p className="text-[11px] font-mono text-[#D8CBB8]/60 pt-1">Phone: {addr.phone}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D8CBB8]/10 flex items-center justify-between gap-2">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-[11px] font-mono text-[#B89B5E] hover:text-[#D4BD86] underline cursor-pointer"
                    >
                      Set as default
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Default destination
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#D8CBB8]/20 text-[#D8CBB8] hover:text-[#B89B5E] rounded transition-colors"
                      title="Edit address"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 bg-[#1A1A1A] hover:bg-red-950/30 border border-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors"
                      title="Delete address"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </CustomerPortalLayout>
  );
};
