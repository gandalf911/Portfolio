import { useRef } from "react";
import {
  BarChart3, BookCheck, CircleCheck, ClipboardList, FileText, GitBranch, LayoutGrid, Receipt, Scale, ShieldCheck, Tag, Wallet, Home, type LucideIcon,
} from "lucide-react";
import { MONTHS, TX } from "../data/fiction";
import { Card } from "../fx/Card";
import { CountUp } from "../fx/CountUp";
import { useArmed } from "../fx/useArmed";
import { useEntrance } from "../fx/useEntrance";
import { T } from "../theme";

const SUBTABS: { label: string; icon: LucideIcon }[] = [
  { label: "Hub", icon: LayoutGrid },
  { label: "Pipe", icon: BarChart3 },
  { label: "Transactions", icon: GitBranch },
  { label: "Transactions certaines", icon: ShieldCheck },
  { label: "Facturation", icon: Receipt },
  { label: "Déclarations", icon: ClipboardList },
  { label: "Analyse", icon: BarChart3 },
  { label: "Réconciliation", icon: Scale },
];

const big = { fontSize: 34, fontWeight: 600, color: T.jadeCta, letterSpacing: "-.02em", lineHeight: 1 } as const;

function MiniBars({ values, labels, height = 34, highlight = -1 }: { values: number[]; labels: string[]; height?: number; highlight?: number }) {
  const armed = useArmed(300);
  const max = Math.max(...values);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: height + 14 }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", gap: 3 }}>
          <div style={{ height: armed ? `${Math.max(6, (v / max) * height)}px` : "0px", borderRadius: 4, background: i === highlight ? T.jadeCta : "#6fd3bf", transition: `height .8s cubic-bezier(.2,.8,.2,1) ${i * 70}ms` }} />
          <span style={{ fontSize: 8, color: T.muted, textAlign: "center" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Ribbon() {
  const armed = useArmed(350);
  const rate = 65.4;
  const segs = [
    { label: "Déclaré", value: TX.declared, color: T.jadeCta },
    { label: "Facturé", value: TX.billed, color: T.jadeCta },
    { label: "Payé", value: TX.paid, color: T.jade },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
        <span style={big}>
          <CountUp value={rate} decimals={1} suffix=" %" />
        </span>
        <span className="avw-label">Taux d'encaissement</span>
      </div>
      <div style={{ fontSize: 10, color: T.muted, marginTop: 6 }}>Chaque déclaration suivie jusqu'au paiement, contrôles compris.</div>
      <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
        {segs.map((s, i) => (
          <div key={s.label} style={{ flex: 1, height: 6, borderRadius: 6, background: T.infoSoft, overflow: "hidden" }}>
            <div style={{ height: "100%", width: armed ? "100%" : "0%", background: s.color, borderRadius: 6, transition: `width .7s ease ${i * 420}ms` }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
        {segs.map((s) => (
          <span key={s.label} className="avw-label">
            {s.label} · <b style={{ color: T.text }}>{s.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function Pipeline() {
  const armed = useArmed(300);
  const max = TX.stages[0].value;
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, marginTop: 10 }}>
      {TX.stages.map((s, i) => (
        <div key={s.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
            <span>{s.label}</span>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>{s.value}</b>
          </div>
          <div style={{ height: 7, borderRadius: 7, background: T.infoSoft, marginTop: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: armed ? `${(s.value / max) * 100}%` : "0%", borderRadius: 7, background: T.jadeCta, transition: `width 1s cubic-bezier(.2,.8,.2,1) ${i * 90}ms` }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: 10, color: T.muted, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
        Top 5 étapes · <b style={{ color: T.text }}>1 747</b> deals hors annulés
      </div>
    </div>
  );
}

function PipeForecast() {
  const armed = useArmed(450);
  const vals = [1, 2, 1, 6, 2, 9];
  const labels = MONTHS.slice(4);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: 16, minHeight: 0 }}>
      <div className="avw-label">Lignes ajoutées · 6 derniers mois</div>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-end", flex: 1, marginTop: 8 }}>
        {vals.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", gap: 4 }}>
            <div style={{ height: armed ? `${(v / 9) * 88}%` : "0%", borderRadius: "5px 5px 2px 2px", background: i === vals.length - 1 ? T.jadeCta : "#7fd8c6", transition: `height .9s cubic-bezier(.2,.8,.2,1) ${i * 80}ms` }} />
            <span style={{ fontSize: 8, color: T.muted, textAlign: "center" }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Transactions() {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref);
  return (
    <div ref={ref} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Transactions</div>
          <div style={{ fontSize: 11, color: T.muted }}>Déclaration, parcours, facturation et pipe, le prévisionnel des ACC.</div>
        </div>
        <div style={{ display: "flex", gap: 2, background: T.surface, borderRadius: 12, padding: 4, border: `1px solid ${T.border}` }}>
          {SUBTABS.map(({ label, icon: Icon }, i) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, padding: "5px 9px", borderRadius: 9, background: i === 0 ? T.jadeCta : "transparent", color: i === 0 ? "#fff" : T.muted, whiteSpace: "nowrap" }}>
              <Icon size={11} aria-hidden /> {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gap: 14, gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridTemplateRows: "repeat(2, minmax(0, 1fr))", gridTemplateAreas: `"dec pipe tx" "flow pipe stages"` }}>
        <Card icon={FileText} title="Déclaration" style={{ gridArea: "dec" }}>
          <div style={{ ...big, marginTop: 12 }}>
            <CountUp value={TX.declared} />
          </div>
          <div className="avw-label" style={{ marginTop: 4 }}>Déclarées ce mois</div>
          <div style={{ marginTop: 12 }}>
            <MiniBars values={[31, 36, 39, 29, 52, 47]} labels={MONTHS.slice(4)} height={62} highlight={4} />
          </div>
        </Card>

        <Card icon={Wallet} title="Du déclaré à l'encaissé" style={{ gridArea: "flow", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Ribbon />
        </Card>

        <Card icon={BarChart3} title="Pipe" style={{ gridArea: "pipe", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 8 }}>Le prévisionnel des ACC, une ligne par bien en cours de closing.</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginTop: 14 }}>
            <div>
              <div style={{ ...big, fontSize: 46 }}>
                <CountUp value={5} />
              </div>
              <div className="avw-label" style={{ marginTop: 4 }}>Lignes actives</div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Wallet size={14} color={T.jadeCta} aria-hidden /> 58 000 MAD
              </div>
              <div className="avw-label" style={{ marginTop: 4 }}>Volume prévisionnel</div>
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: T.jade, marginTop: 14 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.muted, marginTop: 5 }}>
            <span style={{ display: "flex", gap: 4, alignItems: "center" }}><Home size={10} aria-hidden /> Vente · 2</span>
            <span style={{ display: "flex", gap: 4, alignItems: "center" }}><Tag size={10} aria-hidden /> Location · 3</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {[["Ticket moyen", "11 600 MAD"], ["Sans référence", "1"]].map(([k, v]) => (
              <div key={k} style={{ background: "rgba(26,52,49,.05)", borderRadius: 10, padding: "8px 10px", border: `1px solid ${T.border}` }}>
                <div className="avw-label">{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </div>
          <PipeForecast />
        </Card>

        <Card icon={CircleCheck} title="Transactions" style={{ gridArea: "tx" }}>
          <div style={{ ...big, marginTop: 12 }}>
            <CountUp value={TX.paid} />
          </div>
          <div className="avw-label" style={{ marginTop: 4 }}>Paiements reçus</div>
          <div style={{ marginTop: 12 }}>
            <MiniBars values={[96, 118, 104, 131, 88, 142]} labels={MONTHS.slice(4)} height={40} highlight={5} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {["Déclaration", "Facturation", "Paiement"].map((c) => (
              <span key={c} style={{ fontSize: 9.5, padding: "3px 9px", borderRadius: 999, background: "rgba(26,52,49,.06)", border: `1px solid ${T.border}` }}>
                {c}
              </span>
            ))}
          </div>
        </Card>

        <Card icon={BookCheck} title="Pipeline par étape" style={{ gridArea: "stages", display: "flex", flexDirection: "column" }}>
          <Pipeline />
        </Card>
      </div>
    </div>
  );
}
