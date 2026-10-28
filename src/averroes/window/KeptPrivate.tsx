import { Lock } from "lucide-react";

export function KeptPrivate({ onClose }: { onClose: () => void }) {
  return (
    <div className="avw-private" onClick={onClose}>
      <div className="avw-pcard" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-label="Kept private">
        <span className="avw-chip">
          <Lock size={18} aria-hidden />
        </span>
        <h4>Kept private</h4>
        <p>This screen runs on real company data, so it stays off the portfolio, name included.</p>
        <button type="button" className="avw-btn" aria-label="Close" onClick={onClose}>
          Back to the tour
        </button>
      </div>
    </div>
  );
}
