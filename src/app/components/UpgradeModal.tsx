import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  User, Clock, MapPin, ChevronLeft, ChevronRight, ChevronDown,
  X, Check, Calendar as CalendarIcon, Globe,
} from "lucide-react";

interface Props {
  open: boolean;
  /** Feature name being gated (kept for tracking; not shown prominently) */
  feature?: string;
  tagline?: string;
  bullets?: string[];
  onClose: () => void;
  /** Fires once the user finishes the contact form */
  onBook?: (details: BookingDetails) => void;
}

export interface BookingDetails {
  date: Date;
  time: string;
  timezone: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
}

const BRAND_PURPLE = "#4600F2";
const BRAND_PURPLE_SOFT = "rgba(70,0,242,0.10)";
const BRAND_PURPLE_MED  = "rgba(70,0,242,0.18)";

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
];

const TIMEZONES = [
  "Asia/Calcutta",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Australia/Sydney",
];

type Step = "pick" | "form" | "success";

/**
 * Calendly-style booking flow gated behind Pro features on Demo 3 (Lite plan).
 * Three steps inside the same shell: pick a slot → enter contact details →
 * confirmation. Left rail stays mounted across steps for visual continuity.
 */
export function UpgradeModal({ open, onClose, onBook }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date(), []);
  const [step, setStep] = useState<Step>("pick");
  const [viewYear, setViewYear]   = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>("Asia/Calcutta");
  const [tzOpen, setTzOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });

  // Reset to step 1 every time the modal opens
  useEffect(() => {
    if (open) {
      setStep("pick");
      setSelectedTime(null);
      setForm({ name: "", email: "", phone: "", company: "", notes: "" });
      setTzOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
    gsap.fromTo(
      panel,
      { y: 28, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  }, [open]);

  // Crossfade between steps
  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("upgrade-step-body");
    if (!main) return;
    gsap.fromTo(main, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" });
  }, [step, open]);

  if (!open) return null;

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();
  type Cell = { day: number; date: Date; isPast: boolean; isToday: boolean; isSelected: boolean };
  const cells: (Cell | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const isPast = date < todayMid;
    const isToday = date.getTime() === todayMid.getTime();
    const isSelected =
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate();
    cells.push({ day: d, date, isPast, isToday, isSelected });
  }

  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const selectedDateShort = selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const selectedWeekday = selectedDate.toLocaleDateString(undefined, { weekday: "long" });

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const canContinueFromPick = !!selectedTime;
  const canSubmitForm = form.name.trim() && form.email.trim() && form.phone.trim();

  const submitForm = () => {
    if (!canSubmitForm || !selectedTime) return;
    onBook?.({
      date: selectedDate,
      time: selectedTime,
      timezone,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setStep("success");
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-[20px] w-full max-w-[940px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.35)] flex"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[14px] right-[14px] z-10 size-[30px] rounded-full bg-white/95 hover:bg-black/5 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Close"
        >
          <X size={16} className="text-black/65" />
        </button>

        {/* LEFT RAIL — Spyne-branded meeting card (stays mounted across steps) */}
        <div className="w-[260px] shrink-0 relative bg-white">
          <div className="h-[120px]" style={{ background: `linear-gradient(135deg, ${BRAND_PURPLE} 0%, #6D32FF 100%)` }} />
          <div className="absolute left-[20px] top-[68px] size-[80px] rounded-full bg-white p-[3px] shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            <div
              className="size-full rounded-full flex items-center justify-center text-white text-[28px] font-bold font-['Inter:Bold',sans-serif]"
              style={{ background: "linear-gradient(135deg, #FF7E5F 0%, #FE5C7A 60%, #B651D7 100%)" }}
            >
              J
            </div>
          </div>
          <div className="px-[20px] pt-[44px] pb-[20px]">
            <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[24px]">
              Discovery Call
            </h2>
            <p className="mt-[6px] text-[12.5px] text-black/55 font-['Inter:Regular',sans-serif] leading-[16px]">
              Schedule a call to get started!
            </p>
            <div className="mt-[18px] space-y-[10px]">
              <Detail icon={<User size={14} className="text-black/55" strokeWidth={2} />}>Jessica</Detail>
              <Detail icon={<Clock size={14} className="text-black/55" strokeWidth={2} />}>30 minutes</Detail>
              <Detail icon={<MapPin size={14} className="text-black/55" strokeWidth={2} />}>Google Meet</Detail>
              {(step === "form" || step === "success") && (
                <>
                  <Detail icon={<CalendarIcon size={14} className="text-black/55" strokeWidth={2} />}>
                    {selectedDateShort} · {selectedTime}
                  </Detail>
                  <Detail icon={<Globe size={14} className="text-black/55" strokeWidth={2} />}>{timezone}</Detail>
                </>
              )}
            </div>
          </div>
          <div className="absolute bottom-[16px] left-[20px] right-[20px] flex items-center gap-[6px]">
            <span className="text-[10px] text-black/45 font-['Inter:Medium',sans-serif] font-medium">Powered by</span>
            <span
              className="text-[13px] font-bold font-['Inter:Bold',sans-serif] leading-none"
              style={{
                background: "linear-gradient(90deg, #FFCC00, #FF7700, #FF003D, #B651D7, #4600F2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              spyne
            </span>
          </div>
        </div>

        <div className="w-px bg-black/10" />

        {/* RIGHT — step-specific body */}
        <div id="upgrade-step-body" className="flex-1 flex">
          {step === "pick" && (
            <>
              {/* Calendar */}
              <div className="flex-1 px-[28px] py-[24px]">
                <div className="flex items-center justify-between mb-[16px]">
                  <h3 className="text-[16px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
                    {monthLabel}
                  </h3>
                  <div className="flex items-center gap-[6px]">
                    <NavBtn onClick={goPrev} aria="Previous month"><ChevronLeft size={14} /></NavBtn>
                    <NavBtn onClick={goNext} aria="Next month"><ChevronRight size={14} /></NavBtn>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-y-[6px] text-center mb-[6px]">
                  {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => (
                    <div key={d} className="text-[10px] font-bold text-black/40 uppercase tracking-[0.8px] font-['Inter:Bold',sans-serif]">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-[4px] gap-x-[2px]">
                  {cells.map((c, i) => {
                    if (!c) return <div key={`pad-${i}`} />;
                    const { day, date, isPast, isToday, isSelected } = c;
                    const base = "mx-auto size-[36px] rounded-full flex items-center justify-center text-[13px] transition-colors";
                    if (isPast) {
                      return (
                        <div key={i} className={`${base} text-black/30 font-medium cursor-default`}>
                          {day}
                        </div>
                      );
                    }
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                        className={`${base} ${isSelected ? "text-white font-bold" : "text-[#4600F2] font-semibold hover:bg-[rgba(70,0,242,0.18)]"}`}
                        style={{ background: isSelected ? BRAND_PURPLE : isToday ? BRAND_PURPLE_MED : BRAND_PURPLE_SOFT }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Timezone */}
                <div className="mt-[18px] relative inline-block">
                  <button
                    type="button"
                    onClick={() => setTzOpen((o) => !o)}
                    className="inline-flex items-center gap-[6px] text-[12px] text-black/65 font-['Inter:Medium',sans-serif] font-medium hover:text-black/85"
                  >
                    <Globe size={12} className="text-black/45" />
                    {timezone}
                    <ChevronDown size={13} className="text-black/45" />
                  </button>
                  {tzOpen && (
                    <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-[200px] bg-white rounded-[10px] border border-black/10 shadow-[0_12px_28px_rgba(0,0,0,0.15)] py-[6px]">
                      {TIMEZONES.map((tz) => (
                        <button
                          key={tz}
                          type="button"
                          onClick={() => { setTimezone(tz); setTzOpen(false); }}
                          className={`w-full text-left px-[12px] py-[7px] text-[12px] font-['Inter:Medium',sans-serif] hover:bg-[rgba(70,0,242,0.06)] ${
                            tz === timezone ? "text-[#4600F2] font-semibold" : "text-[#1F2937] font-medium"
                          }`}
                        >
                          {tz}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Time slots */}
              <div className="w-[230px] shrink-0 px-[16px] py-[24px] border-l border-black/10 flex flex-col">
                <p className="text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
                  {selectedDateShort}
                  <span className="ml-[6px] text-black/40 font-medium">{selectedWeekday}</span>
                </p>
                <div className="mt-[14px] space-y-[8px] flex-1 overflow-y-auto pr-[4px]">
                  {TIME_SLOTS.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`w-full h-[40px] rounded-[10px] border text-[13px] font-semibold transition-colors font-['Inter:Semi_Bold',sans-serif] ${
                          isSelected
                            ? "bg-[#4600F2] border-[#4600F2] text-white"
                            : "bg-white border-black/10 text-[#0a0a0a] hover:border-[#4600F2] hover:bg-[rgba(70,0,242,0.04)]"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => canContinueFromPick && setStep("form")}
                  disabled={!canContinueFromPick}
                  className="mt-[12px] h-[40px] w-full rounded-[10px] text-[13px] font-semibold text-white font-['Inter:Semi_Bold',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed bg-[#4600F2] hover:bg-[#3a00d0] transition-colors"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === "form" && (
            <div className="flex-1 px-[32px] py-[26px] flex flex-col">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#4600F2] mb-[6px] font-['Inter:Bold',sans-serif]">
                  Step 2 of 3 — Your details
                </p>
                <h3 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[24px]">
                  Tell us where to send the invite
                </h3>
                <p className="mt-[3px] text-[12.5px] text-black/55 font-['Inter:Regular',sans-serif]">
                  {selectedDateShort} · {selectedTime} · {timezone}
                </p>
              </div>

              <div className="mt-[20px] grid grid-cols-2 gap-[12px]">
                <Field label="Full name *" value={form.name}    onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Jessica Doe" />
                <Field label="Phone *"     value={form.phone}   onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+1 555 123 4567" />
                <div className="col-span-2">
                  <Field label="Work email *" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="jessica@dealership.com" type="email" />
                </div>
                <div className="col-span-2">
                  <Field label="Dealership / Company" value={form.company} onChange={(v) => setForm((f) => ({ ...f, company: v }))} placeholder="Acme Auto Group" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-black/50 mb-[5px] font-['Inter:Bold',sans-serif]">
                    Anything specific you'd like to cover?
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="e.g. SmartMatch eligibility for our new-car inventory"
                    className="w-full px-[12px] py-[9px] rounded-[10px] border border-black/10 text-[13px] font-['Inter:Regular',sans-serif] focus:outline-none focus:border-[#4600F2] focus:ring-2 focus:ring-[rgba(70,0,242,0.18)] resize-none"
                  />
                </div>
              </div>

              <div className="mt-auto pt-[20px] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("pick")}
                  className="inline-flex items-center gap-[6px] h-[40px] px-[14px] rounded-[10px] text-[13px] font-semibold text-black/65 hover:bg-black/5 font-['Inter:Semi_Bold',sans-serif]"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  disabled={!canSubmitForm}
                  className="h-[44px] px-[22px] rounded-[10px] text-[13.5px] font-semibold text-white bg-[#4600F2] hover:bg-[#3a00d0] disabled:opacity-50 disabled:cursor-not-allowed font-['Inter:Semi_Bold',sans-serif] transition-colors"
                >
                  Confirm booking
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex-1 px-[32px] py-[36px] flex flex-col items-center justify-center text-center">
              <div
                className="size-[72px] rounded-full flex items-center justify-center mb-[18px]"
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  boxShadow: "0 12px 30px rgba(16,185,129,0.35)",
                }}
              >
                <Check size={36} strokeWidth={3} className="text-white" />
              </div>
              <h3 className="text-[22px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
                You're booked, {form.name.split(" ")[0] || "there"}!
              </h3>
              <p className="mt-[8px] text-[13px] text-black/60 font-['Inter:Regular',sans-serif] leading-[18px] max-w-[420px]">
                A Google Meet invite is on its way to <span className="font-semibold text-[#0a0a0a]">{form.email}</span>. Jessica will reach out at <span className="font-semibold text-[#0a0a0a]">{form.phone}</span> if anything changes.
              </p>

              <div className="mt-[22px] w-full max-w-[380px] rounded-[14px] border border-black/8 bg-[#FAFAFB] px-[18px] py-[14px] text-left space-y-[8px]">
                <Row label="Date"     value={`${selectedDateShort} · ${selectedWeekday}`} />
                <Row label="Time"     value={selectedTime ?? "—"} />
                <Row label="Timezone" value={timezone} />
                <Row label="With"     value="Jessica · 30 minutes · Google Meet" />
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-[26px] h-[42px] px-[22px] rounded-[10px] text-[13.5px] font-semibold text-white bg-[#4600F2] hover:bg-[#3a00d0] font-['Inter:Semi_Bold',sans-serif]"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────
function Detail({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[8px] text-[13px] text-[#1F2937] font-['Inter:Medium',sans-serif] font-medium">
      {icon}
      <span className="truncate">{children}</span>
    </div>
  );
}

function NavBtn({ onClick, aria, children }: { onClick: () => void; aria: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="size-[28px] rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center text-black/55 transition-colors"
    >
      {children}
    </button>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-black/50 mb-[5px] font-['Inter:Bold',sans-serif]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[40px] px-[12px] rounded-[10px] border border-black/10 text-[13px] font-['Inter:Regular',sans-serif] focus:outline-none focus:border-[#4600F2] focus:ring-2 focus:ring-[rgba(70,0,242,0.18)]"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-[12px]">
      <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-black/45 font-['Inter:Bold',sans-serif]">
        {label}
      </span>
      <span className="text-[12.5px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] text-right">
        {value}
      </span>
    </div>
  );
}
