import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { markUrl, aiUrl } from './logos';
import { HOWTO } from './howtoContent';
import { bubbleShown, hideBubble } from './helpBubbles';

// Shared top bar for every screen: Repeatable AI logo first, then the company,
// then the screen's own controls, "How to use this", and the light/dark toggle last.

const THEME_KEY = 'repeatable-theme';

// ---------- "How to use this" open state (one panel per page; ?how=1 opens it on arrival) ----------
const HowToContext = createContext({ open: false, setOpen: () => {} });

const openOnArrival = () => {
    try {
        const q = new URLSearchParams(window.location.search).get('how');
        return q !== null && q !== '0';
    } catch { return false; }
};

export const HowToProvider = ({ children }) => {
    const [open, setOpen] = useState(openOnArrival);
    return <HowToContext.Provider value={{ open, setOpen }}>{children}</HowToContext.Provider>;
};

const QIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9.2" /><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.3-2.6 3.9" /><circle cx="12" cy="17.2" r=".6" fill="currentColor" />
    </svg>
);
const MoonIcon = () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16.2 12.4A6.8 6.8 0 0 1 7.6 3.8a6.8 6.8 0 1 0 8.6 8.6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
);
const SunIcon = () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.7" /><path d="M10 1.8v2.1M10 16.1v2.1M1.8 10h2.1M16.1 10h2.1M4.2 4.2l1.5 1.5M14.3 14.3l1.5 1.5M4.2 15.8l1.5-1.5M14.3 5.7l1.5-1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
);

const HowToPanel = ({ content, open, onClose, titleRef }) => {
    useEffect(() => {
        document.body.classList.toggle('rh-how-open', open);
        return () => document.body.classList.remove('rh-how-open');
    }, [open]);
    // Rendered into <body>: the top bar's backdrop blur would otherwise become the panel's containing block.
    return createPortal(
        <aside className="rh-how" id="rhHow" aria-labelledby="rhHowTitle" aria-hidden={open ? 'false' : 'true'} inert={!open}>
            <div className="rh-how-head">
                <h2 id="rhHowTitle" tabIndex={-1} ref={titleRef}>How to use this</h2>
                <button className="rh-how-x" type="button" data-rh-close onClick={onClose} data-help="Closes this panel and returns you to the screen. Esc does the same.">Close</button>
            </div>
            <div className="rh-how-body">
                <section><h3>What this is</h3>{content.what}</section>
                <section><h3>Why it matters</h3>{content.why}</section>
                <section><h3>How to use it</h3>{content.how}</section>
                <section><h3>Quick start</h3><ol>{content.quick.map((step, i) => <li key={i}>{step}</li>)}</ol></section>
                <section className="rh-more">
                    <details>
                        <summary data-help="Shows or hides the full step-by-step instructions. They stay folded until you open them.">
                            <h3>Detailed instructions</h3>
                            <span className="rh-more-hint"><span className="rh-more-show">Show the full steps</span><span className="rh-more-hide">Hide the full steps</span></span>
                        </summary>
                        <ol>{content.detail.map((step, i) => <li key={i}>{step}</li>)}</ol>
                    </details>
                </section>
            </div>
        </aside>,
        document.body
    );
};

const HowTo = ({ screen }) => {
    const { open, setOpen } = useContext(HowToContext);
    const btnRef = useRef(null);
    const titleRef = useRef(null);
    const wasOpen = useRef(open);

    // Focus: the panel heading when it opens, the button again when it closes.
    useEffect(() => {
        if (open && !wasOpen.current) titleRef.current?.focus({ preventScroll: true });
        if (!open && wasOpen.current) btnRef.current?.focus({ preventScroll: true });
        wasOpen.current = open;
    }, [open]);

    // Esc shuts the panel (an open help bubble is shut first, by the bubble listener).
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape' || !open) return;
            if (bubbleShown()) { hideBubble(); return; }
            e.stopPropagation();
            setOpen(false);
        };
        document.addEventListener('keydown', onKey, true);
        return () => document.removeEventListener('keydown', onKey, true);
    }, [open, setOpen]);

    const toggle = useCallback(() => { hideBubble(); setOpen(o => !o); }, [setOpen]);
    const close = useCallback(() => { hideBubble(); setOpen(false); }, [setOpen]);

    return (
        <>
            <button
                ref={btnRef}
                className="rh-howbtn"
                id="rhHowBtn"
                type="button"
                aria-controls="rhHow"
                aria-expanded={open ? 'true' : 'false'}
                onClick={toggle}
                data-help="Opens a panel on the right: what this screen is, why it matters and how to use it. Press it again, or Esc, to close."
            >
                <QIcon /><span className="rh-howlbl">How to use this</span>
            </button>
            <HowToPanel content={HOWTO[screen]} open={open} onClose={close} titleRef={titleRef} />
        </>
    );
};

// ---------- Light / dark toggle (light by default; the pre-paint script in index.html applies a saved choice) ----------
export const ThemeButton = () => {
    const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', dark ? '#0B1525' : '#E6EDF6');
    }, [dark]);
    const flip = () => {
        const next = !dark;
        setDark(next);
        try { localStorage.setItem(THEME_KEY, next ? 'dark' : 'light'); } catch { /* storage blocked: the choice lasts for this visit */ }
    };
    return (
        <button
            type="button"
            id="themeBtn"
            className="rh-icon-btn"
            onClick={flip}
            aria-pressed={dark ? 'true' : 'false'}
            aria-label={dark ? 'Switch to the light theme' : 'Switch to the dark theme'}
            data-help={dark ? 'Switches to the light theme. This device remembers your choice.' : 'Switches to the dark theme. This device remembers your choice.'}
        >
            {dark ? <SunIcon /> : <MoonIcon />}
        </button>
    );
};

export const RepeatableLogo = () => (
    <span className="rlogo" role="img" aria-label="Repeatable AI">
        <img src={markUrl} alt="" />
        <i className="rlogo-ai" style={{ WebkitMaskImage: `url(${aiUrl})`, maskImage: `url(${aiUrl})` }} />
    </span>
);

/**
 * TopBar
 *  screen    which "How to use this" copy to show: login | technician | admin | superadmin
 *  name      company or product name (text), or logoUrl for a company logo image
 *  sub       optional second line
 *  brand     optional company brand colour, drawn as a thin stripe along the top
 *  leading   optional control before the logo (the admin's menu button on phones)
 *  children  the screen's own controls (user name, log out), placed before How to use this
 */
export const TopBar = ({ screen, name, logoUrl, sub, brand, leading, children }) => (
    <header className="rh-topbar" style={brand ? { '--rh-brand': brand } : undefined} data-brand={brand ? 'on' : undefined}>
        {leading}
        <div className="rh-brand">
            <RepeatableLogo />
            <span className="rh-sep" aria-hidden="true" />
            <div className="rh-names">
                {logoUrl
                    ? <img src={logoUrl} alt={name || 'Company logo'} className="rh-company-logo" />
                    : <span className="rh-name">{name}</span>}
                {sub && <span className="rh-sub">{sub}</span>}
            </div>
        </div>
        <div className="rh-actions">
            {children}
            <HowTo screen={screen} />
            <ThemeButton />
        </div>
    </header>
);
