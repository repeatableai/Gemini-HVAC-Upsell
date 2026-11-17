/* Rollover help bubbles: the bubble half of the Repeatable AI howto.js (v1, 2026-11-16),
   ported to run once inside this React app. Master copy: ~/.claude/skills/repeatable-design-style/howto.js.
   Every functional control carries data-help="one short sentence"; controls a script draws later
   can be labelled with window.RH_HELP = [[cssSelector, textOrFunction], ...].
   A bubble shows on mouse hover, on keyboard focus, and on press-and-hold (half a second) on touch screens,
   themed through the --cta / --cta-ink tokens and kept inside the viewport. */

let installed = false;
let current = null;
let tip = null;
let hideFn = () => {};

export function bubbleShown() { return !!current; }
export function hideBubble() { hideFn(); }

export function installHelpBubbles() {
    if (installed || typeof document === 'undefined') return;
    installed = true;
    const D = document;

    tip = D.createElement('div');
    tip.id = 'rh-tip'; tip.className = 'rh-tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
    let timer = 0;

    const textOf = (rule, el) => (typeof rule === 'function' ? rule(el) : rule);
    const label = (el, text) => {
        if (!text || el.hasAttribute('data-help')) return;
        el.setAttribute('data-help', text);
        if (el.hasAttribute('title')) el.removeAttribute('title'); /* one bubble, never two */
    };
    const apply = (root) => {
        const rules = window.RH_HELP || [];
        for (const [sel, rule] of rules) {
            if (root.nodeType !== 1 && root !== D) continue;
            if (root.matches && root.matches(sel)) label(root, textOf(rule, root));
            root.querySelectorAll(sel).forEach(el => label(el, textOf(rule, el)));
        }
        if (root.querySelectorAll) root.querySelectorAll('[data-help][title]').forEach(el => el.removeAttribute('title'));
    };

    const place = (el) => {
        const r = el.getBoundingClientRect(), vw = D.documentElement.clientWidth, vh = window.innerHeight;
        tip.style.maxWidth = Math.min(320, vw - 24) + 'px';
        tip.style.left = '0px'; tip.style.top = '0px';
        const w = tip.offsetWidth, h = tip.offsetHeight;
        const x = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, vw - w - 12));
        let y = r.top - h - 10, below = false;
        if (y < 8) { y = r.bottom + 10; below = true; }
        if (y + h > vh - 8) y = Math.max(8, vh - h - 8);
        tip.style.left = Math.round(x) + 'px'; tip.style.top = Math.round(y) + 'px';
        tip.classList.toggle('below', below);
    };
    const show = (el) => {
        const t = el.getAttribute('data-help');
        if (!t) return;
        if (current && current !== el) current.removeAttribute('aria-describedby');
        current = el; tip.textContent = t; tip.hidden = false; tip.classList.remove('on');
        place(el);
        el.setAttribute('aria-describedby', 'rh-tip');
        requestAnimationFrame(() => { if (current === el) tip.classList.add('on'); });
    };
    const hide = () => {
        clearTimeout(timer);
        if (current) current.removeAttribute('aria-describedby');
        current = null; tip.classList.remove('on'); tip.hidden = true;
    };
    hideFn = hide;
    const target = (e) => (e.target && e.target.closest ? e.target.closest('[data-help]') : null);

    D.addEventListener('pointerover', (e) => {
        if (e.pointerType === 'touch') return;
        const el = target(e);
        if (!el || el === current) return;
        clearTimeout(timer);
        timer = setTimeout(() => show(el), 220);
    });
    D.addEventListener('pointerout', (e) => {
        const el = target(e);
        if (!el) return;
        if (e.relatedTarget && el.contains(e.relatedTarget)) return;
        clearTimeout(timer);
        if (el === current) hide();
    });
    D.addEventListener('focusin', (e) => {
        const el = target(e);
        if (!el) return;
        let keyboard = true;
        try { keyboard = el.matches(':focus-visible'); } catch { /* older browsers: treat as keyboard */ }
        if (keyboard) show(el);
    });
    D.addEventListener('focusout', () => hide());
    D.addEventListener('pointerdown', () => hide(), true);
    window.addEventListener('scroll', () => { if (current) hide(); }, true);
    window.addEventListener('resize', () => { if (current) hide(); });
    /* Esc closes an open bubble first; the How to use this panel listens after this one. */
    D.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && current) { hide(); e.stopImmediatePropagation(); }
    }, true);

    /* Touch: press and hold for half a second to read a bubble. */
    let hold = 0;
    D.addEventListener('touchstart', (e) => {
        const el = target(e);
        clearTimeout(hold);
        if (el) hold = setTimeout(() => show(el), 500);
    }, { passive: true });
    D.addEventListener('touchend', () => clearTimeout(hold), { passive: true });

    const start = () => {
        D.body.appendChild(tip);
        apply(D);
        if (window.MutationObserver) {
            new MutationObserver((list) => {
                for (const m of list) m.addedNodes.forEach(n => { if (n.nodeType === 1) apply(n); });
                if (current && !D.body.contains(current)) hide();
            }).observe(D.body, { childList: true, subtree: true });
        }
    };
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
}
