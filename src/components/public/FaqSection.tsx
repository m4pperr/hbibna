'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface FaqSectionProps {
  variant?: 'default' | 'friendly';
}

export function FaqSection({ variant = 'default' }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t, language } = useLanguage();
  const isFriendly = variant === 'friendly';

  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const faqItems = [
    {
      question: isAr
        ? 'كيف تعمل منصة Hbibna؟'
        : isFr
        ? 'Comment fonctionne Hbibna ?'
        : 'How does Hbibna work?',
      answer: isAr
        ? 'تمنح Hbibna نشاطك التجاري برنامج ولاء رقمي فوري. يمكنك ضبط كيفية كسب النقاط (حسب المشتريات أو القيمة المنفقة بالدينار)، وتسجيل زيارات العملاء عند الكاونتر بسهولة، وإصدار النقاط فوراً. يجمع العميل النقاط على بطاقته الرقمية ويستبدلها بالمكافآت مباشرة في محلك.'
        : isFr
        ? 'Hbibna dote votre commerce d’un programme de fidélité numérique instantané. Vous définissez le mode d’attribution des points (par achat ou par montant dépensé en DA), enregistrez les passages en caisse via notre scanner rapide ou par recherche manuelle, et créditez les points immédiatement. Vos clients cumulent leurs points sur leur pass numérique et profitent de leurs récompenses directement à votre comptoir.'
        : 'Hbibna gives your business an instant digital loyalty program. You configure how customers earn points (either per purchase or per amount spent in DA), record visits at checkout via our fast scanner or manual lookup, and award points. Customers collect points on their personal digital loyalty pass and redeem rewards directly at your counter.',
    },
    {
      question: isAr
        ? 'هل يمكنني تحديد طريقة احتساب النقاط الخاصة بي؟'
        : isFr
        ? 'Puis-je personnaliser mon barème de points ?'
        : 'Can I choose my own points system?',
      answer: isAr
        ? 'نعم بكل تأكيد. تتيح لك المنصة ضبط معادلة النقاط بما يتناسب مع نشاطك، مثل نقطة واحدة لكل 100 د.ج ينفقها العميل، مع تحديد حد أدنى للشراء إذا رغبت. يمكنك تعديل هذه القواعد في أي وقت من لوحة التحكم.'
        : isFr
        ? 'Absolument. Hbibna vous permet de configurer sur mesure la règle de cumul (par exemple 1 point pour chaque 100 DA dépensés). Vous pouvez modifier vos règles de fidélité à tout moment depuis votre tableau de bord.'
        : 'Yes, absolutely. Hbibna lets you customize how customers earn points (such as 1 point for every 100 DA spent). You can configure and update your points rules whenever you want from your dashboard.',
    },
    {
      question: isAr
        ? 'كيف يطلع العملاء على رصيد نقاطهم؟'
        : isFr
        ? 'Comment mes clients consultent-ils leurs points ?'
        : 'How do my customers check their points?',
      answer: isAr
        ? 'يستطيع العملاء فتح بطاقتهم الرقمية من أي متصفح هاتف ذكي. يشاهدون رصيدهم بوضوح، والمكافآت التي يمكنهم استبدالها حالياً، وسجل عملياتهم، بالإضافة إلى رمز QR الفريد الخاص بهم لإبرازه عند الدفع.'
        : isFr
        ? 'Vos clients accèdent à leur pass fidélité numérique depuis n’importe quel navigateur mobile. Ils visualisent en temps réel leur solde de points, les récompenses accessibles, l’historique de leurs passages et leur code QR unique à présenter en caisse.'
        : 'Customers access their personal digital loyalty pass from any smartphone browser. They see their live points balance in large typography, the rewards they can currently afford, their recent transaction activity, and their unique QR code to present at checkout.',
    },
    {
      question: isAr
        ? 'هل يمكنني إنشاء مكافآتي الخاصة؟'
        : isFr
        ? 'Puis-je créer mes propres récompenses ?'
        : 'Can I create my own rewards?',
      answer: isAr
        ? 'نعم! لديك كامل الحرية في إضافة المكافآت التي تناسب عملاء متجرك—مثل قهوة مجانية، أو خصم 500 د.ج، أو علبة حلويات. أنت من يحدد اسم المكافأة وعدد النقاط المطلوبة للاستبدال.'
        : isFr
        ? 'Oui ! Vous créez en toute liberté des récompenses adaptées à votre clientèle : un café offert, un dessert gratuit, ou un bon d’achat de 500 DA. Vous définissez vous-même l’intitulé, la description et le nombre de points requis.'
        : 'Yes! You have complete freedom to create rewards that delight your specific customers—such as a complimentary coffee, a free dessert, or a 500 DA discount voucher. You decide the reward title, description, and required points.',
    },
    {
      question: isAr
        ? 'كم تبلغ تكلفة الاشتراك في Hbibna؟'
        : isFr
        ? 'Combien coûte Hbibna ?'
        : 'How much does Hbibna cost?',
      answer: isAr
        ? 'توفر Hbibna خطتين واضحتين: الدفع الشهري بقيمة 9,800 د.ج شهرياً، أو الدفع السنوي بقيمة 98,000 د.ج سنوياً (مع توفير شهرين مجاناً). الباقة تشمل كل شيء: عملاء غير محدودين، معاملات غير محدودة، مسح رمز QR، وإدارة كاملة للمكافآت.'
        : isFr
        ? 'Hbibna propose deux formules tarifaires transparentes : Mensuelle à 9 800 DA / mois, ou Annuelle à 98 000 DA / an (avec 2 mois offerts). Tout est inclus : clients illimités, règles de points sur mesure, échanges de récompenses, scan QR et sécurité des données isolées.'
        : 'Hbibna offers two straightforward billing options: Monthly at 9,800 DA / month, or Annual at 98,000 DA / year with 2 months FREE. Everything is included: unlimited customers, custom points rules, reward redemptions, customer management, QR code scanning, and isolated data security.',
    },
    {
      question: isAr
        ? 'هل يتعين على العملاء تثبيت تطبيق؟'
        : isFr
        ? 'Mes clients doivent-ils télécharger une application ?'
        : 'Do my customers need to download an app?',
      answer: isAr
        ? 'لا يحتاج العملاء أبداً إلى تحميل تطبيق من المتجر. تعمل بطاقة Hbibna كتطبيق ويب خفيف وسريع، ويمكن للعميل حفظها على شاشة هاتفه الرئيسية لفتحها بلمسة واحدة عند الكاونتر.'
        : isFr
        ? 'Non, vos clients n’ont aucune application à installer depuis l’App Store ou Google Play. Hbibna fonctionne via une application web mobile fluide et rapide. Les clients peuvent simplement ajouter leur pass à leur écran d’accueil pour y accéder en 1 clic au comptoir.'
        : 'No, customers do not need to download or install a native app from the App Store or Google Play. Hbibna works through a fast, lightweight mobile-friendly web experience. Customers can simply bookmark their pass or save it to their home screen for immediate 1-tap access at your counter.',
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className={`py-20 lg:py-28 ${
        isFriendly
          ? 'bg-transparent font-rounded border-t border-black/10'
          : 'bg-white border-b border-black/[0.06]'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span
            className={`text-xs uppercase font-black tracking-widest px-4 py-1.5 rounded-full inline-block ${
              isFriendly
                ? 'bg-black text-white shadow-md'
                : 'text-[#fe3144] bg-[#fcd7f3] border border-[#f7bfe9]'
            }`}
          >
            {t('nav.faq')}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
            {isAr
              ? 'الأسئلة الشائعة حول منصة Hbibna'
              : isFr
              ? 'Questions fréquentes sur Hbibna'
              : 'Common questions about Hbibna'}
          </h2>
          <p className="text-sm sm:text-base text-zinc-700 font-medium max-w-lg mx-auto">
            {isAr
              ? 'كل ما تود معرفته حول إطلاق وتشغيل برنامج الولاء لمتجرك.'
              : isFr
              ? 'Tout ce que vous devez savoir pour configurer et gérer votre programme de fidélité.'
              : 'Everything you need to know about setting up and running your loyalty program.'}
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className={`rounded-2xl border-2 transition-all overflow-hidden ${
                  isOpen
                    ? isFriendly
                      ? 'border-black bg-white shadow-[0_6px_0_#000]'
                      : 'border-[#fe3144]/60 bg-[#fcd7f3]/15 shadow-sm'
                    : isFriendly
                    ? 'border-black/15 bg-white hover:border-black/40 shadow-xs'
                    : 'border-black/[0.08] bg-white hover:border-[#fe3144]/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 text-start flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-black text-base sm:text-lg text-black">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? isFriendly
                          ? 'bg-black text-[#FFE600] rotate-180 shadow-xs'
                          : 'bg-[#fe3144] text-white rotate-180 shadow-xs'
                        : isFriendly
                        ? 'bg-zinc-100 text-black'
                        : 'bg-[#f3f1f3] text-[#8a7f80]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-zinc-700 font-medium leading-relaxed border-t border-black/10 animate-in fade-in duration-150">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
