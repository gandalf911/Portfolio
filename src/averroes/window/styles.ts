import { T } from "./theme";

// Feuille de style de la fenêtre, injectée par le composant lui-même : une fois
// dans Framer, le composant de code porte son CSS sans dépendre de la page.
// Tout est préfixé `avw-` pour ne rien toucher autour.
export const WINDOW_CSS = `
.avw{--bg:${T.bg};--el:${T.elevated};--sf:${T.surface};--tx:${T.text};--mu:${T.muted};--bd:${T.border};--ja:${T.jade};--jc:${T.jadeCta};font-family:${T.font};color:var(--tx)}
.avw *{box-sizing:border-box}
.avw-frame{border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.4);background:var(--bg)}
.avw-chrome{height:40px;background:#1c1c1c;display:flex;align-items:center;gap:8px;padding:0 14px}
.avw-dot{width:11px;height:11px;border-radius:50%}
.avw-url{margin-left:18px;flex:0 1 420px;background:#2a2a2a;border-radius:7px;color:#aaa;font:12px "Inter Tight",system-ui,sans-serif;padding:5px 12px;display:flex;gap:7px;align-items:center}
.avw-app{position:relative;height:780px;background:var(--bg);overflow:hidden}
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
.avw-view[aria-pressed="true"]{background:${T.sapin};color:${T.elevated}}
.avw-screen{animation:avw-in .45s cubic-bezier(.2,.8,.2,1)}
@keyframes avw-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.avw-stage{position:absolute;left:0;right:0;top:150px;bottom:0;padding:16px 24px 92px;overflow:hidden}
.avw-tag{margin-left:auto;font:11px "Inter Tight",system-ui,sans-serif;color:#8a8a8a;border:1px solid #333;padding:3px 10px;border-radius:999px}
/* dock */
.avw-dockwrap{position:absolute;left:0;right:0;bottom:16px;display:flex;justify-content:center;z-index:6;pointer-events:none}
.avw-dock{pointer-events:auto;display:flex;align-items:flex-end;gap:10px;height:68px;padding:0 12px 9px;border-radius:22px;background:rgba(122,150,140,.72);backdrop-filter:blur(12px);box-shadow:0 14px 34px rgba(26,52,49,.22)}
.avw-di{position:relative;width:50px;height:50px;border-radius:50%;background:${T.sapin};border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;cursor:pointer;color:${T.elevated};padding:0;transition:width .12s ease-out,height .12s ease-out}
.avw-di svg{width:42%;height:42%}
.avw-tip{position:absolute;top:-30px;left:50%;transform:translateX(-50%);white-space:nowrap;background:var(--sf);color:var(--tx);border:1px solid var(--bd);border-radius:7px;padding:3px 8px;font-size:11px;opacity:0;transition:opacity .15s;pointer-events:none}
.avw-di:hover .avw-tip,.avw-di:focus-visible .avw-tip{opacity:1}
.avw-badge{position:absolute;top:-3px;right:-3px;background:${T.terracotta};color:#fff;font-size:8px;font-weight:700;border-radius:999px;padding:2px 4px;line-height:1}
/* menu plein écran */
.avw-full{position:absolute;inset:0;z-index:8;background:rgba(247,237,225,.95);backdrop-filter:blur(18px);display:flex;flex-direction:column;opacity:0;transition:opacity .25s}
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
.avw-private{position:absolute;inset:0;z-index:9;display:grid;place-items:center;background:rgba(247,237,225,.7);backdrop-filter:blur(8px)}
.avw-pcard{width:380px;background:var(--sf);border:1px solid var(--bd);border-radius:18px;padding:22px 22px 18px;box-shadow:0 20px 50px rgba(26,52,49,.15)}
.avw-pcard h4{margin:12px 0 6px;font-size:16px}
.avw-pcard p{margin:0;font-size:13px;line-height:1.5;color:var(--mu)}
.avw-chip{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:10px;background:${T.jadeSoft};color:${T.jadeCta}}
.avw-btn{margin-top:16px;border:0;border-radius:999px;background:${T.sapin};color:${T.elevated};font:inherit;font-size:12px;font-weight:500;padding:9px 16px;cursor:pointer}
/* cartes partagées */
.avw-card{position:relative;overflow:hidden;background:var(--sf);border-radius:16px;border:1px solid var(--bd);padding:14px 16px 12px;min-width:0}
.avw-card-h{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600}
.avw-card-x{position:absolute;top:14px;right:14px;color:var(--mu)}
.avw-label{font-size:9px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}
@media (prefers-reduced-motion: reduce){.avw *{transition:none!important;animation:none!important}}
`;
