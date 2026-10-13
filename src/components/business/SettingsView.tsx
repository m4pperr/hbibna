'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  Save,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Lock,
  Key,
  Users,
  Palette,
  ExternalLink,
  Copy,
  Check,
  Coins,
  Sparkles,
} from 'lucide-react';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { updateBusinessSettings } from '@/actions/business';
import { changePasswordAction } from '@/actions/auth';
import { useToast } from '@/components/ui/ToastProvider';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PhoneInput } from '@/components/common/PhoneInput';
import type { Business } from '@/types/database';

interface SettingsViewProps {
  business: Business;
}

const CATEGORIES = [
  'Café & Roastery',
  'Boulangerie & Pâtisserie',
  'Restaurant & Fast Food',
  'Institut de Beauté & Spa',
  'Prêt-à-porter & Mode',
  'Supermarché & Épicerie Fine',
  'High-Tech & Accessoires',
  'Fleuriste & Décoration',
  'Autre Commerce',
];

const BRAND_COLORS = [
  { name: 'Hbibna Jaune', hex: '#FFE600' },
  { name: 'Rose Sunset', hex: '#FF5A5F' },
  { name: 'Émeraude', hex: '#10B981' },
  { name: 'Bleu Royal', hex: '#2563EB' },
  { name: 'Violet Élite', hex: '#8B5CF6' },
  { name: 'Noir Onyx', hex: '#18181B' },
];

