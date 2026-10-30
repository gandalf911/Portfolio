import { PALETTE, T } from "./theme";

const vars = (p: (typeof PALETTE)["light" | "dark"]) =>
  `--bg:${p.bg};--el:${p.elevated};--sf:${p.surface};--tx:${p.text};--mu:${p.muted};--bd:${p.border};--js:${p.jadeSoft};--is:${p.infoSoft};--ink:${p.ink}`;

// Feuille de style de la fenêtre, injectée par le composant lui-même : une fois
// dans Framer, le composant de code porte son CSS sans dépendre de la page.
// Tout est préfixé `avw-` pour ne rien toucher autour.
export const WINDOW_CSS = `
.avw{${vars(PALETTE.light)};--ja:${T.jade};--jc:${T.jadeCta};font-family:${T.font};color:var(--tx)}
.avw[data-theme=dark]{${vars(PALETTE.dark)};color-scheme:dark}
.avw *{box-sizing:border-box}
.avw[data-scrolling],.avw[data-scrolling] *{pointer-events:none!important}
.avw-frame{border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.4);background:var(--bg)}
.avw-chrome{height:40px;background:#1c1c1c;display:flex;align-items:center;gap:8px;padding:0 14px}
.avw-dot{width:11px;height:11px;border-radius:50%}
.avw-url{margin-left:18px;flex:0 1 420px;background:#2a2a2a;border-radius:7px;color:#aaa;font:12px "Inter Tight",system-ui,sans-serif;padding:5px 12px;display:flex;gap:7px;align-items:center}
.avw-app{position:relative;height:780px;background:var(--bg);overflow:hidden;contain:layout paint}
.avw-head{display:flex;justify-content:space-between;align-items:center;padding:16px 24px 0}
.avw-logo{display:flex;align-items:center;gap:9px;font-size:20px;font-weight:600;letter-spacing:-.01em}
.avw-online{display:flex;align-items:center;gap:10px;font-size:9px;letter-spacing:.12em;color:var(--mu)}
.avw-sub{display:flex;justify-content:space-between;align-items:center;padding:8px 24px 0 36px}
.avw-crumb{font-size:12px;color:var(--mu);line-height:1.35}
.avw-crumb b{display:block;font-size:15px;font-weight:600;color:var(--tx)}
.avw-user{display:flex;align-items:center;gap:10px;background:var(--sf);border-radius:999px;padding:6px 8px 6px 16px;font-size:12px;font-weight:600;line-height:1.1;text-align:right}
.avw-user small{display:block;margin-top:3px;font-size:8px;font-weight:500;letter-spacing:.12em;color:var(--mu)}
.avw-tabs{display:flex;gap:4px;margin:14px 24px 0;padding-bottom:0;border-bottom:1px solid var(--bd)}
.avw-tab{border:0;background:none;font:inherit;font-size:12px;color:var(--mu);padding:8px 12px;border-radius:8px 8px 0 0;cursor:pointer}
.avw-tab:hover{color:var(--tx)}
.avw-tab[aria-current="page"]{background:var(--sf);color:var(--tx);font-weight:500}
.avw-tab--locked span{display:inline-block;filter:blur(4px);opacity:.75;user-select:none}
.avw-views{margin:0 0 5px auto;display:flex;gap:2px;background:var(--sf);border:1px solid var(--bd);border-radius:999px;padding:3px}
.avw-view{border:0;background:none;font:inherit;font-size:11px;color:var(--mu);padding:4px 11px;border-radius:999px;display:flex;gap:5px;align-items:center;cursor:pointer;white-space:nowrap;transition:background .25s,color .25s}
.avw-view:hover{color:var(--tx)}
.avw-view[aria-pressed="true"]{background:${T.sapin};color:${T.cream}}
.avw-screen{animation:avw-in .45s cubic-bezier(.2,.8,.2,1)}
@keyframes avw-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.avw-stage{position:absolute;left:0;right:0;top:150px;bottom:0;padding:16px 24px 92px;overflow:hidden}
.avw-tag{margin-left:auto;font:11px "Inter Tight",system-ui,sans-serif;color:#8a8a8a;border:1px solid #333;padding:3px 10px;border-radius:999px}
/* dock */
.avw-dockwrap{position:absolute;left:0;right:0;bottom:16px;display:flex;justify-content:center;z-index:10;pointer-events:none}
.avw-dock{pointer-events:auto;display:flex;align-items:flex-end;gap:10px;height:68px;padding:0 12px 9px;border-radius:22px;background:rgba(122,150,140,.92);box-shadow:0 14px 34px rgba(26,52,49,.22)}
.avw-di{position:relative;width:50px;height:50px;border-radius:50%;background:${T.sapin};border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;cursor:pointer;color:${T.cream};padding:0;transition:width .12s ease-out,height .12s ease-out}
.avw-di svg{width:42%;height:42%}
.avw-tip{position:absolute;top:-30px;left:50%;transform:translateX(-50%);white-space:nowrap;background:var(--sf);color:var(--tx);border:1px solid var(--bd);border-radius:7px;padding:3px 8px;font-size:11px;opacity:0;transition:opacity .15s;pointer-events:none}
.avw-di:hover .avw-tip,.avw-di:focus-visible .avw-tip{opacity:1}
.avw-badge{position:absolute;top:-3px;right:-3px;background:${T.terracotta};color:#fff;font-size:8px;font-weight:700;border-radius:999px;padding:2px 4px;line-height:1}
/* menu plein écran */
.avw-full{position:absolute;inset:0;z-index:8;background:color-mix(in srgb,var(--bg) 95%,transparent);backdrop-filter:blur(18px);display:flex;flex-direction:column;opacity:0;transition:opacity .25s}
.avw-full[data-state="open"]{opacity:1}
.avw-fhead{display:flex;justify-content:space-between;align-items:center;padding:22px 30px;font-size:17px;font-weight:600}
.avw-link{background:none;border:0;font:inherit;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--tx);cursor:pointer}
.avw-fgrid{list-style:none;margin:0;flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:22px 44px;padding:0 44px;align-content:center;transform:translateY(16px);transition:transform .3s .05s}
.avw-full[data-state="open"] .avw-fgrid{transform:none}
.avw-seg>span{font-size:9px;font-weight:500;letter-spacing:.35em;text-transform:uppercase;color:var(--mu)}
.avw-seg ul{list-style:none;margin:7px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;align-items:flex-start}
.avw-item{background:none;border:0;padding:0;font:inherit;color:var(--tx);cursor:pointer;text-align:left}
.avw-item[aria-current="page"]{color:var(--jc)}
.avw-roll{display:block;position:relative;overflow:hidden;line-height:1.3;font-size:19px;font-weight:800;text-transform:uppercase;letter-spacing:-.03em;white-space:nowrap}
.avw-roll>span{display:block}
.avw-roll>span+span{position:absolute;inset:0}
.avw-roll i{display:inline-block;font-style:normal;transition:transform .35s ease-in-out}
.avw-roll>span+span i{transform:translateY(100%)}
.avw-item:hover .avw-roll>span:first-child i,.avw-item:focus-visible .avw-roll>span:first-child i{transform:translateY(-100%)}
.avw-item:hover .avw-roll>span+span i,.avw-item:focus-visible .avw-roll>span+span i{transform:none}
.avw-seg--locked>span{display:inline-block;filter:blur(3px);user-select:none}
.avw-item--locked{display:flex;align-items:center;gap:8px}
.avw-mask{display:block;line-height:1.3;font-size:19px;font-weight:800;text-transform:uppercase;letter-spacing:-.03em;white-space:nowrap;filter:blur(6px);opacity:.6;user-select:none;transition:opacity .3s}
.avw-lock{color:var(--mu);opacity:0;transition:opacity .3s}
.avw-item--locked:hover .avw-mask{opacity:.4}
.avw-item--locked:hover .avw-lock{opacity:1}
.avw-ffoot{text-align:center;padding:16px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--mu)}
/* carte « kept private » */
.avw-private{position:absolute;inset:0;z-index:9;display:grid;place-items:center;background:color-mix(in srgb,var(--bg) 70%,transparent);backdrop-filter:blur(8px)}
.avw-pcard{width:380px;background:var(--sf);border:1px solid var(--bd);border-radius:18px;padding:22px 22px 18px;box-shadow:0 20px 50px rgba(26,52,49,.15)}
.avw-pcard h4{margin:12px 0 6px;font-size:16px}
.avw-pcard p{margin:0;font-size:13px;line-height:1.5;color:var(--mu)}
.avw-chip{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:10px;background:${T.jadeSoft};color:${T.jadeCta}}
.avw-btn{margin-top:16px;border:0;border-radius:999px;background:${T.sapin};color:${T.cream};font:inherit;font-size:12px;font-weight:500;padding:9px 16px;cursor:pointer}
/* cartes partagées */
.avw-card{position:relative;overflow:hidden;background:var(--sf);border-radius:16px;border:1px solid var(--bd);padding:14px 16px 12px;min-width:0}
.avw-card-h{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600}
.avw-card-x{position:absolute;top:14px;right:14px;color:var(--mu)}
.avw-label{font-size:9px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}
/* Panneaux du dock : FAQ & bug (modale), notifications (tiroir), fil d'actualité */
.avw-layer{position:absolute;inset:0;z-index:7;background:color-mix(in srgb,var(--bg) 55%,transparent);animation:avwFade .2s ease}
@keyframes avwFade{from{opacity:0}}
@keyframes avwRise{from{opacity:0;transform:translateY(14px)}}
@keyframes avwSlide{from{opacity:0;transform:translateX(30px)}}
.avw-modal,.avw-drawer,.avw-feed{position:absolute;background:var(--sf);color:var(--tx);border:1px solid var(--bd);box-shadow:0 24px 60px rgb(0 0 0 / .18);display:flex;flex-direction:column}
.avw-modal{left:50%;top:150px;width:470px;margin-left:-235px;border-radius:18px;padding:16px 18px 18px;gap:14px;animation:avwRise .3s cubic-bezier(.2,.8,.2,1)}
.avw-drawer{top:16px;right:16px;bottom:100px;width:400px;border-radius:18px;padding:14px 12px 12px;gap:10px;animation:avwSlide .3s cubic-bezier(.2,.8,.2,1)}
.avw-feed{left:24px;right:24px;top:110px;bottom:100px;border-radius:18px;padding:16px 18px;gap:14px;animation:avwRise .3s cubic-bezier(.2,.8,.2,1)}
.avw-ph{display:flex;align-items:center;gap:8px;font-size:14px}
.avw-x{margin-left:auto;width:28px;height:28px;border-radius:8px;border:1px solid var(--bd);background:transparent;color:var(--mu);display:grid;place-items:center;cursor:pointer}
.avw-x:hover{color:var(--tx)}
.avw-seg-ctl,.avw-ntabs{display:flex;gap:4px;background:var(--bg);border:1px solid var(--bd);border-radius:11px;padding:3px}
.avw-seg-ctl button,.avw-ntabs button{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;background:transparent;color:var(--mu);font:500 11.5px/1 ${T.font};padding:8px 10px;border-radius:8px;cursor:pointer}
.avw-seg-ctl button[aria-pressed=true],.avw-ntabs button[aria-pressed=true]{background:var(--sf);color:var(--tx);box-shadow:0 1px 3px rgb(0 0 0 / .08)}
.avw-ntabs .avw-readall{flex:none;margin-left:auto;color:${T.jadeInk}}
.avw-ntabs .avw-readall:disabled{opacity:.4;cursor:default}
.avw-form{display:flex;flex-direction:column;gap:8px}
.avw-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px}
.avw-chips button{border:1px solid var(--bd);background:transparent;color:var(--tx);border-radius:999px;padding:5px 12px;font:400 11.5px/1.2 ${T.font};cursor:pointer}
.avw-chips button[aria-pressed=true]{border-color:${T.jadeCta};background:var(--js);color:${T.jadeInk};font-weight:500}
.avw-form textarea{resize:none;border:1px solid var(--bd);background:var(--bg);color:var(--tx);border-radius:11px;padding:10px 12px;font:400 12px/1.5 ${T.font};outline:none}
.avw-form textarea:focus{border-color:${T.jadeCta}}
.avw-btn--cta{align-self:flex-end;display:inline-flex;align-items:center;gap:7px;background:${T.jadeCta};color:#fff;border:0}
.avw-btn--cta:disabled{opacity:.45;cursor:default}
.avw-sent{display:flex;flex-direction:column;align-items:center;gap:6px;padding:20px 0 10px;text-align:center;font-size:12px;color:var(--mu)}
.avw-sent b{color:var(--tx);font-size:14px}
.avw-faq{display:flex;flex-direction:column;gap:6px}
.avw-faq-i{border:1px solid var(--bd);border-radius:11px;overflow:hidden}
.avw-faq-i button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;border:0;background:transparent;color:var(--tx);font:500 12.5px/1.3 ${T.font};padding:10px 12px;cursor:pointer;text-align:left}
.avw-faq-i button svg{transition:transform .25s;color:var(--mu);flex-shrink:0}
.avw-faq-i[data-open] button svg{transform:rotate(180deg)}
.avw-faq-i p{display:none;margin:0;padding:0 12px 11px;font-size:11.5px;line-height:1.55;color:var(--mu)}
.avw-faq-i[data-open] p{display:block}
.avw-count{background:${T.terracotta};color:#fff;font-size:10px;font-weight:700;border-radius:999px;padding:2px 7px}
.avw-nlist{display:flex;flex-direction:column;gap:4px;flex:1;min-height:0;overflow:hidden}
.avw-notif{display:flex;align-items:flex-start;gap:10px;border:0;background:transparent;color:var(--tx);text-align:left;padding:9px 10px;border-radius:12px;cursor:pointer;font:400 11.5px/1.45 ${T.font};animation:avwRise .35s cubic-bezier(.2,.8,.2,1) backwards}
.avw-notif:nth-child(2){animation-delay:.04s}.avw-notif:nth-child(3){animation-delay:.08s}.avw-notif:nth-child(4){animation-delay:.12s}.avw-notif:nth-child(5){animation-delay:.16s}.avw-notif:nth-child(6){animation-delay:.2s}
.avw-notif:hover{background:var(--bg)}
.avw-notif[data-unread]{background:var(--js)}
.avw-sys{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:${T.sapin};color:#feefe0;font-size:12px;font-weight:700}
.avw-ntext{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.avw-nmeta{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--mu)}
.avw-tag{font-size:9.5px;font-weight:600;border-radius:999px;padding:1px 7px}
.avw-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.avw-posts{flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.avw-post{display:flex;flex-direction:column;gap:10px;border:1px solid var(--bd);border-radius:14px;padding:12px;background:var(--bg);min-height:0;animation:avwRise .4s cubic-bezier(.2,.8,.2,1) backwards}
.avw-post:nth-child(2){animation-delay:.07s}.avw-post:nth-child(3){animation-delay:.14s}
.avw-post header{display:flex;align-items:center;gap:9px}
.avw-post header span{display:flex;flex-direction:column;font-size:12px}
.avw-post header small{font-size:10px;color:var(--mu)}
.avw-post p{margin:0;font-size:12px;line-height:1.55}
.avw-post img{width:100%;flex:1;min-height:0;object-fit:cover;border-radius:10px}
.avw-post footer{margin-top:auto;display:flex;gap:16px;font-size:11px;color:var(--mu)}
.avw-post footer button,.avw-post footer span{display:inline-flex;align-items:center;gap:5px;border:0;background:transparent;color:inherit;font:inherit;padding:0;cursor:pointer}
.avw-di[aria-disabled=true]{cursor:default}
.avw-notes{list-style:none;margin:0;padding:0;flex:1;display:flex;flex-direction:column;justify-content:space-evenly;gap:8px}
.avw-notes li{display:flex;align-items:center;gap:10px;font-size:12px;line-height:1.4;background:var(--sf);border:1px solid var(--bd);border-radius:11px;padding:10px 12px}
.avw-notes li svg{flex-shrink:0}
@media (prefers-reduced-motion: reduce){.avw *{transition:none!important;animation:none!important}}
`;
