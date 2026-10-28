import { useEffect, useRef, useState } from "react";
import { BedDouble, CalendarDays, Flag, MapPin, Ruler, Sparkles, UserRound } from "lucide-react";
import { LISTINGS } from "../data/fiction";
import { Avatar } from "../fx/Avatar";
import { formatFr } from "../fx/CountUp";
import { useEntrance } from "../fx/useEntrance";
import { T } from "../theme";

type Listing = (typeof LISTINGS)[number];

/** Une seule photo par bien (stock) : les « autres photos » sont des recadrages, comme un carrousel. */
const FRAMES = ["50% 50%", "18% 40%", "82% 55%", "40% 75%", "65% 30%", "28% 62%", "75% 45%", "50% 20%"];

function ListingCard({ l, index }: { l: Listing; index: number }) {
  const [frame, setFrame] = useState(0);
  const [hover, setHover] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!hover) {
      window.clearInterval(timer.current);
      return;
    }
    timer.current = window.setInterval(() => setFrame((f) => (f + 1) % l.photos), 900);
    return () => window.clearInterval(timer.current);
  }, [hover, l.photos]);

  const rent = l.kind === "LOCATION";
  const price = `${formatFr(l.price)} ${rent ? "MAD/mois" : "MAD"}`;
  const flag = index % 3 === 0 ? (index === 0 ? "P1" : "P2") : null;

  return (
    <div className="avw-card" style={{ padding: 0, background: "transparent", border: 0, display: "flex", flexDirection: "column" }} onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setFrame(0); }}>
      <div style={{ position: "relative", height: 148, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={l.photo}
          alt={`${l.type}, ${l.place}`}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            objectPosition: FRAMES[frame % FRAMES.length], transform: `scale(${hover ? 1.18 : 1.04})`,
            transition: "transform .9s ease, object-position .8s ease",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.18) 0%, transparent 35%, transparent 55%, rgba(0,0,0,.62) 100%)" }} />
        <span
          style={{
            position: "absolute", top: 9, left: 9, fontSize: 8.5, fontWeight: 600, letterSpacing: ".14em", color: "#fff",
            background: rent ? T.terracotta : T.jadeCta, borderRadius: 999, padding: "4px 9px",
          }}
        >
          {l.kind}
        </span>
        <span style={{ position: "absolute", top: 9, right: 9, fontSize: 9, color: "#fff", background: "rgba(0,0,0,.45)", borderRadius: 999, padding: "3px 8px", display: "flex", gap: 4, alignItems: "center" }}>
          {l.source === "Plateforme" ? <Sparkles size={9} aria-hidden /> : <UserRound size={9} aria-hidden />} {l.source}
        </span>
        <span style={{ position: "absolute", left: 11, bottom: 14, fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: "-.01em", textShadow: "0 1px 8px rgba(0,0,0,.3)" }}>
          {price}
        </span>
        <span style={{ position: "absolute", left: 11, bottom: 6, display: "flex", gap: 3 }}>
          {Array.from({ length: l.photos }, (_, k) => (
            <i key={k} style={{ width: k === frame ? 12 : 4, height: 4, borderRadius: 4, background: k === frame ? "#fff" : "rgba(255,255,255,.55)", transition: "width .3s", display: "block" }} />
          ))}
        </span>
      </div>
      <div style={{ padding: "8px 2px 0", fontSize: 11, minWidth: 0 }}>
        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <b>{l.type}</b> <span style={{ color: T.muted }}>· {l.project}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: T.muted, marginTop: 3, fontSize: 10 }}>
          <MapPin size={10} color={T.jadeCta} aria-hidden /> {l.place}
          {flag && (
            <span style={{ marginLeft: 4, display: "inline-flex", alignItems: "center", gap: 3, background: T.rose, color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 8, fontWeight: 700 }}>
              <Flag size={8} aria-hidden /> {flag}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, color: T.text, marginTop: 4, fontSize: 10 }}>
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <Ruler size={10} aria-hidden /> {l.area} m²
          </span>
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <BedDouble size={10} aria-hidden /> {l.rooms} ch
          </span>
          {!rent && <span style={{ color: T.muted }}>{formatFr(Math.round(l.price / l.area))} MAD/m²</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7, paddingTop: 7, borderTop: `1px solid ${T.border}`, fontSize: 10 }}>
          <Avatar person={l.advisor} size={18} />
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {l.advisor.first} {l.advisor.last}
          </span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center", color: T.muted, flexShrink: 0 }}>
            <CalendarDays size={10} aria-hidden /> 2026-10-{String(19 - index).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Catalogue() {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref, ".avw-card", { y: 18 });
  return (
    <div ref={ref} style={{ height: "100%", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridTemplateRows: "repeat(2, minmax(0, 1fr))", gap: "12px 16px" }}>
      {LISTINGS.map((l, i) => (
        <ListingCard key={l.project} l={l} index={i} />
      ))}
    </div>
  );
}
