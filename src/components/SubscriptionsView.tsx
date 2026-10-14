import React from 'react';
import { 
  CalendarClock, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  ShieldAlert, 
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Subscription, Language, Currency } from '../types';
import { translations } from '../utils/translations';
import { formatCurrency } from '../utils/currency';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  lang: Language;
  currency: Currency;
  onOpenNewSubscription: () => void;
  onEditSubscription: (sub: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  lang,
  currency,
  onOpenNewSubscription,
  onEditSubscription,
  onDeleteSubscription,
  onToggleActive
}) => {
  const t = translations[lang];

  // Calculate monthly commitment: convert yearly/quarterly to monthly equivalent
  const activeSubs = subscriptions.filter(s => s.active);
  const totalMonthlyCost = activeSubs.reduce((sum, s) => {
    if (s.billingCycle === 'monthly') return sum + s.amount;
    if (s.billingCycle === 'yearly') return sum + s.amount / 12;
    if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
    return sum + s.amount;
  }, 0);

  const totalYearlyProjected = totalMonthlyCost * 12;
  const today = new Date();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">{t.subscriptions}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track software licenses, streaming, gym and campus services</p>
        </div>

        <button
          onClick={onOpenNewSubscription}
          aria-label={t.newSubscription}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
          <span>{t.newSubscription}</span>
        </button>
      </div>

      {/* Ethical Disclaimer Banner */}
      <div 
        role="note"
        aria-label="Student Tracking Notice"
        className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-300"
      >
        <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h2 className="font-semibold text-slate-100">{t.subNoticeTitle}</h2>
          <p className="text-slate-400 mt-0.5 leading-relaxed">{t.subNoticeDesc}</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">{t.totalMonthlyCommitment}</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(totalMonthlyCost, currency)}
            <span className="text-xs text-slate-400 font-normal"> / month</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across {activeSubs.length} active student plans
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Projected Annual Cost</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {formatCurrency(totalYearlyProjected, currency)}
            <span className="text-xs text-slate-400 font-normal"> / year</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Small recurring fees add up across academic semesters
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Tracking Status</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {activeSubs.length} <span className="text-sm font-normal text-slate-400">Active</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {subscriptions.length - activeSubs.length} paused or free student tier
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {subscriptions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <CalendarClock className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-200">{t.noSubscriptions}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{t.noSubscriptionsDesc}</p>
          <button
            onClick={onOpenNewSubscription}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t.newSubscription}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subscriptions.map(sub => {
            const renewal = new Date(sub.nextRenewalDate);
            const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isSoon = diffDays <= 5 && diffDays >= 0;

            return (
              <div 
                key={sub.id}
                className={`p-5 bg-slate-900 border rounded-xl flex flex-col justify-between transition-all ${
                  !sub.active 
                    ? 'opacity-60 border-slate-800' 
                    : isSoon 
                    ? 'border-amber-500/40 shadow-xs shadow-amber-500/10' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h2 className="font-semibold text-sm text-slate-100">{sub.name}</h2>
                      <span className="text-[11px] text-slate-400">{sub.category}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditSubscription(sub)}
                        aria-label={`${t.edit} ${sub.name}`}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
                        title={t.edit}
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => onDeleteSubscription(sub.id)}
                        aria-label={`${t.delete} ${sub.name}`}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {sub.notes && (
                    <p className="text-xs text-slate-400 mb-3 italic">{sub.notes}</p>
                  )}

                  {/* Pricing and Billing Cycle */}
                  <div className="my-3 flex items-baseline justify-between font-mono">
                    <div>
                      <span className="text-lg font-bold text-slate-100">
                        {formatCurrency(sub.amount, currency)}
                      </span>
                      <span className="text-xs text-slate-400 capitalize"> / {sub.billingCycle}</span>
                    </div>
                    {sub.billingCycle !== 'monthly' && (
                      <span className="text-[11px] text-slate-400">
                        (~{formatCurrency(sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount / 3, currency)}/mo)
                      </span>
                    )}
                  </div>

                  {/* Renewal Date & Countdown */}
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span>{sub.nextRenewalDate}</span>
                    </div>
                    <div>
                      {sub.active ? (
                        <span className={`font-semibold ${isSoon ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {diffDays <= 0 ? t.today : diffDays === 1 ? t.tomorrow : `${t.renewsIn} ${diffDays} ${t.days}`}
                        </span>
                      ) : (
                        <span className="text-slate-500">{t.paused}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Toggle: Active / Inactive with role=switch */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {sub.active ? t.active : t.paused}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={sub.active}
                    aria-label={`Toggle active tracking for ${sub.name}`}
                    onClick={() => onToggleActive(sub.id)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white focus-visible:rounded"
                  >
                    {sub.active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-600" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
