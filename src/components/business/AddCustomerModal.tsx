'use client';

import { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2, Phone, Mail, User } from 'lucide-react';
import { createCustomer, type CreateCustomerResult } from '@/actions/customers';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCustomer, setSuccessCustomer] = useState<{ name: string; phone: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('email', email);

    try {
      const res: CreateCustomerResult = await createCustomer(formData);
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setSuccessCustomer({ name, phone });
        setTimeout(() => {
          onClose();
          setSuccessCustomer(null);
          setName('');
          setPhone('');
          setEmail('');
        }, 1400);
      }
    } catch {
      setError('An unexpected error occurred while adding the customer.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-card">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#E6DDCF] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[#191817] text-base leading-tight truncate">Add Customer</h3>
              <p className="text-[11px] text-[#736B63] truncate">Enroll member with 0 points balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#736B63] hover:text-[#191817] p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {successCustomer ? (
          <div className="p-6 sm:p-8 text-center space-y-3 overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-[#191817] text-xl">Customer Enrolled!</h4>
            <p className="text-xs text-[#736B63]">
              <span className="font-bold text-[#191817]">{successCustomer.name}</span> has been added to your loyalty program with <span className="font-bold text-[#B88E3E]">0 points</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#191817] mb-1.5">
                Customer Name <span className="text-[#B88E3E]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#736B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Sarah Benali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-[#191817] mb-1.5">
                Phone Number <span className="text-[#B88E3E]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#736B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="e.g. 0555 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                  required
                />
              </div>
              <p className="text-[11px] text-[#736B63] mt-1">
                Used to identify the customer and look up their loyalty card.
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-bold text-[#191817] mb-1.5">
                Email Address <span className="font-normal text-[#736B63]">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#736B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                />
              </div>
            </div>

            {/* Zero Points Starting Notice */}
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DDCF] flex items-center justify-between text-xs">
              <span className="text-[#736B63]">Starting Points Balance:</span>
              <span className="font-bold text-[#B88E3E]">0 points</span>
            </div>

            <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center border border-[#E6DDCF] sm:border-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#B88E3E] hover:bg-[#A37B30] rounded-xl shadow-soft disabled:opacity-50 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                {loading ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