export function SettingsView({ business }: SettingsViewProps) {
  const { t } = useLanguage();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isPendingProfile, startProfileTransition] = useTransition();
  const [isPendingPassword, startPasswordTransition] = useTransition();

  // Business Profile & Operational State
  const [name, setName] = useState(business.name || '');
  const [email, setEmail] = useState(business.email || '');
  const [phone, setPhone] = useState(business.phone || '');
  const [category, setCategory] = useState(business.category || 'Café & Roastery');
  const [city, setCity] = useState(business.city || 'Alger');
  const [address, setAddress] = useState(business.address || '');
  const [instagram, setInstagram] = useState(business.instagram || '');
  const [whatsapp, setWhatsapp] = useState(business.whatsapp || '');
  const [brandColor, setBrandColor] = useState(business.brand_color || '#FFE600');
  const [openingHours, setOpeningHours] = useState(
    business.opening_hours || 'Dim - Jeu : 08h00 - 22h00 | Ven - Sam : 14h00 - 23h00'
  );

  // Security & Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Copy UUID
  const [copiedUuid, setCopiedUuid] = useState(false);

  const handleCopyUuid = () => {
    navigator.clipboard.writeText(business.id);
    setCopiedUuid(true);
    toastSuccess('Identifiant du commerce copié !');
    setTimeout(() => setCopiedUuid(false), 2000);
  };

  // Submit Business Profile & Operational Rules
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toastError('Le nom du commerce est obligatoire.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('category', category);
    formData.append('city', city);
    formData.append('address', address);
    formData.append('instagram', instagram);
    formData.append('whatsapp', whatsapp);
    formData.append('brand_color', brandColor);
    formData.append('opening_hours', openingHours);

    startProfileTransition(async () => {
      try {
        const res = await updateBusinessSettings(formData);
        if (res?.error) {
          toastError(res.error);
        } else {
          toastSuccess('Paramètres de l’établissement mis à jour avec succès.');
        }
      } catch {
        toastError('Erreur lors de la mise à jour des paramètres.');
      }
    });
  };

  // Submit Password Change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toastError('Veuillez renseigner votre mot de passe actuel.');
      return;
    }
    if (newPassword.length < 6) {
      toastError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Les mots de passe ne correspondent pas.');
      return;
    }

    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    startPasswordTransition(async () => {
      try {
        const res = await changePasswordAction(formData);
        if (res?.error) {
          toastError(res.error);
        } else {
          toastSuccess('Mot de passe modifié avec succès.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      } catch {
        toastError('Erreur lors du changement de mot de passe.');
      }
    });
  };

  return (
    <div className="max-w-4xl space-y-8 text-start font-rounded pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="px-3 py-0.5 rounded-full text-xs font-black bg-[#FFE600] border-2 border-black shadow-[0_2px_0_#000]">
            Configuration Générale
          </span>
          <span className="text-xs font-bold text-black/60">
            Profil & Sécurité
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Paramètres du Commerce
        </h1>
        <p className="text-sm text-black/70 font-bold mt-1">
          Configurez l’identité de votre marque, vos coordonnées publiques et la sécurité de vos accès.
        </p>
      </div>

      {/* 1. Business Profile Form */}
      <form
        onSubmit={handleProfileSubmit}
        className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b-2 border-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF9D2] border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-black">Profil & Image de Marque</h3>
              <p className="text-xs text-black/60 font-bold">
                Ces informations sont affichées sur les cartes Apple/Google Wallet de vos clients
              </p>
            </div>
          </div>

          <div
            className="w-8 h-8 rounded-full border-2 border-black shadow-[0_2px_0_#000]"
            style={{ backgroundColor: brandColor }}
            title="Aperçu couleur de marque"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Business Name */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Nom de l&apos;Établissement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Secteur d&apos;Activité
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Color Selector */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Palette className="w-4 h-4" />
              Couleur Principale de la Carte Wallet
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {BRAND_COLORS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setBrandColor(col.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black transition-all cursor-pointer ${
                    brandColor === col.hex
                      ? 'bg-black text-[#FFE600] shadow-[0_3px_0_#000] scale-105'
                      : 'bg-white text-black hover:bg-neutral-50 shadow-[0_2px_0_#000]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              ))}
              <div className="flex items-center gap-2 pl-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border-2 border-black cursor-pointer bg-transparent"
                />
                <span className="font-mono text-xs font-black text-black">{brandColor}</span>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Numéro de Contact (Mobile / Caisse)
            </label>
            <PhoneInput
              name="phone"
              value={phone}
              onChange={setPhone}
              placeholder="550 12 34 56"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Email Professionnel
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@commerce.dz"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* City / Wilaya */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Ville / Wilaya
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Alger, Oran, Constantine..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Adresse Physique
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="12 Rue Didouche Mourad"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
              Compte Instagram (@handle)
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@moncommerce_dz"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Numéro WhatsApp Professionnel
            </label>
            <PhoneInput
              name="whatsapp"
              value={whatsapp}
              onChange={setWhatsapp}
              placeholder="550 12 34 56"
            />
          </div>
        </div>

        {/* Operational Rules */}
        <div className="pt-4 border-t-2 border-black/10 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-black" />
            <h4 className="font-black text-sm text-black">Horaires & Fonctionnement Opérationnel</h4>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Horaires d&apos;Ouverture Publics
            </label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="Dim - Jeu : 08h00 - 22h00 | Ven : 14h00 - 23h00"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Loyalty shortcut banner */}
          <div className="p-4 rounded-2xl bg-[#FFE600] border-2 border-black shadow-[0_3px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-black" />
              <div>
                <p className="font-black text-xs text-black">Règle de conversion des points</p>
                <p className="text-[11px] text-black/80 font-bold">
                  Par défaut : 10 points attribués pour chaque 100 DA encaissés.
                </p>
              </div>
            </div>
            <Link
              href="/loyalty"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-[#FFE600] text-xs font-black hover:bg-neutral-800 transition-colors shrink-0"
            >
              <span>Personnaliser le barème</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPendingProfile}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFE600] hover:bg-yellow-400 active:translate-y-1 active:shadow-none text-black text-sm font-black border-2 border-black shadow-[0_4px_0_#000] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isPendingProfile ? 'Enregistrement...' : 'Enregistrer les Modifications'}</span>
          </button>
        </div>
      </form>

      {/* 2. Security & Credentials Section */}
      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-6"
      >
        <div className="flex items-center gap-3 pb-3 border-b-2 border-black/10">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            <Key className="w-5 h-5 text-rose-600 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-lg text-black">Sécurité & Mot de Passe</h3>
            <p className="text-xs text-black/60 font-bold">
              Mettez à jour vos identifiants pour sécuriser l&apos;accès à votre tableau de bord
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Mot de passe actuel <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 caractères"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPendingPassword}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-black hover:bg-neutral-800 text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4 stroke-[2.5]" />
            <span>{isPendingPassword ? 'Modification...' : 'Changer le Mot de Passe'}</span>
          </button>
        </div>
      </form>

      {/* 3. Team & Cashier Permissions Overview */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-200 border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-lg text-black">Gestion des Accès Caisse & Rôles</h3>
            <p className="text-xs text-black/60 font-bold">
              Cloisonnement sécurisé entre le propriétaire et les caissiers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black shadow-[0_3px_0_#000] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase text-black">Rôle Gérant / Admin</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black text-[#FFE600]">
                Accès Total
              </span>
            </div>
            <p className="text-xs text-black/75">
              Accès aux rapports financiers, changement d&apos;abonnement, configuration des récompenses et modification du profil.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black shadow-[0_3px_0_#000] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase text-black">Rôle Caissier / Scanner</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                Scan Uniquement
              </span>
            </div>
            <p className="text-xs text-black/75">
              Permet uniquement de scanner le QR code du client pour créditer/débiter les points sans accès aux réglages du compte.
            </p>
          </div>
        </div>

        {/* Tenant UUID Badge */}
        <div className="p-4 rounded-2xl bg-neutral-50 border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_3px_0_#000] mt-3">
          <div className="flex items-center gap-2 font-mono text-xs text-black/70">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Identifiant Établissement (ID) :</span>
            <span className="text-black font-black bg-white px-2.5 py-1 rounded-lg border border-black">
              {business.id}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyUuid}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFE600] text-black text-xs font-black border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
          >
            {copiedUuid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUuid ? 'Copié' : 'Copier l’ID'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
