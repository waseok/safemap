"use client";

interface ExplorerCelebrationProps {
  message: string;
}

export default function ExplorerCelebration({ message }: ExplorerCelebrationProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="animate-celebrate-pop rounded-[2rem] bg-white px-6 py-5 text-center shadow-[0_20px_50px_rgba(15,23,42,0.28)]">
        <div className="text-5xl">🎉</div>
        <p className="mt-3 text-lg font-black text-slate-900">{message}</p>
        <p className="mt-2 text-sm text-slate-500">친구들에게도 바로 보이도록 지도에 반영됐어요.</p>
      </div>
    </div>
  );
}
