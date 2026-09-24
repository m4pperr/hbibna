'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t, language } = useLanguage();

  const isAr = language === 'ar';

  const faqItems = [
    {
      question: isAr ? 'كيف تعمل منصة حبيبنا؟' : 'How does Hbibna work?',
      answer: isAr
        ? 'تمنح حبيبنا نشاطك التجاري برنامج ولاء رقمي فوري. يمكنك ضبط كيفية كسب النقاط (حسب المشتريات أو القيمة المنفقة بالدينار)، وتسجيل زيارات العملاء عند الكاونتر بسهولة، وإصدار النقاط فوراً. يجمع العميل النقاط على بطاقته الرقمية ويستبدلها بالمكافآت مباشرة في محلك.'
        : 'Hbibna gives your business an instant digital loyalty program. You configure how customers earn points (either per purchase or per amount spent in DA), record visits at checkout via our fast scanner or manual lookup, and award points. Customers collect points on their personal digital loyalty pass and redeem rewards directly at your counter.',
    },
    {
      question: isAr ? 'هل يمكنني تحديد طريقة احتساب النقاط الخاصة بي؟' : 'Can I choose my own points system?',
      answer: isAr
        ? 'نعم بكل تأكيد. تتيح لك المنصة ضبط معادلة النقاط بما يتناسب مع نشاطك، مثل نقطة واحدة لكل 100 د.ج ينفقها العميل، مع تحديد حد أدنى للشراء إذا رغبت. يمكنك تعديل هذه القواعد في أي وقت من لوحة التحكم.'
        : 'Yes, absolutely. Hbibna lets you customize how customers earn points (such as 1 point for every 100 DA spent). You can configure and update your points rules whenever you want from your dashboard.',
    },
    {
      question: isAr ? 'كيف يطلع العملاء على رصيد نقاطهم؟' : 'How do my customers check their points?',
      answer: isAr
        ? 'يستطيع العملاء فتح بطاقتهم الرقمية من أي متصفح هاتف ذكي. يشاهدون رصيدهم بوضوح، والمكافآت التي يمكنهم استبدالها حالياً، وسجل عملياتهم، بالإضافة إلى رمز QR الفريد الخاص بهم لإبرازه عند الدفع.'
        : 'Customers access their personal digital loyalty pass from any smartphone browser. They see their live points balance in large typography, the rewards they can currently afford, their recent transaction activity, and their unique QR code to present at checkout.',
    },
    {
      question: isAr ? 'هل يمكنني إنشاء مكافآتي الخاصة؟' : 'Can I create my own rewards?',
      answer: isAr
        ? 'نعم! لديك كامل الحرية في إضافة المكافآت التي تناسب عملاء متجرك—مثل قهوة مجانية، أو خصم 500 د.ج، أو علبة حلويات. أنت من يحدد اسم المكافأة وعدد النقاط المطلوبة للاستبدال.'
        : 'Yes! You have complete freedom to create rewards that delight your specific customers—such as a complimentary coffee, a free dessert, or a 500 DA discount voucher. You decide the reward title, description, and required points.',
    },
    {
      question: isAr ? 'كم تبلغ تكلفة الاشتراك في حبيبنا؟' : 'How much does Hbibna cost?',
      answer: isAr
        ? 'توفر حبيبنا خطتين واضحتين: الدفع الشهري بقيمة 9,800 د.ج شهرياً، أو الدفع السنوي بقيمة 98,000 د.ج سنوياً (مع توفير شهرين مجاناً). الباقة تشمل كل شيء: عملاء غير محدودين، معاملات غير محدودة، مسح رمز QR، وإدارة كاملة للمكافآت.'
        : 'Hbibna offers two straightforward billing options: Monthly at 9,800 DA / month, or Annual at 98,000 DA / year with 2 months FREE. Everything is included: unlimited customers, custom points rules, reward redemptions, customer management, QR code scanning, and isolated data security.',
    },
    {
      question: isAr ? 'هل يتعين على العملاء تثبيت تطبيق؟' : 'Do my customers need to download an app?',
      answer: isAr
        ? 'لا يحتاج العملاء أبداً إلى تحميل تطبيق من المتجر. تعمل بطاقة حبيبنا كتطبيق ويب خفيف وسريع، ويمكن للعميل حفظها على شاشة هاتفه الرئيسية لفتحها بلمسة واحدة عند الكاونتر.'
        : 'No, customers do not need to download or install a native app from the App Store or Google Play. Hbibna works through a fast, lightweight mobile-friendly web experience. Customers can simply bookmark their pass or save it to their home screen for immediate 1-tap access at your counter.',
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E6DDCF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-[#B88E3E] bg-[#FBF6EB] px-3.5 py-1 rounded-full border border-[#DFC99F]/50">
            {t('nav.faq')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191817] tracking-tight">
            {isAr ? 'الأسئلة الشائعة حول منصة حبيبنا' : 'Common questions about Hbibna'}
          </h2>
          <p className="text-sm text-[#736B63] max-w-lg mx-auto">
            {isAr
              ? 'كل ما تود معرفته حول إطلاق وتشغيل برنامج الولاء لمتجرك.'
              : 'Everything you need to know about setting up and running your loyalty program.'}
          </p>
        </div>

        <div className="space-y-3.5">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'border-[#B88E3E] bg-[#FBF6EB]/30 shadow-xs'
                    : 'border-[#E6DDCF] bg-[#FFFFFF] hover:border-[#DFC99F]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 text-start flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-base text-[#191817]">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#B88E3E] text-white rotate-180'
                        : 'bg-[#FAF8F5] text-[#736B63] border border-[#E6DDCF]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#736B63] leading-relaxed border-t border-[#E6DDCF]/60 animate-in fade-in duration-150">
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
