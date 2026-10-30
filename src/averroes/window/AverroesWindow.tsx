import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { BrowserFrame } from "./BrowserFrame";
import { Dock, type DockAction } from "./Dock";
import { FeedbackPanel, FeedPanel, NotificationsPanel, type Panel } from "./DockPanels";
import { NOTIFS } from "./data/fiction";
import { FullMenu, type MenuState } from "./FullMenu";
import { KeptPrivate } from "./KeptPrivate";
import { locate, type NavItem, type ScreenId } from "./nav";
import { SCREENS } from "./screens";
import { WINDOW_CSS } from "./styles";
import { useScaleToFit } from "./useScaleToFit";

export const DESIGN_W = 1200;
export const DESIGN_H = 820; // 40 de chrome + 780 d'app
const FADE_MS = 250;

/**
 * Fenêtre Averröes autonome : c'est ce composant qui deviendra le composant de
 * code Framer. Il n'importe rien hors de `src/window/` sauf react, animejs et
 * lucide-react, et porte sa propre feuille de style.
 */
export function AverroesWindow({ initial = "onboarding" }: { initial?: ScreenId }) {
  const [screen, setScreen] = useState<ScreenId>(initial);
  const [menu, setMenu] = useState<MenuState>("closed");
  const [view, setView] = useState(0);
  const [secret, setSecret] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [dark, setDark] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);
  const timer = useRef<number | undefined>(undefined);
  const { ref, scale } = useScaleToFit(DESIGN_W);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // While the page scrolls, the window ignores the pointer: content sliding under a still
  // cursor would otherwise fire hover after hover (dock, charts, tabs) mid-scroll.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let idle: number | undefined;
    const onScroll = () => {
      if (!el.dataset.scrolling) el.dataset.scrolling = "";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => delete el.dataset.scrolling, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
    };
  }, [ref]);

  // Fermer = fondu puis démontage ; un clic sur Menu pendant le fondu rouvre.
  const close = useCallback(() => {
    setMenu((m) => (m === "open" ? "closing" : m));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMenu((m) => (m === "closing" ? "closed" : m)), FADE_MS);
  }, []);

  const toggle = useCallback(() => {
    if (menu === "open") return close();
    window.clearTimeout(timer.current);
    setMenu("open");
  }, [menu, close]);

  const pick = useCallback(
    (item: NavItem) => {
      if (item.screen) {
        setScreen((prev) => {
          if (prev !== item.screen) setView(0);
          return item.screen!;
        });
        setSecret(false);
      } else {
        setSecret(true);
      }
      close();
    },
    [close],
  );

  const closePanel = useCallback(() => setPanel(null), []);
  const onDock = useCallback(
    (a: DockAction) => {
      if (a === "theme") return setDark((d) => !d);
      if (a === "menu") {
        setPanel(null);
        return toggle();
      }
      close();
      setPanel((p) => (p === a ? null : a));
    },
    [toggle, close],
  );

  const { segment, item } = locate(screen);
  const views = SCREENS[screen];
  const Screen = views[Math.min(view, views.length - 1)].component;

  return (
    <div className="avw" data-theme={dark ? "dark" : undefined} ref={ref} style={{ width: "100%", height: DESIGN_H * scale, overflow: "hidden" }}>
      <style>{WINDOW_CSS}</style>
      <div style={{ width: DESIGN_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <BrowserFrame path={`averroes / ${segment.segment.toLowerCase()}`}>
          <div className="avw-app">
            <AppShell segment={segment} item={item} current={screen} hidden={menu !== "closed"} onTab={pick} views={views} view={view} onView={setView}>
              <div key={`${screen}-${view}`} data-testid="screen" className="avw-screen" style={{ height: "100%" }}>
                <Screen />
              </div>
            </AppShell>
            {secret && <KeptPrivate onClose={() => setSecret(false)} />}
            <FullMenu state={menu} current={screen} onClose={close} onPick={pick} />
            {panel === "feedback" && <FeedbackPanel onClose={closePanel} />}
            {panel === "notifs" && (
              <NotificationsPanel
                items={notifs}
                onRead={(id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, unread: false } : n)))}
                onReadAll={() => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false })))}
                onClose={closePanel}
              />
            )}
            {panel === "feed" && <FeedPanel onClose={closePanel} />}
            <Dock onAction={onDock} unread={notifs.filter((n) => n.unread).length} dark={dark} />
          </div>
        </BrowserFrame>
      </div>
    </div>
  );
}
