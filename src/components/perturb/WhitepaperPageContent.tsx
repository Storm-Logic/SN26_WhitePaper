"use client";

import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Scoped styles: re-maps every whitepaper CSS variable & class to the site's
   design-system tokens so the document looks native in both light and dark mode.
───────────────────────────────────────────────────────────────────────────── */
const WP_STYLES = `
/* ── Token mapping ───────────────────────────────────────────── */
.wp-wrapper {
  --bg:       var(--background);
  --bg2:      var(--card);
  --bg3:      var(--muted);
  --border:   var(--color-border);
  --border2:  var(--color-border);
  --ink:      var(--foreground);
  --ink2:     var(--foreground);
  --ink3:     var(--muted-foreground);
  --ink4:     var(--muted-foreground);
  --accent:   var(--primary);
  --code-bg:  var(--card);
  --code-fg:  var(--card-foreground);
  --nav-w:    252px;
  --content-w:740px;
  --r:        4px;
}

/* ── Layout ──────────────────────────────────────────────────── */
.wp-wrapper .layout { display: flex; min-height: 100vh; }

/* ── Sidebar ─────────────────────────────────────────────────── */
.wp-wrapper nav.sidebar {
  position: fixed; top: 64px; left: 0;
  width: var(--nav-w); height: calc(100vh - 64px);
  background: var(--bg);
  border-right: 1px solid var(--border);
  overflow-y: auto; padding: 2rem 0 3rem;
  display: flex; flex-direction: column;
  z-index: 40;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.wp-wrapper .nav-brand {
  padding: 0 1.5rem 1.25rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.75rem;
}
.wp-wrapper .nav-brand .logo {
  font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 700;
  color: var(--ink); letter-spacing: -0.02em; display: block;
}
.wp-wrapper .nav-brand .sub {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  color: var(--ink4); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 0.15rem;
}
.wp-wrapper .nav-download {
  display: flex; align-items: center; gap: 0.1rem; justify-content: center;
  margin: 0 1rem 0.75rem;
  padding: 0.55rem 1rem;
  background: var(--gradient-primary);
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  text-decoration: none; border-radius: 6px;
  box-shadow: var(--shadow-card);
  transition: opacity 0.15s, box-shadow 0.15s;
}
.wp-wrapper .nav-download:hover { opacity: 0.88; box-shadow: var(--shadow-glow); }
.wp-wrapper .nav-label {
  font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
  text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink4);
  padding: 0.75rem 1.5rem 0.25rem;
}
.wp-wrapper nav.sidebar a {
  display: flex; align-items: baseline; gap: 0.5rem;
  padding: 0.25rem 1.5rem;
  color: var(--ink3); text-decoration: none;
  font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; line-height: 1.5;
  transition: color 0.12s, background 0.12s;
  border-left: 2px solid transparent;
}
.wp-wrapper nav.sidebar a .num { font-size: 0.65rem; color: var(--ink4); flex-shrink: 0; transition: color 0.12s; }
.wp-wrapper nav.sidebar a:hover,
.wp-wrapper nav.sidebar a.active {
  color: var(--ink); background: var(--bg3); border-left-color: var(--primary);
}
.wp-wrapper nav.sidebar a.sub { padding-left: 2.6rem; font-size: 0.68rem; color: var(--ink4); }
.wp-wrapper nav.sidebar a.sub:hover,
.wp-wrapper nav.sidebar a.sub.active { color: var(--ink3); }

/* ── Main ────────────────────────────────────────────────────── */
.wp-wrapper main { margin-left: var(--nav-w); flex: 1; padding: 0 3rem 8rem; }
.wp-wrapper .content { max-width: var(--content-w); margin: 0 auto; padding-top: 5rem; }

/* ── Hero ────────────────────────────────────────────────────── */
.wp-wrapper .hero { padding: 5rem 0 3.5rem; border-bottom: 1px solid var(--border); margin-bottom: 4rem; }
.wp-wrapper .hero-kicker {
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
  text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink4); margin-bottom: 1.25rem;
}
.wp-wrapper h1.hero-title {
  font-family: 'Sora', system-ui, sans-serif; font-size: 3.6rem; font-weight: 700;
  letter-spacing: -0.04em; line-height: 1.0; margin-bottom: 1rem;
  background: var(--gradient-hero);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.wp-wrapper .hero-tagline { font-size: 1.2rem; color: var(--ink3); font-weight: 400; margin-bottom: 2rem; line-height: 1.5; }
.wp-wrapper .hero-meta { display: flex; gap: 3rem; flex-wrap: wrap; }
.wp-wrapper .hero-meta-item .label {
  font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--ink4); display: block;
}
.wp-wrapper .hero-meta-item .value {
  font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: var(--ink3);
}

/* ── Stat Grid ───────────────────────────────────────────────── */
.wp-wrapper .stat-grid {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 0; margin: 2rem 0; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
}
.wp-wrapper .stat-card { padding: 1.25rem 1rem; border-right: 1px solid var(--border); }
.wp-wrapper .stat-card:last-child { border-right: none; }
.wp-wrapper .stat-card .num {
  font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 700;
  color: var(--primary); display: block; margin-bottom: 0.35rem; line-height: 1;
}
.wp-wrapper .stat-card .desc {
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: var(--ink3); line-height: 1.4;
}

/* ── Section ─────────────────────────────────────────────────── */
.wp-wrapper .section { padding-top: 1rem; margin-bottom: 4rem; }
.wp-wrapper .section-header {
  display: flex; align-items: baseline; gap: 1rem;
  border-bottom: 1px solid var(--border); padding-bottom: 0.6rem; margin-bottom: 1.75rem;
}
.wp-wrapper .section-num { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: var(--primary); flex-shrink: 0; }
.wp-wrapper h2.section-title {
  font-family: 'Sora', system-ui, sans-serif; font-size: 1.2rem; font-weight: 700;
  color: var(--ink); letter-spacing: -0.01em;
}
.wp-wrapper h3.sub-title {
  font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink3);
  margin: 2.25rem 0 0.85rem; padding-bottom: 0.35rem; border-bottom: 1px solid var(--border);
}
.wp-wrapper h4.sub-sub {
  font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; font-weight: 700;
  color: var(--ink); margin: 1.25rem 0 0.4rem;
}

/* ── Body text ───────────────────────────────────────────────── */
.wp-wrapper p { font-family: 'Inter', system-ui, sans-serif; color: var(--ink3); margin-bottom: 1rem; line-height: 1.75; }
.wp-wrapper p:last-child { margin-bottom: 0; }
.wp-wrapper strong { color: var(--ink); font-weight: 600; }

/* ── Abstract ────────────────────────────────────────────────── */
.wp-wrapper .abstract {
  border-left: 3px solid var(--primary);
  padding: 1.25rem 1.5rem; background: var(--bg2); margin: 1.5rem 0; border-radius: 0 6px 6px 0;
}
.wp-wrapper .abstract p { font-size: 1rem; }

/* ── Side cards ──────────────────────────────────────────────── */
.wp-wrapper .card-list {
  display: flex; flex-direction: column; gap: 0;
  margin: 1rem 0; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
}
.wp-wrapper .side-card {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border); border-left: 3px solid var(--primary);
}
.wp-wrapper .side-card:last-child { border-bottom: none; }
.wp-wrapper .side-card p { margin: 0; font-size: 0.95rem; }

/* ── Callout ─────────────────────────────────────────────────── */
.wp-wrapper .callout {
  border: 1px solid var(--border); border-left: 3px solid var(--primary);
  padding: 0.9rem 1.25rem; margin: 1.5rem 0;
  display: flex; gap: 0.75rem; align-items: flex-start;
  background: var(--bg3); border-radius: 0 6px 6px 0;
}
.wp-wrapper .callout .icon { flex-shrink: 0; font-size: 0.9rem; margin-top: 0.15rem; color: var(--primary); }
.wp-wrapper .callout p {
  color: var(--ink); font-size: 0.92rem; font-weight: 500; margin: 0;
  font-family: 'JetBrains Mono', monospace;
}

/* ── Code ────────────────────────────────────────────────────── */
.wp-wrapper .code-label {
  font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary);
  display: block; margin-bottom: 0.4rem;
}
.wp-wrapper pre {
  background: var(--bg2); border: 1px solid var(--border);
  padding: 1.25rem 1.5rem; overflow-x: auto; margin: 0.75rem 0; border-radius: 8px;
}
.wp-wrapper pre code {
  font-family: 'JetBrains Mono', monospace; font-size: 0.78rem;
  color: var(--ink); line-height: 1.7;
}
.wp-wrapper .inline-code {
  font-family: 'JetBrains Mono', monospace; font-size: 0.8em;
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--primary); padding: 0.05em 0.35em; border-radius: 3px;
}

/* ── Formula ─────────────────────────────────────────────────── */
.wp-wrapper .formula-group {
  display: flex; flex-direction: column; gap: 0;
  margin: 1rem 0; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
}
.wp-wrapper .formula {
  background: var(--bg2); padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: var(--ink);
}
.wp-wrapper .formula:last-child { border-bottom: none; }
.wp-wrapper .formula .fl {
  display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink4); margin-bottom: 0.35rem;
}
.wp-wrapper .formula sub { font-size: 0.72em; }

/* ── Tables ──────────────────────────────────────────────────── */
.wp-wrapper .table-wrap {
  overflow-x: auto; margin: 1rem 0;
  border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
}
.wp-wrapper table { width: 100%; border-collapse: collapse; }
.wp-wrapper thead tr { background: var(--gradient-primary); }
.wp-wrapper thead th {
  padding: 0.65rem 0.9rem; text-align: left;
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 700;
  color: var(--primary-foreground); letter-spacing: 0.06em; text-transform: uppercase;
}
.wp-wrapper tbody tr { border-bottom: 1px solid var(--border); }
.wp-wrapper tbody tr:last-child { border-bottom: none; }
.wp-wrapper tbody tr:nth-child(even) { background: var(--bg2); }
.wp-wrapper tbody td { padding: 0.6rem 0.9rem; font-size: 0.88rem; color: var(--ink3); vertical-align: top; }
.wp-wrapper td.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: var(--ink); }
.wp-wrapper td.hl { color: var(--ink); font-weight: 600; }
.wp-wrapper td.pass { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--primary); }
.wp-wrapper td.fail { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--ink4); }
.wp-wrapper .rank-1 td { font-weight: 700; color: var(--ink) !important; }
.wp-wrapper .rank-2 td { font-weight: 600; color: var(--ink3) !important; }
.wp-wrapper .rank-3 td { color: var(--ink3) !important; }

/* ── Tags ────────────────────────────────────────────────────── */
.wp-wrapper .tag {
  display: inline-block; font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 0.2rem 0.55rem; margin-top: 0.5rem;
  border: 1px solid var(--primary); color: var(--primary); border-radius: 4px;
}

/* ── Pipeline diagram ────────────────────────────────────────── */
.wp-wrapper .pipeline-wrap {
  background: var(--bg2); border: 1px solid var(--border);
  padding: 2rem 1.5rem; margin: 1.5rem 0; overflow-x: auto; border-radius: 8px;
}
.wp-wrapper .pipeline-svg { width: 100%; max-width: 720px; display: block; margin: 0 auto; height: auto; }
/* In dark mode, invert the B&W SVG so lines/text become readable */
.dark .wp-wrapper .pipeline-svg { filter: invert(0.88); }

/* ── Flow timeline ───────────────────────────────────────────── */
.wp-wrapper .tl { display: flex; flex-direction: column; gap: 0; margin: 1rem 0; }
.wp-wrapper .tl-item { display: flex; gap: 1.25rem; padding: 1rem 0; border-bottom: 1px solid var(--border); }
.wp-wrapper .tl-item:last-child { border-bottom: none; }
.wp-wrapper .tl-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); flex-shrink: 0; margin-top: 0.55rem; }
.wp-wrapper .tl-body .tl-phase { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink4); }
.wp-wrapper .tl-title { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700; color: var(--ink); margin: 0.1rem 0 0.3rem; }
.wp-wrapper .tl-desc { font-size: 0.92rem; color: var(--ink3); line-height: 1.65; }
.wp-wrapper .tl-target {
  display: inline-block; margin-top: 0.4rem;
  font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--primary);
  border-bottom: 1px dashed var(--border);
}

/* ── Footer ──────────────────────────────────────────────────── */
.wp-wrapper footer {
  margin-top: 5rem; padding: 2rem 0 1.5rem;
  border-top: 1px solid var(--border); text-align: center;
}
.wp-wrapper footer .fb { font-family: 'Sora', system-ui, sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.3rem; }
.wp-wrapper footer .fd { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--ink4); margin-bottom: 0.75rem; }
.wp-wrapper footer .disc { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--ink4); max-width: 480px; margin: 1rem auto 0; line-height: 1.6; }

/* ── Global footer offset (whitepaper page only) ─────────────── */
.wp-wrapper ~ footer { margin-left: 252px; }

/* ── Responsive ──────────────────────────────────────────────── */
@media(max-width: 860px) {
  .wp-wrapper nav.sidebar { display: none; }
  .wp-wrapper main { margin-left: 0; padding: 0 1.5rem 4rem; }
  .wp-wrapper .stat-grid { grid-template-columns: repeat(2,1fr); }
  .wp-wrapper h1.hero-title { font-size: 2.4rem; }
  .wp-wrapper ~ footer { margin-left: 0; }
}
@media(max-width: 480px) { .wp-wrapper .stat-grid { grid-template-columns: 1fr; } }
`;

interface Props {
  htmlContent: string;
}

export function WhitepaperPageContent({ htmlContent }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Re-implement the sidebar intersection observer (stripped from the HTML script tag)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const sections = el.querySelectorAll("section[id]");
    const links = el.querySelectorAll('nav.sidebar a[href^="#"]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            links.forEach((a) =>
              a.classList.toggle(
                "active",
                a.getAttribute("href") === "#" + e.target.id
              )
            );
        });
      },
      { rootMargin: "-15% 0px -75% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [htmlContent]);

  return (
    <div className="wp-wrapper">
      {/* Scoped theme overrides */}
      <style dangerouslySetInnerHTML={{ __html: WP_STYLES }} />

      {/* Whitepaper HTML body */}
      <div ref={contentRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

