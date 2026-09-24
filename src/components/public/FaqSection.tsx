'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How does Hbibna work?',
    answer:
      'Hbibna gives your business an instant digital loyalty program. You configure how customers earn points (either per purchase or per amount spent in DA), record visits at checkout via our fast scanner or manual lookup, and award points. Customers collect points on their personal digital loyalty pass and redeem rewards directly at your counter.',
  },
  {
    question: 'Can I choose my own points system?',
    answer:
      'Yes, absolutely. Hbibna lets you choose between two flexible rule types: "Points per purchase" (e.g. 10 points on every visit) or "Points per amount spent" (e.g. 1 point for every 100 DA spent). You can configure and update your points rules whenever you want from your dashboard.',
  },
  {
    question: 'How do my customers check their points?',
    answer:
      'Customers access their personal digital loyalty pass from any smartphone browser. They see their live points balance in large typography, the rewards they can currently afford, their recent transaction activity, and their unique QR code to present at checkout.',
  },
  {
    question: 'Can I create my own rewards?',
    answer:
      'Yes! You have complete freedom to create rewards that delight your specific customers—such as a complimentary coffee, a free dessert, or a 500 DA discount voucher. You decide the reward title, description, and required points.',
  },
  {
    question: 'How much does Hbibna cost?',
    answer:
      'Hbibna offers two straightforward billing options: Monthly at 9,800 DA / month, or Annual at 98,000 DA / year with 2 months FREE. Everything is included: unlimited customers, custom points rules, reward redemptions, customer management, QR code scanning, and isolated data security. No hidden tiers, setup fees, or commissions.',
  },
  {
    question: 'Do my customers need to download an app?',
    answer:
      'No, customers do not need to download or install a native app from the App Store or Google Play. Hbibna works through a fast, lightweight mobile-friendly web experience. Customers can simply bookmark their pass or save it to their home screen for immediate 1-tap access at your counter.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E6DDCF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-[#B88E3E] bg-[#FBF6EB] px-3.5 py-1 rounded-full border border-[#DFC99F]/50">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191817] tracking-tight">
            Common questions about Hbibna
          </h2>
          <p className="text-sm text-[#736B63] max-w-lg mx-auto">
            Everything you need to know about setting up and running your loyalty program.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, index) => {
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
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
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
