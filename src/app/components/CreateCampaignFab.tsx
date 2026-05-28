import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MIcon } from "./shared/MIcon";

interface Props {
  open: boolean;
  selectedCount: number;
  onCreate: () => void;
  onDismiss: () => void;
}

export function CreateCampaignFab({ open, selectedCount, onCreate, onDismiss }: Props) {
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = fabRef.current;
    if (!el) return;
    gsap.fromTo(el,
      { y: 30, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }
    );
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={fabRef}
      className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[58] inline-flex items-center gap-[14px] px-[18px] py-[12px] bg-white rounded-[14px] border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
    >
      <div
        className="size-[36px] rounded-[10px] flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #FECACA 0%, #F87171 50%, #DC2626 100%)",
          color: "white",
        }}
      >
        <MIcon name="auto_awesome" size={20} fill />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[16px]">
          Ready to create your campaign
        </p>
        <p className="text-[11px] text-black/55 font-['Inter:Regular',sans-serif] mt-[1px]">
          {selectedCount} aged vehicles selected · holding cost climbing
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="h-[36px] px-[12px] rounded-[8px] text-[12px] font-semibold text-black/55 hover:bg-black/5 font-['Inter:Semi_Bold',sans-serif]"
      >
        Later
      </button>
      <button
        type="button"
        onClick={onCreate}
        className="h-[36px] px-[16px] rounded-[8px] inline-flex items-center gap-[6px] text-[12px] font-semibold text-white font-['Inter:Semi_Bold',sans-serif] bg-[#4600F2] hover:bg-[#3a00d0] shadow-[0_4px_12px_rgba(70,0,242,0.32)]"
      >
        Create Campaign
        <MIcon name="arrow_forward" size={15} weight={500} />
      </button>
    </div>
  );
}
