import { useRef } from "react";
import { CalendarClock, ClipboardCheck, FileSignature, GraduationCap, Info, Radio, Star, Users, Video, type LucideIcon } from "lucide-react";
import { COHORTS } from "../data/fiction";
import { useArmed } from "../fx/useArmed";
import { useEntrance } from "../fx/useEntrance";
import { T } from "../theme";

type Row = (typeof COHORTS.rows)[number];

const ICONS: Record<string, LucideIcon> = {
  Recrutés: Users,
  "Contrat signé": FileSignature,
  "E-learning terminé": GraduationCap,
  "Actif · Leads On": Radio,
  "Satisfaction onboarding": Star,
};

function fmt(v: number | null, kind: Row["kind"]) {
  if (v === null) return "·";
  if (kind === "pct") return `${v} %`;
  if (kind === "days") return `${v} j`;
  if (kind === "score") return String(v).replace(".", ",");
  return String(v);
}

function Heatmap() {
  const armed = useArmed(200);
  const cols = COHORTS.months.length;
  return (
    <table style={{ width: "100%", height: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 11, tableLayout: "fixed" }}>
      <colgroup>
        <col style={{ width: 290 }} />
        {COHORTS.months.map((m) => (
          <col key={m} />
        ))}
        <col style={{ width: 70 }} />
      </colgroup>
      <thead>
        <tr>
          <th className="avw-label" style={{ textAlign: "left", padding: "0 0 8px 6px", fontWeight: 500 }}>
            Étape / module
          </th>
          {COHORTS.months.map((m) => (
            <th key={m} className="avw-label" style={{ textAlign: "center", padding: "0 0 8px", fontWeight: 500 }}>
              {m}
            </th>
          ))}
          <th className="avw-label" style={{ textAlign: "right", padding: "0 6px 8px 0", fontWeight: 500 }}>
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {COHORTS.rows.map((r) => {
          const nums = r.values.filter((v): v is number => v !== null);
          const max = Math.max(...nums);
          const heat = r.kind === "count";
          const sub = r.kind === "pct" || r.kind === "days";
          const Icon = ICONS[r.label];
          return (
            <tr key={r.label}>
              <td style={{ padding: "7px 6px", paddingLeft: sub ? 26 : 6, color: sub ? T.muted : T.text, fontWeight: heat ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {Icon && <Icon size={12} color={T.jadeCta} aria-hidden />}
                  {sub && <span style={{ color: T.jade }}>↳</span>}
                  {r.label}
                </span>
              </td>
              {r.values.map((v, i) => {
                const a = heat && v !== null ? 0.12 + (v / max) * 0.6 : 0;
                return (
                  <td
                    key={i}
                    style={{
                      textAlign: "center", padding: "7px 0", fontVariantNumeric: "tabular-nums",
                      background: heat ? `rgba(27,191,160,${armed ? a : 0})` : "transparent",
                      color: v === null ? T.muted : r.kind === "pct" && v < 50 ? T.rose : T.text,
                      transition: `background .6s ease ${i * 60}ms, opacity .5s ease ${i * 60}ms`,
                      opacity: armed ? 1 : 0,
                    }}
                  >
                    {fmt(v, r.kind)}
                  </td>
                );
              })}
              <td style={{ textAlign: "right", padding: "7px 6px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {heat ? nums.reduce((s, x) => s + x, 0) : ""}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={cols + 2} style={{ paddingTop: 8, fontSize: 9, color: T.muted }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Faible
              <i style={{ display: "inline-block", width: 70, height: 5, borderRadius: 4, background: `linear-gradient(90deg, rgba(27,191,160,.12), ${T.jadeCta})` }} />
              Fort · « · » = délai non encore parcouru par la moitié de la cohorte
            </span>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

const PROMO_TABS: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Suivi", icon: ClipboardCheck, active: true },
  { label: "Gestion de Promo", icon: CalendarClock },
  { label: "Visios", icon: Video },
  { label: "Formations", icon: GraduationCap },
];

export function OnboardingHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref);
  return (
    <div ref={ref} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {PROMO_TABS.map(({ label, icon: Icon, active }) => (
          <span
            key={label}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, borderRadius: 999, padding: "6px 12px",
              background: active ? T.jadeCta : T.surface, color: active ? "#fff" : T.text, border: `1px solid ${active ? T.jadeCta : T.border}`,
            }}
          >
            <Icon size={12} aria-hidden /> {label}
          </span>
        ))}
      </div>
      <div className="avw-card" style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
          Funnel d'onboarding · cohorte d'entrée <Info size={12} color={T.muted} aria-hidden />
        </div>
        <div style={{ fontSize: 10, color: T.muted, margin: "2px 0 12px" }}>
          Cohortes 2026. Recrutés (entrée CLIENT) → contrat → e-learning complet → Leads On, plus délais et satisfaction.
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Heatmap />
        </div>
      </div>
    </div>
  );
}
