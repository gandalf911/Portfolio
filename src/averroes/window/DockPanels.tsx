import { useEffect, useState, type ReactNode } from "react";
import { Bug, Check, CheckCheck, CircleCheck, ChevronDown, Heart, HelpCircle, Lightbulb, MessageCircle, Send, X } from "lucide-react";
import { FAQ, FEED, type Notif } from "./data/fiction";
import { Avatar } from "./fx/Avatar";
import { T, TONE } from "./theme";

export type Panel = "feedback" | "notifs" | "feed";

/** Fond cliquable + Échap : ferme le panneau ouvert. */
function Layer({ onClose, className, children }: { onClose: () => void; className: string; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="avw-layer" onClick={onClose}>
      <div className={className} onClick={(e) => e.stopPropagation()} role="dialog">
        {children}
      </div>
    </div>
  );
}

function Head({ title, onClose, children }: { title: string; onClose: () => void; children?: ReactNode }) {
  return (
    <div className="avw-ph">
      <b>{title}</b>
      {children}
      <button type="button" className="avw-x" aria-label="Fermer" onClick={onClose}>
        <X size={15} aria-hidden />
      </button>
    </div>
  );
}

/* ---------- Améliorations / FAQ & bug ---------- */

const KINDS = [
  { id: "idea", label: "Amélioration", icon: Lightbulb },
  { id: "bug", label: "Bug", icon: Bug },
  { id: "faq", label: "FAQ", icon: HelpCircle },
] as const;
const ZONES = ["Conseillers", "Offre", "Demande", "Autre"];

export function FeedbackPanel({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("idea");
  const [zone, setZone] = useState(ZONES[0]);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(0);
  return (
    <Layer onClose={onClose} className="avw-modal">
      <Head title="Améliorations / FAQ & bug" onClose={onClose} />
      <div className="avw-seg-ctl">
        {KINDS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-pressed={kind === id} onClick={() => (setKind(id), setSent(false))}>
            <Icon size={12} aria-hidden /> {label}
          </button>
        ))}
      </div>

      {kind === "faq" ? (
        <div className="avw-faq">
          {FAQ.map((f, i) => (
            <div key={f.q} className="avw-faq-i" data-open={open === i || undefined}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                {f.q} <ChevronDown size={13} aria-hidden />
              </button>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      ) : sent ? (
        <div className="avw-sent">
          <span className="avw-chip">
            <Check size={18} aria-hidden />
          </span>
          <b>Merci, c'est bien envoyé.</b>
          <span>La réponse arrivera dans vos notifications.</span>
        </div>
      ) : (
        <form
          className="avw-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            setText("");
          }}
        >
          <span className="avw-label">Zone concernée</span>
          <div className="avw-chips">
            {ZONES.map((z) => (
              <button key={z} type="button" aria-pressed={zone === z} onClick={() => setZone(z)}>
                {z}
              </button>
            ))}
          </div>
          <span className="avw-label">{kind === "bug" ? "Ce qui s'est passé" : "Votre idée"}</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder={kind === "bug" ? "Ce que vous faisiez, ce que vous attendiez, ce qui est arrivé…" : "Ce qui vous ferait gagner du temps…"}
          />
          <button type="submit" className="avw-btn avw-btn--cta" disabled={!text.trim()}>
            <Send size={13} aria-hidden /> Envoyer
          </button>
        </form>
      )}
    </Layer>
  );
}

/* ---------- Notifications ---------- */

export function NotificationsPanel({ items, onRead, onReadAll, onClose }: { items: Notif[]; onRead: (id: string) => void; onReadAll: () => void; onClose: () => void }) {
  const [tab, setTab] = useState<"todo" | "all">("todo");
  const shown = tab === "todo" ? items.filter((n) => n.tone === "alert" || n.tone === "warn") : items;
  const unread = items.filter((n) => n.unread).length;
  return (
    <Layer onClose={onClose} className="avw-drawer">
      <Head title="Notifications" onClose={onClose}>
        {unread > 0 && <span className="avw-count">{unread}</span>}
      </Head>
      <div className="avw-ntabs">
        {(
          [
            ["todo", "À traiter"],
            ["all", "Tout"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
        <button type="button" className="avw-readall" onClick={onReadAll} disabled={!unread}>
          <CheckCheck size={13} aria-hidden /> Tout marquer comme lu
        </button>
      </div>
      <div className="avw-nlist">
        {shown.map((n) => {
          const tone = TONE[n.tone];
          return (
            <button key={n.id} type="button" className="avw-notif" data-unread={n.unread || undefined} onClick={() => onRead(n.id)}>
              {n.who ? <Avatar person={n.who} size={30} /> : <span className="avw-sys">A</span>}
              <span className="avw-ntext">
                <span className="avw-nmeta">
                  <span className="avw-tag" style={{ color: tone.ink, background: tone.bg }}>
                    {n.tag}
                  </span>
                  {n.kind} · {n.ago}
                </span>
                <span>
                  {n.who && <b>{n.who.first} {n.who.last} · </b>}
                  {n.text}
                </span>
              </span>
              {n.unread && <span className="avw-dot" style={{ background: tone.solid }} />}
            </button>
          );
        })}
      </div>
    </Layer>
  );
}

/* ---------- Fil d'actualité ---------- */

export function FeedPanel({ onClose }: { onClose: () => void }) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  return (
    <Layer onClose={onClose} className="avw-feed">
      <Head title="Fil d'actualité" onClose={onClose}>
        <span className="avw-label" style={{ marginLeft: 4 }}>
          L'équipe et le réseau, au fil de la semaine
        </span>
      </Head>
      <div className="avw-posts">
        {FEED.map((p) => (
          <article key={p.id} className="avw-post">
            <header>
              <Avatar person={p.who} size={34} dark={p.who.id === "me"} />
              <span>
                <b>
                  {p.who.first} {p.who.last}
                </b>
                <small>
                  {p.role} · {p.ago}
                </small>
              </span>
            </header>
            <p>{p.text}</p>
            {p.photo && <img src={p.photo} alt="" draggable={false} />}
            {p.notes && (
              <ul className="avw-notes">
                {p.notes.map((n) => (
                  <li key={n}>
                    <CircleCheck size={15} color={T.jadeCta} aria-hidden /> {n}
                  </li>
                ))}
              </ul>
            )}
            <footer>
              <button type="button" aria-pressed={!!liked[p.id]} onClick={() => setLiked((l) => ({ ...l, [p.id]: !l[p.id] }))}>
                <Heart size={13} fill={liked[p.id] ? T.rose : "none"} color={liked[p.id] ? T.rose : "currentColor"} aria-hidden /> {p.likes + (liked[p.id] ? 1 : 0)}
              </button>
              <span>
                <MessageCircle size={13} aria-hidden /> {p.comments}
              </span>
            </footer>
          </article>
        ))}
      </div>
    </Layer>
  );
}
