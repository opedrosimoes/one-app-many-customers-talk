import React from 'react';
import {
  Deck, Slide, Heading, Text, FlexBox, Grid, Notes, Progress, Appear,
  fadeTransition
} from 'spectacle';

const accent = '#4fc3f7';
const accent2 = '#81c784';
const accent3 = '#ffb74d';
const red = '#e57373';
const purple = '#ce93d8';
const grey = '#78909c';
const bg = '#0d0d1a';
const bgCard = '#1a1a2e';
const ff = '"Segoe UI", system-ui, sans-serif';
const fm = '"Fira Code", "Cascadia Code", monospace';

const theme = {
  colors: { primary: accent, secondary: accent2, tertiary: bg, quaternary: accent3, quinary: red },
  fonts: { header: ff, text: ff, monospace: fm },
  fontSizes: { h1: '56px', h2: '40px', h3: '28px', text: '24px', monospace: '18px' },
  space: [0, 4, 8, 16, 24, 32, 48, 64],
};

const card = (bc) => ({
  background: bgCard, border: `2px solid ${bc || '#333'}`, borderRadius: 12,
  padding: '22px 26px', boxSizing: 'border-box', width: '100%', fontFamily: ff,
});
const tag = (c, b) => ({
  display: 'inline-block', background: b, color: c, border: `1px solid ${c}`,
  borderRadius: 8, padding: '6px 16px', fontSize: 20, margin: '4px 6px', fontFamily: ff,
});
const ul = { fontSize: 22, color: '#ddd', lineHeight: 1.8, paddingLeft: 20, fontFamily: ff, margin: 0 };
const code = { background: '#1e1e2e', border: '1px solid #333', borderRadius: 10, padding: '16px 18px', fontSize: 18, color: '#cdd6f4', overflow: 'auto', marginTop: 10, fontFamily: fm, whiteSpace: 'pre', lineHeight: 1.6, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' };

/* Syntax color tokens (Catppuccin Mocha inspired) */
const syn = {
  kw: '#cba6f7',   // keywords: public, class, extends, return, etc.
  ann: '#f9e2af',  // annotations: @Component, @Override, etc.
  str: '#a6e3a1',  // strings
  cm: '#6c7086',   // comments
  fn: '#89b4fa',   // method/function names
  ty: '#fab387',   // types
  num: '#fab387',  // numbers
  base: '#cdd6f4', // default text
};

/** Lightweight syntax highlighter for Java/YAML code blocks */
function colorize(src) {
  const rules = [
    [/\/\/.*$/gm, syn.cm],                                    // single-line comments
    [/"[^"]*"/g, syn.str],                                     // strings
    [/'[^']*'/g, syn.str],                                     // single-quoted strings
    [/@\w+/g, syn.ann],                                        // annotations
    [/\b(public|class|extends|implements|return|new|void|static|final|if|throw|null)\b/g, syn.kw], // keywords
    [/\b(String|List|Map|Runnable|ScopedValue|int)\b/g, syn.ty], // types
    [/\b(SpringApplication|SpringBootApplication|EnableMultiTenancy|Component|Override)\b/g, syn.ann], // well-known annotations/classes
    [/\b\d+\b/g, syn.num],                                    // numbers
    [/\b(run|main|of|ofReusable|handle|process|allowedUris|submit|where|setCurrentContext|getCurrentContext|clearContext)\b(?=\s*\()/g, syn.fn], // function calls
  ];
  // Build spans with priority (earlier rules win for overlapping ranges)
  const spans = []; // { start, end, color }
  for (const [re, color] of rules) {
    let m;
    const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(src)) !== null) {
      spans.push({ start: m.index, end: m.index + m[0].length, color });
    }
  }
  // Sort by start, resolve overlaps (first match wins)
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged = [];
  let last = 0;
  for (const s of spans) {
    if (s.start < last) continue; // skip overlapping
    merged.push(s);
    last = s.end;
  }
  // Build React elements
  const parts = [];
  let pos = 0;
  for (const s of merged) {
    if (s.start > pos) parts.push(src.slice(pos, s.start));
    parts.push(<span key={s.start} style={{ color: s.color }}>{src.slice(s.start, s.end)}</span>);
    pos = s.end;
  }
  if (pos < src.length) parts.push(src.slice(pos));
  return parts;
}

/** Code block component with syntax highlighting */
function Code({ children, style: extraStyle }) {
  const merged = { ...code, ...extraStyle };
  const src = typeof children === 'string' ? children : String(children);
  return <div style={merged}>{colorize(src)}</div>;
}

/** Appear wrapper with smooth slide-up + fade for code blocks */
function AppearCode({ children }) {
  return (
    <Appear
      activeStyle={{ opacity: 1, transform: 'translateY(0)', transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      inactiveStyle={{ opacity: 0, transform: 'translateY(12px)', transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
    >
      {children}
    </Appear>
  );
}
const st = { fontSize: 22, color: '#bbb', lineHeight: 1.6, fontFamily: ff, margin: '6px 0' };
const h3 = (c) => ({ color: c || accent2, fontSize: 26, margin: '0 0 10px 0', fontFamily: ff, fontWeight: 'bold' });
const sp = '48px'; // standard spacing between title and body

/* ── CSS Keyframe Animations ── */
const globalStyles = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes drawLine {
  from { stroke-dashoffset: 1000; }
  to { stroke-dashoffset: 0; }
}
.fade-in-up { animation: fadeInUp 0.6s ease-out both; }
.fade-in-up-d1 { animation: fadeInUp 0.6s ease-out 0.15s both; }
.fade-in-up-d2 { animation: fadeInUp 0.6s ease-out 0.3s both; }
.fade-in-up-d3 { animation: fadeInUp 0.6s ease-out 0.45s both; }
.pulse-slow { animation: pulse 2.5s ease-in-out infinite; }
`;

function GlobalCSS() {
  return <style dangerouslySetInnerHTML={{ __html: globalStyles }} />;
}

/**
 * SlideContent — Two-part layout for consistent title alignment across all slides.
 * Title area: fixed at the top, always same vertical position.
 * Body area: flex-grows to fill remaining space, content vertically centered.
 *
 * Props:
 *   title     — main heading text (required)
 *   subtitle  — optional subtitle text below heading
 *   titleColor — heading color (default: accent)
 *   children  — body content
 */
function SlideContent({ title, subtitle, titleColor, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Fixed title area */}
      <div style={{ flexShrink: 0, textAlign: 'center' }}>
        <Heading fontSize="42px" fontFamily={ff} color={titleColor || accent} margin="0">
          {title}
        </Heading>
      </div>
      {/* Body area — vertically centered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 0 }}>
        {subtitle && (
          <div style={{ fontSize: 22, fontFamily: ff, color: '#bbb', lineHeight: 1.5, marginBottom: 24, textAlign: 'center' }}>
            {subtitle}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ── Slide 1: Title ── */
function TitleSlide() {
  return (
    <FlexBox flexDirection="column" alignItems="center" justifyContent="center" height="100%">
      <div className="fade-in-up">
        <Heading fontSize="60px" fontFamily={ff} color={accent} margin="0 0 16px 0">One App, Many Customers</Heading>
      </div>
      <div className="fade-in-up-d1">
        <Text fontSize="28px" fontFamily={ff} color="#aaa" margin="0 0 48px 0">Inside a Multitenant Spring Boot Application</Text>
      </div>
      <div className="fade-in-up-d2">
        <FlexBox flexWrap="wrap" justifyContent="center">
          <span style={tag(accent, '#1e3a5f')}>Spring Boot 3.5</span>
          <span style={tag(accent, '#1e3a5f')}>Java 21</span>
          <span style={tag(accent2, '#1b3a2a')}>MySQL</span>
          <span style={tag(accent2, '#1b3a2a')}>MongoDB</span>
          <span style={tag(accent3, '#3a2a1b')}>Kafka</span>
          <span style={tag(accent3, '#3a2a1b')}>SQS</span>
          <span style={tag(purple, '#2a1a3e')}>S3</span>
          <span style={tag(purple, '#2a1a3e')}>WebSocket</span>
        </FlexBox>
      </div>
    </FlexBox>
  );
}

/* ── Slide 2: The Story ── */
function StorySlide() {
  const items = [
    { n: 1, c: accent, bg: '#1e3a5f', t: 'Single Service', d: 'One highway operator. One database. Simple, straightforward Spring Boot app.' },
    { n: 2, c: accent2, bg: '#1b3a2a', t: 'Growth: Multiple Operators', d: 'New highway operators onboarded. Each required data isolation — one database per concession.' },
    { n: 3, c: accent3, bg: '#3a2a1b', t: 'Legal & Regional Requirements', d: 'Some countries mandated data residency by law. Others required regional separation for operational reasons.' },
    { n: 4, c: purple, bg: '#2a1a3e', t: 'Hybrid Model', d: 'Depending on the domain/context of each service, some use a shared DB (logical multitenancy), others get fully isolated databases (physical multitenancy).' },
  ];
  return (
    <SlideContent title="The Story">
      <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {items.map(i => (
          <Appear key={i.n}>
            <div style={{ display: 'flex', gap: 22, alignItems: 'center', background: bgCard, border: `1.5px solid ${i.c}22`, borderRadius: 12, padding: '18px 24px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 24, flexShrink: 0, background: i.bg, color: i.c, border: `2px solid ${i.c}`, fontFamily: ff }}>{i.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 26, marginBottom: 6, color: i.c, fontFamily: ff }}>{i.t}</div>
                <div style={{ fontSize: 21, color: '#bbb', lineHeight: 1.55, fontFamily: ff }}>{i.d}</div>
              </div>
            </div>
          </Appear>
        ))}
      </div>
    </SlideContent>
  );
}

/* ── Slide 3: Architecture ── */
function StoryArchSlide() {
  return (
    <SlideContent title="The Story — Architecture" subtitle="Each service decides its DB strategy based on domain context. A service is either single-DB or multi-DB — not both.">
      <svg viewBox="0 0 800 290" style={{ width: '100%', maxWidth: 800, height: 'auto', display: 'block', fontFamily: ff }}>
        {/* App */}
        <rect x="280" y="10" width="240" height="55" rx="10" fill="#1e3a5f" stroke={accent} strokeWidth="2.5"/>
        <text x="400" y="43" textAnchor="middle" fill={accent} fontSize="20" fontWeight="bold" fontFamily={ff}>Spring Boot App</text>
        {/* Arrow down to Library */}
        <line x1="400" y1="65" x2="400" y2="95" stroke={accent} strokeWidth="2"/>
        <polygon points="400,95 395,87 405,87" fill={accent}/>
        {/* Library */}
        <rect x="280" y="95" width="240" height="48" rx="10" fill="#2a1a3e" stroke={purple} strokeWidth="2.5"/>
        <text x="400" y="125" textAnchor="middle" fill={purple} fontSize="18" fontFamily={ff}>Multitenancy Library</text>
        {/* Vertical line down from library center */}
        <line x1="400" y1="143" x2="400" y2="175" stroke={purple} strokeWidth="2"/>
        {/* Horizontal distribution line */}
        <line x1="110" y1="175" x2="690" y2="175" stroke="#555" strokeWidth="2"/>
        {/* Vertical drops to each operator */}
        <line x1="110" y1="175" x2="110" y2="200" stroke="#555" strokeWidth="2"/>
        <polygon points="110,200 105,192 115,192" fill="#555"/>
        <line x1="300" y1="175" x2="300" y2="200" stroke="#555" strokeWidth="2"/>
        <polygon points="300,200 295,192 305,192" fill="#555"/>
        <line x1="500" y1="175" x2="500" y2="200" stroke="#555" strokeWidth="2"/>
        <polygon points="500,200 495,192 505,192" fill="#555"/>
        <line x1="690" y1="175" x2="690" y2="200" stroke="#555" strokeWidth="2"/>
        <polygon points="690,200 685,192 695,192" fill="#555"/>
        {/* Operators */}
        <rect x="20" y="200" width="180" height="65" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="110" y="228" textAnchor="middle" fill={accent2} fontSize="16" fontWeight="bold" fontFamily={ff}>PT Concession</text>
        <text x="110" y="250" textAnchor="middle" fill="#aaa" fontSize="14" fontFamily={ff}>Shared DB (logical)</text>
        <rect x="210" y="200" width="180" height="65" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="300" y="228" textAnchor="middle" fill={accent2} fontSize="16" fontWeight="bold" fontFamily={ff}>ES Concession</text>
        <text x="300" y="250" textAnchor="middle" fill={accent3} fontSize="14" fontFamily={ff}>Own DB (legislation)</text>
        <rect x="410" y="200" width="180" height="65" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="500" y="228" textAnchor="middle" fill={accent2} fontSize="16" fontWeight="bold" fontFamily={ff}>CR Concession</text>
        <text x="500" y="250" textAnchor="middle" fill={accent3} fontSize="14" fontFamily={ff}>Own DB (regional)</text>
        <rect x="600" y="200" width="180" height="65" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="690" y="228" textAnchor="middle" fill={accent2} fontSize="16" fontWeight="bold" fontFamily={ff}>US Concession</text>
        <text x="690" y="250" textAnchor="middle" fill={accent3} fontSize="14" fontFamily={ff}>Own DB (regional)</text>
        <text x="400" y="305" textAnchor="middle" fill={accent3} fontSize="16" fontFamily={ff}>One app · Many concessions · Isolated data</text>
      </svg>
    </SlideContent>
  );
}


/* ── Slide 4: What is Multitenancy ── */
function WhatIsMultitenancySlide() {
  return (
    <SlideContent title="What is Multitenancy?">
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div>
            <div style={{ ...card(accent), marginBottom: 18 }}>
              <div style={h3(accent)}>Physical Multitenancy</div>
              <p style={st}>Each tenant has a <span style={{ color: accent3, fontWeight: 'bold' }}>dedicated database</span>. Full isolation. Required by law in some jurisdictions or for operational independence.</p>
            </div>
            <div style={card(accent2)}>
              <div style={h3(accent2)}>Logical Multitenancy</div>
              <p style={st}>All tenants share a <span style={{ color: accent3, fontWeight: 'bold' }}>single database</span>, rows scoped by a <code style={{ color: accent3, fontFamily: fm }}>tenant_id</code> column. Simpler ops, less isolation.</p>
            </div>
            <p style={{ ...st, marginTop: 18 }}>The choice is driven by the <span style={{ color: accent3, fontWeight: 'bold' }}>service domain/context</span> — our library supports both models.</p>
          </div>
        </Appear>
        <Appear>
          <FlexBox alignItems="center" justifyContent="center">
          <svg viewBox="0 0 360 280" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
            <rect x="105" y="5" width="150" height="48" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
            <text x="180" y="35" textAnchor="middle" fill={accent} fontSize="15" fontWeight="bold" fontFamily={ff}>Spring Boot App</text>
            <line x1="180" y1="53" x2="180" y2="80" stroke={accent} strokeWidth="2"/>
            <polygon points="180,80 175,72 185,72" fill={accent}/>
            <rect x="105" y="80" width="150" height="40" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
            <text x="180" y="105" textAnchor="middle" fill={purple} fontSize="14" fontFamily={ff}>Tenant Router</text>
            {/* Tree-style connections */}
            <line x1="180" y1="120" x2="180" y2="135" stroke="#555" strokeWidth="1.5"/>
            <line x1="65" y1="135" x2="295" y2="135" stroke="#555" strokeWidth="1.5"/>
            <line x1="65" y1="135" x2="65" y2="158" stroke="#555" strokeWidth="1.5"/>
            <polygon points="65,158 60,150 70,150" fill="#555"/>
            <line x1="180" y1="135" x2="180" y2="158" stroke="#555" strokeWidth="1.5"/>
            <polygon points="180,158 175,150 185,150" fill="#555"/>
            <line x1="295" y1="135" x2="295" y2="158" stroke="#555" strokeWidth="1.5"/>
            <polygon points="295,158 290,150 300,150" fill="#555"/>
            <rect x="15" y="158" width="100" height="62" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2.5"/>
            <text x="65" y="184" textAnchor="middle" fill={accent2} fontSize="13" fontWeight="bold" fontFamily={ff}>Service A</text>
            <text x="65" y="204" textAnchor="middle" fill={accent3} fontSize="10" fontFamily={ff}>Own DB (physical)</text>
            <rect x="130" y="158" width="100" height="62" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2.5"/>
            <text x="180" y="184" textAnchor="middle" fill={accent2} fontSize="13" fontWeight="bold" fontFamily={ff}>Service B</text>
            <text x="180" y="204" textAnchor="middle" fill={accent} fontSize="10" fontFamily={ff}>Shared DB (logical)</text>
            <rect x="245" y="158" width="100" height="62" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2.5"/>
            <text x="295" y="184" textAnchor="middle" fill={accent2} fontSize="13" fontWeight="bold" fontFamily={ff}>Service C</text>
            <text x="295" y="204" textAnchor="middle" fill={accent3} fontSize="10" fontFamily={ff}>Own DB (physical)</text>
            <text x="180" y="250" textAnchor="middle" fill={accent3} fontSize="13" fontFamily={ff}>DB strategy per service context</text>
          </svg>
        </FlexBox>
        </Appear>
      </Grid>
    </SlideContent>
  );
}

/* ── Slide 5: The Problem ── */
function ProblemSlide() {
  return (
    <SlideContent title="The Problem We Solved">
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div style={card(red)}>
            <div style={h3(red)}>Without This Library</div>
            <ul style={ul}>
              <li>Multitenancy logic scattered across every service</li>
              <li>Each team reimplementing tenant resolution</li>
              <li>Inconsistent header parsing across services</li>
              <li>No standard for Kafka / SQS consumers</li>
              <li>Copy-paste datasource routing code everywhere</li>
              <li>Bugs silently writing to the wrong database</li>
            </ul>
          </div>
        </Appear>
        <Appear>
          <div style={card(accent2)}>
            <div style={h3(accent2)}>With This Library</div>
            <ul style={ul}>
              <li>Single shared library, one place to maintain</li>
              <li>One annotation: <code style={{ color: accent3, fontFamily: fm }}>@EnableMultiTenancy</code></li>
              <li>Consistent tenant context across all transports</li>
              <li>Plug-in modules per infrastructure type</li>
              <li>Teams focus entirely on business logic</li>
              <li>Context lifecycle managed and guaranteed</li>
            </ul>
          </div>
        </Appear>
      </Grid>
    </SlideContent>
  );
}


/* ── Slide 6: V1 Concepts (improved layout) ── */
function EvolutionV1ConceptsSlide() {
  return (
    <SlideContent title="Evolution — v1: The Foundation">
      <div style={{ width: '100%' }}>
        {/* Center piece — TenantContextHolder */}
        <Appear>
          <FlexBox justifyContent="center" margin="0 0 28px 0">
            <div style={{ ...card(accent), maxWidth: 580, textAlign: 'center', borderWidth: 3 }}>
              <div style={{ ...h3(accent), textAlign: 'center', fontSize: 28 }}>TenantContextHolder</div>
              <p style={{ ...st, textAlign: 'center' }}>A <code style={{ color: accent3, fontFamily: fm }}>ThreadLocal&lt;ContextMessage&gt;</code> holding <code style={{ color: accent3, fontFamily: fm }}>tenantId</code> + <code style={{ color: accent3, fontFamily: fm }}>userId</code>.</p>
              <p style={{ ...st, textAlign: 'center', fontSize: 19, marginTop: 6 }}>Static methods powered by <code style={{ color: accent3, fontFamily: fm }}>ThreadLocal</code> — no injection needed to read the current tenant.</p>
              <p style={{ ...st, textAlign: 'center', color: accent3, marginTop: 8 }}>Single source of truth for the current tenant.</p>
            </div>
          </FlexBox>
        </Appear>
        {/* Subtitle */}
        <Appear>
          <Text fontSize="18px" fontFamily={ff} color="#888" margin="0 0 16px 0" style={{ textAlign: 'center', width: '100%' }}>Establish the core context mechanism and wire it to each entrypoint type.</Text>
        </Appear>
        {/* Three entrypoints */}
        <Appear>
          <Grid gridTemplateColumns="1fr 1fr 1fr" gridColumnGap={20} width="100%">
          <div style={{ ...card(accent), textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 30, marginBottom: 10, lineHeight: 1 }}>&#x1F310;</div>
            <div style={{ ...h3(accent), marginBottom: 8 }}>HTTP Interceptor</div>
            <p style={{ ...st, textAlign: 'center' }}><code style={{ color: purple, fontFamily: fm }}>AsyncHandlerInterceptor</code> · reads <code style={{ color: accent3, fontFamily: fm }}>X-Tenant-Id</code>, validates, sets context.</p>
          </div>
          <div style={{ ...card(accent3), textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="0 0 40 40" width="32" height="32" style={{ marginBottom: 10 }}>
              <rect x="2" y="8" width="14" height="24" rx="3" fill="none" stroke="#FF9900" strokeWidth="2"/>
              <rect x="24" y="8" width="14" height="24" rx="3" fill="none" stroke="#FF9900" strokeWidth="2"/>
              <line x1="16" y1="16" x2="24" y2="16" stroke="#FF9900" strokeWidth="2"/>
              <line x1="16" y1="24" x2="24" y2="24" stroke="#FF9900" strokeWidth="2"/>
              <circle cx="9" cy="16" r="2" fill="#FF9900"/>
              <circle cx="9" cy="24" r="2" fill="#FF9900"/>
              <circle cx="31" cy="16" r="2" fill="#FF9900"/>
              <circle cx="31" cy="24" r="2" fill="#FF9900"/>
            </svg>
            <div style={{ ...h3(accent3), marginBottom: 8 }}>SQS Consumer</div>
            <p style={{ ...st, textAlign: 'center' }}><code style={{ color: accent, fontFamily: fm }}>MultitenancyEventHandler</code> extracts <code style={{ color: accent3, fontFamily: fm }}>tenant_id</code> from Protobuf messages and sets context.</p>
          </div>
          <div style={{ ...card(accent3), textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="0 0 40 40" width="32" height="32" style={{ marginBottom: 10 }}>
              <polygon points="20,4 36,12 36,28 20,36 4,28 4,12" fill="none" stroke="#fff" strokeWidth="1.8"/>
              <line x1="20" y1="4" x2="20" y2="36" stroke="#fff" strokeWidth="1.2"/>
              <line x1="4" y1="12" x2="36" y2="28" stroke="#fff" strokeWidth="1.2"/>
              <line x1="36" y1="12" x2="4" y2="28" stroke="#fff" strokeWidth="1.2"/>
            </svg>
            <div style={{ ...h3(accent3), marginBottom: 8 }}>Kafka Consumer</div>
            <p style={{ ...st, textAlign: 'center' }}><code style={{ color: accent, fontFamily: fm }}>MultitenantMessageEventConsumer</code> extracts <code style={{ color: accent3, fontFamily: fm }}>tenantId</code> from Avro messages and sets context.</p>
          </div>
          </Grid>
        </Appear>
      </div>
    </SlideContent>
  );
}

/* ── Slide 7: V1 Flow (TenantContextHolder centered vertically) ── */
function EvolutionV1FlowSlide() {
  return (
    <SlideContent title="Evolution — v1: Request Flow" subtitle={<>Three entrypoint types, each with its own interception, all feeding into TenantContextHolder.</>}>
      <svg viewBox="0 0 860 310" style={{ width: '100%', height: 'auto', display: 'block', fontFamily: ff }}>
        <defs>
          <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={accent}/>
          </marker>
          <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={accent3}/>
          </marker>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={accent2}/>
          </marker>
        </defs>
        {/* HTTP — row at y=15 */}
        <rect x="20" y="15" width="190" height="52" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
        <text x="115" y="37" textAnchor="middle" fill={accent} fontSize="14" fontWeight="bold" fontFamily={ff}>HTTP Request</text>
        <text x="115" y="55" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>X-Tenant-Id header</text>
        <line x1="210" y1="41" x2="248" y2="41" stroke={accent} strokeWidth="2" markerEnd="url(#arrowBlue)"/>
        <rect x="250" y="15" width="190" height="52" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
        <text x="345" y="37" textAnchor="middle" fill={purple} fontSize="13" fontWeight="bold" fontFamily={ff}>HTTP Interceptor</text>
        <text x="345" y="55" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>validate + set context</text>
        {/* Arrow from HTTP Interceptor to TenantContextHolder */}
        <line x1="440" y1="41" x2="568" y2="128" stroke={accent} strokeWidth="2" markerEnd="url(#arrowBlue)"/>

        {/* SQS — row at y=110 (vertically centered) */}
        <rect x="20" y="110" width="190" height="52" rx="8" fill="#3a2a1b" stroke={accent3} strokeWidth="2"/>
        <text x="115" y="132" textAnchor="middle" fill={accent3} fontSize="14" fontWeight="bold" fontFamily={ff}>SQS Message</text>
        <text x="115" y="150" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>tenant_id (Protobuf)</text>
        <line x1="210" y1="136" x2="248" y2="136" stroke={accent3} strokeWidth="2" markerEnd="url(#arrowOrange)"/>
        <rect x="250" y="110" width="220" height="52" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
        <text x="360" y="130" textAnchor="middle" fill={purple} fontSize="12" fontWeight="bold" fontFamily={ff}>MultitenancyEventHandler</text>
        <text x="360" y="150" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>preHandle + set context</text>
        {/* Arrow from SQS handler to TenantContextHolder */}
        <line x1="470" y1="136" x2="568" y2="138" stroke={accent3} strokeWidth="2" markerEnd="url(#arrowOrange)"/>

        {/* Kafka — row at y=205 */}
        <rect x="20" y="205" width="190" height="52" rx="8" fill="#3a2a1b" stroke={accent3} strokeWidth="2"/>
        <text x="115" y="227" textAnchor="middle" fill={accent3} fontSize="14" fontWeight="bold" fontFamily={ff}>Kafka Message</text>
        <text x="115" y="245" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>tenantId (Avro)</text>
        <line x1="210" y1="231" x2="248" y2="231" stroke={accent3} strokeWidth="2" markerEnd="url(#arrowOrange)"/>
        <rect x="250" y="205" width="240" height="52" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
        <text x="370" y="225" textAnchor="middle" fill={purple} fontSize="11" fontWeight="bold" fontFamily={ff}>MultitenantMessageEventConsumer</text>
        <text x="370" y="245" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>preHandle + set context</text>
        {/* Arrow from Kafka handler to TenantContextHolder */}
        <line x1="490" y1="231" x2="568" y2="155" stroke={accent3} strokeWidth="2" markerEnd="url(#arrowOrange)"/>

        {/* TenantContextHolder — centered vertically: midpoint of HTTP(41) and Kafka(231) = 136 → box center at 136, so y = 136-37 = 99 */}
        <rect x="570" y="100" width="260" height="75" rx="12" fill="#1e3a5f" stroke={accent} strokeWidth="3"/>
        <text x="700" y="130" textAnchor="middle" fill={accent} fontSize="16" fontWeight="bold" fontFamily={ff}>TenantContextHolder</text>
        <text x="700" y="153" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>ThreadLocal&lt;ContextMessage&gt;</text>
        <text x="700" y="168" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>tenantId + userId</text>

        {/* Business Logic */}
        <line x1="700" y1="175" x2="700" y2="238" stroke={accent2} strokeWidth="2" markerEnd="url(#arrowGreen)"/>
        <rect x="585" y="240" width="230" height="50" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="700" y="262" textAnchor="middle" fill={accent2} fontSize="15" fontWeight="bold" fontFamily={ff}>Business Logic</text>
        <text x="700" y="280" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>DB routing, queues, storage</text>
      </svg>
    </SlideContent>
  );
}


/* ── Slide 8: V2 Bug ── */
function EvolutionV2BugSlide() {
  return (
    <SlideContent title="Evolution — v2: The Bug">
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div>
            <div style={{ ...card(red), marginBottom: 18 }}>
              <div style={h3(red)}>The Problem</div>
              <p style={st}>We used a <strong>thread pool</strong> — threads are reused across requests. <code style={{ color: accent3, fontFamily: fm }}>ThreadLocal</code> is mutable and was <strong>never cleared</strong> between calls.</p>
              <p style={{ ...st, marginTop: 10 }}>Result: a thread that processed <em>Tenant A</em>'s request carried that context into the next — silently writing to the <strong style={{ color: red }}>wrong database</strong>.</p>
            </div>
            <div style={card(accent3)}>
              <div style={h3(accent3)}>Why It Was Silent</div>
              <p style={st}>No exception. No warning. The wrong tenant's data was written successfully — just to the wrong place. Only discovered through data inconsistencies.</p>
            </div>
          </div>
        </Appear>
        <Appear>
          <FlexBox alignItems="center" justifyContent="center">
            <svg viewBox="0 0 380 290" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
            <rect x="10" y="5" width="360" height="42" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
            <text x="190" y="32" textAnchor="middle" fill={accent} fontSize="14" fontWeight="bold" fontFamily={ff}>Thread Pool — Thread #3</text>
            <rect x="10" y="60" width="360" height="58" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
            <text x="190" y="85" textAnchor="middle" fill={accent2} fontSize="13" fontWeight="bold" fontFamily={ff}>Request 1: Tenant A</text>
            <text x="190" y="105" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>ThreadLocal set → tenantId = "tenant-a"</text>
            <line x1="190" y1="118" x2="190" y2="142" stroke={red} strokeWidth="2" strokeDasharray="5,3"/>
            <text x="225" y="136" fill={red} fontSize="12" fontFamily={ff} className="pulse-slow">no clear!</text>
            <rect x="10" y="142" width="360" height="58" rx="8" fill="#3a1a1a" stroke={red} strokeWidth="2.5"/>
            <text x="190" y="167" textAnchor="middle" fill={red} fontSize="13" fontWeight="bold" fontFamily={ff}>Request 2: Tenant B</text>
            <text x="190" y="187" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>ThreadLocal still = "tenant-a" ← WRONG</text>
            <line x1="190" y1="200" x2="190" y2="224" stroke={red} strokeWidth="2"/>
            <polygon points="190,224 185,216 195,216" fill={red}/>
            <rect x="60" y="224" width="260" height="48" rx="8" fill="#3a1a1a" stroke={red} strokeWidth="2.5"/>
            <text x="190" y="246" textAnchor="middle" fill={red} fontSize="14" fontWeight="bold" fontFamily={ff}>Writes to Tenant A's DB</text>
            <text x="190" y="264" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff} className="pulse-slow">Silent data corruption</text>
          </svg>
          </FlexBox>
        </Appear>
      </Grid>
    </SlideContent>
  );
}

/* ── Slide 9: V3 Lifecycle (horizontal split) ── */
function EvolutionV3LifecycleSlide() {
  return (
    <SlideContent title="Evolution — v3: Context Lifecycle" subtitle={<>The fix: enforce a strict <strong>set → use → clear</strong> lifecycle.</>}>
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div style={card(accent2)}>
            <div style={h3(accent2)}>Guard on Set</div>
            <p style={st}>Before setting the context, check if it's already populated. If so, throw — prevents accidental overwrites mid-request.</p>
            <AppearCode>
              <Code>
{`if (TenantContextHolder.getCurrentContext() != null) {
  throw new IllegalStateException(
    "Context already set"
  );
}
TenantContextHolder.setCurrentContext(ctx);`}
              </Code>
            </AppearCode>
          </div>
        </Appear>
        <Appear>
          <div style={card(accent)}>
            <div style={h3(accent)}>Guaranteed Cleanup</div>
            <p style={st}><code style={{ color: purple, fontFamily: fm }}>MultitenancyInterceptor</code> implements <code style={{ color: accent3, fontFamily: fm }}>AsyncHandlerInterceptor</code> — a triple-clear pattern:</p>
            <ul style={{ ...ul, fontSize: 20, marginTop: 8 }}>
              <li><code style={{ color: accent3, fontFamily: fm }}>postHandle()</code> — clears after handler executes</li>
              <li><code style={{ color: accent3, fontFamily: fm }}>afterCompletion()</code> — safety net after full request</li>
              <li><code style={{ color: accent3, fontFamily: fm }}>afterConcurrentHandlingStarted()</code> — clears on the original thread when async begins</li>
            </ul>
            <p style={{ ...st, marginTop: 10 }}>Kafka/SQS: <code style={{ color: accent3, fontFamily: fm }}>onComplete()</code> hook clears after every message.</p>
            <p style={{ ...st, marginTop: 8 }}>Context lifecycle is owned by the <strong style={{ color: accent3 }}>framework</strong>, not the developer.</p>
          </div>
        </Appear>
      </Grid>
    </SlideContent>
  );
}

/* ── Slide 10: V3 Diagram ── */
function EvolutionV3DiagramSlide() {
  return (
    <SlideContent title="Evolution — v3: Safe Thread Reuse">
      <FlexBox justifyContent="center" width="100%">
        <svg viewBox="0 0 440 300" style={{ width: '65%', height: 'auto', fontFamily: ff }}>
          <rect x="10" y="5" width="420" height="42" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
          <text x="220" y="32" textAnchor="middle" fill={accent} fontSize="14" fontWeight="bold" fontFamily={ff}>Thread Pool — Thread #3</text>
          <rect x="10" y="60" width="420" height="68" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
          <text x="220" y="86" textAnchor="middle" fill={accent2} fontSize="13" fontWeight="bold" fontFamily={ff}>Request 1: Tenant A</text>
          <text x="220" y="106" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>set → tenantId = "tenant-a"</text>
          <text x="220" y="122" textAnchor="middle" fill={accent2} fontSize="12" fontFamily={ff}>clearContext() ← afterCompletion</text>
          {/* Separator — thread is clean, no causal arrow */}
          <line x1="80" y1="140" x2="360" y2="140" stroke="#555" strokeWidth="1" strokeDasharray="6,4"/>
          <text x="220" y="155" textAnchor="middle" fill="#888" fontSize="11" fontFamily={ff}>thread context is empty</text>
          <rect x="10" y="165" width="420" height="68" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
          <text x="220" y="191" textAnchor="middle" fill={accent2} fontSize="13" fontWeight="bold" fontFamily={ff}>Request 2: Tenant B</text>
          <text x="220" y="211" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>set → tenantId = "tenant-b" ← correct</text>
          <text x="220" y="227" textAnchor="middle" fill={accent2} fontSize="12" fontFamily={ff}>clearContext() ← afterCompletion</text>
          {/* Result box */}
          <rect x="80" y="252" width="280" height="42" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
          <text x="220" y="278" textAnchor="middle" fill={accent2} fontSize="14" fontWeight="bold" fontFamily={ff}>Writes to correct DB every time</text>
        </svg>
      </FlexBox>
    </SlideContent>
  );
}


/* ── Slide 11: V4 Async (improved submit arrows) ── */
function EvolutionV4AsyncSlide() {
  return (
    <SlideContent title="Evolution — v4: Async Context Propagation" subtitle={<><code style={{ color: accent3, fontFamily: fm }}>ThreadLocal</code> doesn't cross thread boundaries. Async tasks on different threads lose context.</>}>
      <FlexBox justifyContent="center" width="100%">
        <svg viewBox="0 0 520 300" style={{ width: '72%', height: 'auto', fontFamily: ff }}>
          <defs>
            <marker id="arrRed11" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill={red}/>
            </marker>
            <marker id="arrGreen11" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill={accent2}/>
            </marker>
          </defs>
          {/* Main thread */}
          <rect x="110" y="5" width="300" height="46" rx="10" fill="#1e3a5f" stroke={accent} strokeWidth="2.5"/>
          <text x="260" y="34" textAnchor="middle" fill={accent} fontSize="15" fontWeight="bold" fontFamily={ff}>Main Thread — tenantId = "tenant-abc"</text>

          {/* executor.submit label */}
          <text x="260" y="72" textAnchor="middle" fill="#888" fontSize="12" fontFamily={ff}>executor.submit(...)</text>

          {/* Left fork: plain — curved path with marker */}
          <path d="M 180,51 C 180,85 120,85 120,103" stroke={red} strokeWidth="2" fill="none" markerEnd="url(#arrRed11)"/>

          {/* Right fork: context-aware — curved path with marker */}
          <path d="M 340,51 C 340,85 400,85 400,103" stroke={accent2} strokeWidth="2" fill="none" markerEnd="url(#arrGreen11)"/>

          {/* Plain worker */}
          <rect x="10" y="105" width="220" height="60" rx="8" fill="#3a1a1a" stroke={red} strokeWidth="2"/>
          <text x="120" y="130" textAnchor="middle" fill={red} fontSize="14" fontWeight="bold" fontFamily={ff}>Worker (plain)</text>
          <text x="120" y="152" textAnchor="middle" fill="#aaa" fontSize="13" fontFamily={ff}>tenantId = null</text>

          {/* Context worker */}
          <rect x="290" y="105" width="220" height="60" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
          <text x="400" y="130" textAnchor="middle" fill={accent2} fontSize="13" fontWeight="bold" fontFamily={ff}>Worker (ContextRunnable)</text>
          <text x="400" y="152" textAnchor="middle" fill="#aaa" fontSize="13" fontFamily={ff}>tenantId = "tenant-abc"</text>

          {/* Code labels */}
          <text x="120" y="190" textAnchor="middle" fill={red} fontSize="13" fontFamily={fm}>{"() -> doWork()"}</text>
          <text x="400" y="190" textAnchor="middle" fill={accent2} fontSize="11" fontFamily={fm}>{"ContextRunnable.of(() -> doWork())"}</text>

          {/* Wrappers box */}
          <rect x="50" y="215" width="420" height="55" rx="10" fill={bgCard} stroke={grey} strokeWidth="2"/>
          <text x="260" y="240" textAnchor="middle" fill={grey} fontSize="15" fontWeight="bold" fontFamily={ff}>Context Wrappers</text>
          <text x="260" y="260" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>ContextRunnable · ContextCallable · ContextSupplier · ContextFunction</text>
        </svg>
      </FlexBox>
    </SlideContent>
  );
}

/* ── Slide 12: V4 Wrapper API ── */
function EvolutionV4WrapperSlide() {
  return (
    <SlideContent title="Evolution — v4: Wrapper API">
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div style={card(accent)}>
            <div style={h3(accent)}>of() — Capture Once</div>
            <p style={st}>Captures the current context at the point of creation. Safe for one-shot fire-and-forget tasks.</p>
            <AppearCode>
              <Code>
{`// fire-and-forget: send notification
executor.submit(
  ContextRunnable.of(
    () -> notificationService.send(order)
  )
);`}
              </Code>
            </AppearCode>
          </div>
        </Appear>
        <Appear>
          <div style={card(accent2)}>
            <div style={h3(accent2)}>ofReusable() — Capture &amp; Restore</div>
            <p style={st}>Captures context and restores it on each invocation. Safe for chained or reusable async pipelines.</p>
            <AppearCode>
              <Code>
{`// async pipeline: context flows through
CompletableFuture
  .supplyAsync(ContextSupplier.ofReusable(
    () -> orderRepo.findById(id)))
  .thenApply(ContextFunction.ofReusable(
    order -> enrichService.enrich(order)));`}
              </Code>
            </AppearCode>
          </div>
        </Appear>
      </Grid>
    </SlideContent>
  );
}


/* ── Slide 13: Module Architecture ── */
function ModuleArchSlide() {
  return (
    <SlideContent title="Module Architecture">
      <svg viewBox="0 0 820 390" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
        <rect x="260" y="145" width="300" height="80" rx="12" fill="#1e3a5f" stroke={accent} strokeWidth="3"/>
        <text x="410" y="180" textAnchor="middle" fill={accent} fontSize="18" fontWeight="bold" fontFamily={ff}>multitenancy-core</text>
        <text x="410" y="205" textAnchor="middle" fill="#aaa" fontSize="13" fontFamily={ff}>TenantContextHolder · Interceptor · Config</text>
        <rect x="20" y="15" width="170" height="52" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="105" y="42" textAnchor="middle" fill={accent2} fontSize="15" fontWeight="bold" fontFamily={ff}>mysql</text>
        <text x="105" y="58" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>HikariCP · Flyway · JPA</text>
        <line x1="190" y1="41" x2="260" y2="170" stroke={accent2} strokeWidth="1.5" strokeDasharray="5,3"/>
        <rect x="20" y="100" width="170" height="52" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="105" y="127" textAnchor="middle" fill={accent2} fontSize="15" fontWeight="bold" fontFamily={ff}>mongodb</text>
        <text x="105" y="143" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>MongoDatabaseFactory</text>
        <line x1="190" y1="126" x2="260" y2="180" stroke={accent2} strokeWidth="1.5" strokeDasharray="5,3"/>
        <rect x="20" y="195" width="170" height="52" rx="8" fill="#3a2a1b" stroke={accent3} strokeWidth="2"/>
        <text x="105" y="222" textAnchor="middle" fill={accent3} fontSize="15" fontWeight="bold" fontFamily={ff}>kafka</text>
        <text x="105" y="238" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>Avro · Consumer base</text>
        <line x1="190" y1="221" x2="260" y2="200" stroke={accent3} strokeWidth="1.5" strokeDasharray="5,3"/>
        <rect x="20" y="280" width="170" height="52" rx="8" fill="#3a2a1b" stroke={accent3} strokeWidth="2"/>
        <text x="105" y="307" textAnchor="middle" fill={accent3} fontSize="15" fontWeight="bold" fontFamily={ff}>sqs</text>
        <text x="105" y="323" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>Protobuf · EventHandler</text>
        <line x1="190" y1="306" x2="260" y2="210" stroke={accent3} strokeWidth="1.5" strokeDasharray="5,3"/>
        <rect x="640" y="90" width="170" height="52" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
        <text x="725" y="117" textAnchor="middle" fill={purple} fontSize="15" fontWeight="bold" fontFamily={ff}>s3</text>
        <text x="725" y="133" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>AmazonS3Factory · Regions</text>
        <line x1="640" y1="116" x2="560" y2="170" stroke={purple} strokeWidth="1.5" strokeDasharray="5,3"/>
        <rect x="640" y="175" width="170" height="52" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
        <text x="725" y="202" textAnchor="middle" fill={purple} fontSize="15" fontWeight="bold" fontFamily={ff}>websocket</text>
        <text x="725" y="218" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>AOP · ControllerAspect</text>
        <line x1="640" y1="201" x2="560" y2="190" stroke={purple} strokeWidth="1.5" strokeDasharray="5,3"/>
        <rect x="640" y="260" width="170" height="52" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
        <text x="725" y="283" textAnchor="middle" fill={purple} fontSize="14" fontWeight="bold" fontFamily={ff}>outbox-pattern</text>
        <text x="725" y="301" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>Scheduler · Transaction</text>
        <line x1="640" y1="286" x2="560" y2="210" stroke={purple} strokeWidth="1.5" strokeDasharray="5,3"/>
      </svg>
    </SlideContent>
  );
}

/* ── Slide 14: HTTP Flow (cleanup below controller) ── */
function HttpFlowSlide() {
  return (
    <SlideContent title="HTTP Request Flow">
      <svg viewBox="0 0 820 370" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
        <defs>
          <marker id="arrBlue14" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={accent}/>
          </marker>
          <marker id="arrPurple14" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={purple}/>
          </marker>
          <marker id="arrGreen14" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={accent2}/>
          </marker>
          <marker id="arrRed14" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={red}/>
          </marker>
        </defs>
        {/* Row 1: Request -> Interceptor -> Validate -> Set Context */}
        <rect x="20" y="20" width="155" height="60" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
        <text x="97" y="44" textAnchor="middle" fill={accent} fontSize="13" fontWeight="bold" fontFamily={ff}>1. Request</text>
        <text x="97" y="60" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>HTTP arrives</text>
        <text x="97" y="74" textAnchor="middle" fill={accent3} fontSize="11" fontFamily={ff}>X-Tenant-Id: abc</text>
        <line x1="175" y1="50" x2="208" y2="50" stroke={accent} strokeWidth="1.5" markerEnd="url(#arrBlue14)"/>
        <rect x="210" y="20" width="155" height="60" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
        <text x="287" y="40" textAnchor="middle" fill={purple} fontSize="13" fontWeight="bold" fontFamily={ff}>2. Interceptor</text>
        <text x="287" y="56" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>Bypass check</text>
        <text x="287" y="72" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>Extract header</text>
        <line x1="365" y1="50" x2="398" y2="50" stroke={purple} strokeWidth="1.5" markerEnd="url(#arrPurple14)"/>
        <rect x="400" y="20" width="155" height="60" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
        <text x="477" y="44" textAnchor="middle" fill={accent} fontSize="13" fontWeight="bold" fontFamily={ff}>3. Validate</text>
        <text x="477" y="60" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>TenantValidator</text>
        <text x="477" y="74" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>Check config list</text>
        <line x1="555" y1="50" x2="588" y2="50" stroke={accent} strokeWidth="1.5" markerEnd="url(#arrBlue14)"/>
        <rect x="590" y="20" width="200" height="60" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="690" y="44" textAnchor="middle" fill={accent2} fontSize="13" fontWeight="bold" fontFamily={ff}>4. Set Context</text>
        <text x="690" y="60" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>ThreadLocal set</text>
        <text x="690" y="74" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>ContextMessage</text>
        {/* Arrow down to Controller */}
        <line x1="690" y1="80" x2="640" y2="118" stroke={accent2} strokeWidth="1.5" markerEnd="url(#arrGreen14)"/>
        {/* Controller / Service */}
        <rect x="400" y="120" width="400" height="55" rx="8" fill={bgCard} stroke={grey} strokeWidth="2"/>
        <text x="600" y="145" textAnchor="middle" fill={grey} fontSize="15" fontWeight="bold" fontFamily={ff}>Controller / Service</text>
        <text x="600" y="165" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>TenantContextHolder.getCurrentContext()</text>
        {/* Arrow down to Cleanup */}
        <line x1="600" y1="175" x2="600" y2="208" stroke={red} strokeWidth="1.5" markerEnd="url(#arrRed14)"/>
        {/* Cleanup below controller */}
        <rect x="420" y="210" width="360" height="60" rx="8" fill={bgCard} stroke={red} strokeWidth="2"/>
        <text x="600" y="230" textAnchor="middle" fill={red} fontSize="14" fontWeight="bold" fontFamily={ff}>5. Cleanup (triple-clear)</text>
        <text x="600" y="248" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>postHandle · afterCompletion</text>
        <text x="600" y="263" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>afterConcurrentHandlingStarted</text>
        {/* Bypass list */}
        <line x1="287" y1="80" x2="287" y2="300" stroke={accent3} strokeWidth="1.5" strokeDasharray="4,3"/>
        <rect x="150" y="300" width="280" height="48" rx="8" fill="#3a2a1b" stroke={accent3} strokeWidth="1.5"/>
        <text x="290" y="322" textAnchor="middle" fill={accent3} fontSize="13" fontFamily={ff}>Bypass list (Swagger, OPTIONS,</text>
        <text x="290" y="340" textAnchor="middle" fill={accent3} fontSize="13" fontFamily={ff}>/kafka/, /jms/)</text>
        <text x="120" y="295" fill={accent3} fontSize="12" fontFamily={ff}>if allowed URI</text>
      </svg>
    </SlideContent>
  );
}


/* ── Slide 15: MySQL Module ── */
function MysqlSlide() {
  return (
    <SlideContent title="MySQL Module — Per-Tenant Datasources">
      <svg viewBox="0 0 820 300" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
        <rect x="310" y="5" width="200" height="48" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
        <text x="410" y="35" textAnchor="middle" fill={accent} fontSize="16" fontWeight="bold" fontFamily={ff}>JPA Repository call</text>
        <line x1="410" y1="53" x2="410" y2="82" stroke={accent} strokeWidth="2"/>
        <polygon points="410,82 405,74 415,74" fill={accent}/>
        <rect x="150" y="82" width="520" height="58" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
        <text x="410" y="104" textAnchor="middle" fill={purple} fontSize="15" fontWeight="bold" fontFamily={ff}>Hibernate Multitenancy SPI</text>
        <text x="280" y="128" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>CurrentTenantIdentifierResolver</text>
        <text x="540" y="128" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>DataSourceBasedConnectionProvider</text>
        <line x1="410" y1="140" x2="410" y2="165" stroke={purple} strokeWidth="2"/>
        <polygon points="410,165 405,157 415,157" fill={purple}/>
        <rect x="250" y="165" width="320" height="42" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
        <text x="410" y="191" textAnchor="middle" fill={accent} fontSize="13" fontFamily={ff}>TenantContextHolder.getCurrentTenantIdentifier()</text>
        <line x1="410" y1="207" x2="410" y2="232" stroke={accent2} strokeWidth="2"/>
        <polygon points="410,232 405,224 415,224" fill={accent2}/>
        <rect x="100" y="232" width="620" height="52" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="410" y="254" textAnchor="middle" fill={accent2} fontSize="15" fontWeight="bold" fontFamily={ff}>{"Map<String, HikariDataSource>"}</text>
        <text x="200" y="274" textAnchor="middle" fill="#aaa" fontSize="13" fontFamily={ff}>tenant-a → DS_A</text>
        <text x="410" y="274" textAnchor="middle" fill="#aaa" fontSize="13" fontFamily={ff}>tenant-b → DS_B</text>
        <text x="620" y="274" textAnchor="middle" fill="#aaa" fontSize="13" fontFamily={ff}>tenant-c → DS_C</text>
      </svg>
      <Text fontSize="20px" fontFamily={ff} color="#bbb" margin="12px 0 0 0">Each tenant gets its own HikariCP connection pool. Flyway runs migrations per tenant at startup.</Text>
    </SlideContent>
  );
}

/* ── Slide 16: Kafka & SQS ── */
function KafkaSqsSlide() {
  return (
    <SlideContent title={<>Kafka &amp; SQS — Message-Driven Tenancy</>}>
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <svg viewBox="0 0 380 250" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
          <text x="190" y="20" textAnchor="middle" fill={accent3} fontSize="16" fontWeight="bold" fontFamily={ff}>Kafka</text>
          <rect x="20" y="32" width="340" height="48" rx="8" fill="#3a2a1b" stroke={accent3} strokeWidth="2"/>
          <text x="190" y="54" textAnchor="middle" fill={accent3} fontSize="13" fontFamily={ff}>Avro Message arrives</text>
          <text x="190" y="72" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>key.tenantId or value.tenantId</text>
          <line x1="190" y1="80" x2="190" y2="108" stroke={accent3} strokeWidth="2"/>
          <polygon points="190,108 185,100 195,100" fill={accent3}/>
          <rect x="15" y="108" width="350" height="48" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
          <text x="190" y="128" textAnchor="middle" fill={purple} fontSize="12" fontWeight="bold" fontFamily={ff}>MultitenantMessageEventConsumer</text>
          <text x="190" y="148" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>preHandle() → setCurrentContext()</text>
          <line x1="190" y1="156" x2="190" y2="184" stroke={accent2} strokeWidth="2"/>
          <polygon points="190,184 185,176 195,176" fill={accent2}/>
          <rect x="60" y="184" width="260" height="45" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
          <text x="190" y="206" textAnchor="middle" fill={accent2} fontSize="14" fontFamily={ff}>Business Logic</text>
          <text x="190" y="222" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>tenant context available</text>
        </svg>
        <svg viewBox="0 0 380 250" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
          <text x="190" y="20" textAnchor="middle" fill={accent3} fontSize="16" fontWeight="bold" fontFamily={ff}>SQS</text>
          <rect x="20" y="32" width="340" height="48" rx="8" fill="#3a2a1b" stroke={accent3} strokeWidth="2"/>
          <text x="190" y="54" textAnchor="middle" fill={accent3} fontSize="13" fontFamily={ff}>Protobuf Message arrives</text>
          <text x="190" y="72" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>message.tenant_id field</text>
          <line x1="190" y1="80" x2="190" y2="108" stroke={accent3} strokeWidth="2"/>
          <polygon points="190,108 185,100 195,100" fill={accent3}/>
          <rect x="15" y="108" width="350" height="48" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
          <text x="190" y="130" textAnchor="middle" fill={purple} fontSize="13" fontWeight="bold" fontFamily={ff}>MultitenancyEventHandler</text>
          <text x="190" y="148" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>preHandle() → setCurrentContext()</text>
          <line x1="190" y1="156" x2="190" y2="184" stroke={accent2} strokeWidth="2"/>
          <polygon points="190,184 185,176 195,176" fill={accent2}/>
          <rect x="60" y="184" width="260" height="45" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
          <text x="190" y="206" textAnchor="middle" fill={accent2} fontSize="14" fontFamily={ff}>Business Logic</text>
          <text x="190" y="222" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>tenant context available</text>
        </svg>
      </Grid>
      <Text fontSize="20px" fontFamily={ff} color="#bbb" margin="12px 0 0 0">Both follow the same lifecycle: <span style={{ color: accent3, fontWeight: 'bold' }}>preHandle</span> → process → <span style={{ color: accent3, fontWeight: 'bold' }}>onComplete</span> clears context.</Text>
    </SlideContent>
  );
}

/* ── Slide 17: S3 & WebSocket ── */
function S3WebSocketSlide() {
  return (
    <SlideContent title={<>S3 &amp; WebSocket Modules</>}>
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <div style={card(accent)}>
          <div style={h3(accent)}>S3 — Per-Region Client Routing</div>
          <svg viewBox="0 0 340 150" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
            <rect x="10" y="5" width="320" height="38" rx="6" fill="#1e3a5f" stroke={accent} strokeWidth="1.5"/>
            <text x="170" y="30" textAnchor="middle" fill={accent} fontSize="13" fontFamily={ff}>AmazonS3Factory.getAmazonS3()</text>
            <line x1="100" y1="43" x2="60" y2="75" stroke={accent} strokeWidth="1.5"/>
            <line x1="170" y1="43" x2="170" y2="75" stroke={accent} strokeWidth="1.5"/>
            <line x1="240" y1="43" x2="280" y2="75" stroke={accent} strokeWidth="1.5"/>
            <rect x="10" y="75" width="95" height="36" rx="6" fill="#1b3a2a" stroke={accent2} strokeWidth="1.5"/>
            <text x="57" y="98" textAnchor="middle" fill={accent2} fontSize="12" fontFamily={ff}>eu-west-1</text>
            <rect x="122" y="75" width="95" height="36" rx="6" fill="#1b3a2a" stroke={accent2} strokeWidth="1.5"/>
            <text x="170" y="98" textAnchor="middle" fill={accent2} fontSize="12" fontFamily={ff}>us-east-1</text>
            <rect x="235" y="75" width="95" height="36" rx="6" fill="#1b3a2a" stroke={accent2} strokeWidth="1.5"/>
            <text x="282" y="98" textAnchor="middle" fill={accent2} fontSize="12" fontFamily={ff}>ap-south-1</text>
            <text x="170" y="135" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>One AmazonS3 client per AWS region</text>
          </svg>
        </div>
        <div style={card(purple)}>
          <div style={h3(purple)}>WebSocket — AOP Injection</div>
          <svg viewBox="0 0 340 150" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
            <rect x="10" y="5" width="320" height="36" rx="6" fill="#2a1a3e" stroke={purple} strokeWidth="1.5"/>
            <text x="170" y="28" textAnchor="middle" fill={purple} fontSize="13" fontFamily={ff}>WS Message (MultiTenantMessage)</text>
            <line x1="170" y1="41" x2="170" y2="65" stroke={purple} strokeWidth="1.5"/>
            <polygon points="170,65 165,57 175,57" fill={purple}/>
            <rect x="50" y="65" width="240" height="38" rx="6" fill="#1e3a5f" stroke={accent} strokeWidth="1.5"/>
            <text x="170" y="84" textAnchor="middle" fill={accent} fontSize="13" fontFamily={ff}>ControllerAspect @Around</text>
            <text x="170" y="98" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily={ff}>reads getTenantId() from arg[0]</text>
            <line x1="170" y1="103" x2="170" y2="125" stroke={accent2} strokeWidth="1.5"/>
            <polygon points="170,125 165,117 175,117" fill={accent2}/>
            <text x="170" y="142" textAnchor="middle" fill={accent2} fontSize="12" fontFamily={ff}>@WebSocketController executes</text>
          </svg>
        </div>
      </Grid>
    </SlideContent>
  );
}


/* ── Slide 18: MultitenantHelper ── */
function MultitenantHelperSlide() {
  return (
    <SlideContent title={<>MultitenantHelper — Batch &amp; Scheduled Jobs</>}>
      <svg viewBox="0 0 820 270" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
        <rect x="300" y="5" width="220" height="48" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
        <text x="410" y="35" textAnchor="middle" fill={accent} fontSize="16" fontWeight="bold" fontFamily={ff}>@Scheduled Job</text>
        <line x1="410" y1="53" x2="410" y2="80" stroke={accent} strokeWidth="2"/>
        <polygon points="410,80 405,72 415,72" fill={accent}/>
        <rect x="260" y="80" width="300" height="52" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
        <text x="410" y="105" textAnchor="middle" fill={purple} fontSize="16" fontWeight="bold" fontFamily={ff}>MultitenantHelper</text>
        <text x="410" y="124" textAnchor="middle" fill="#aaa" fontSize="13" fontFamily={ff}>runForAllTenants(Runnable)</text>
        <line x1="310" y1="132" x2="145" y2="175" stroke={accent2} strokeWidth="1.5"/>
        <line x1="370" y1="132" x2="325" y2="175" stroke={accent2} strokeWidth="1.5"/>
        <line x1="450" y1="132" x2="505" y2="175" stroke={accent2} strokeWidth="1.5"/>
        <line x1="510" y1="132" x2="685" y2="175" stroke={accent2} strokeWidth="1.5"/>
        <rect x="65" y="175" width="160" height="48" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="145" y="199" textAnchor="middle" fill={accent2} fontSize="14" fontFamily={ff}>tenant-a</text>
        <text x="145" y="216" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>set → run → clear</text>
        <rect x="245" y="175" width="160" height="48" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="325" y="199" textAnchor="middle" fill={accent2} fontSize="14" fontFamily={ff}>tenant-b</text>
        <text x="325" y="216" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>set → run → clear</text>
        <rect x="425" y="175" width="160" height="48" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="505" y="199" textAnchor="middle" fill={accent2} fontSize="14" fontFamily={ff}>tenant-c</text>
        <text x="505" y="216" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>set → run → clear</text>
        <rect x="605" y="175" width="160" height="48" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
        <text x="685" y="199" textAnchor="middle" fill={accent2} fontSize="14" fontFamily={ff}>tenant-n</text>
        <text x="685" y="216" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>set → run → clear</text>
        <text x="410" y="258" textAnchor="middle" fill={accent3} fontSize="14" fontFamily={ff}>Also: runForTenant(id, task) · supplyForAllTenants(supplier)</text>
      </svg>
    </SlideContent>
  );
}

/* ── Slide 19: Configuration ── */
function ConfigSlide() {
  return (
    <SlideContent title="Configuration" subtitle={<>One annotation wires everything. Tenants declared in <code style={{ color: accent3, fontFamily: fm }}>application.yml</code>.</>}>
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div style={card(accent)}>
            <div style={h3(accent)}>Enable the library</div>
            <AppearCode>
              <Code>
{`@SpringBootApplication
@EnableMultiTenancy
public class MyApp {
  public static void main(String[] args) {
    SpringApplication.run(MyApp.class, args);
  }
}`}
              </Code>
            </AppearCode>
          </div>
        </Appear>
        <Appear>
          <div style={card(accent2)}>
            <div style={h3(accent2)}>application.yml</div>
            <AppearCode>
              <Code style={{ fontSize: 16 }}>
{`multitenancy:
  tenants:
    - name: "Acme Corp"
      identifier: "acme-uuid"
      url: "jdbc:mysql://host/acme"
      username: "user"
      password: "pass"
      maximumPoolSize: 5
      awsRegion: "eu-west-1"
    - name: "Globex"
      identifier: "globex-uuid"
      url: "jdbc:mysql://host/globex"
      username: "user"
      password: "pass"`}
              </Code>
            </AppearCode>
          </div>
        </Appear>
      </Grid>
    </SlideContent>
  );
}

/* ── Slide 20: Extensibility ── */
function ExtensibilitySlide() {
  return (
    <SlideContent title="Extensibility Points">
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div style={card(accent)}>
            <div style={h3(accent)}>Custom Bypass URIs</div>
            <AppearCode>
              <Code>
{`@Component
public class MyAllowedResources
  implements ConfigurableAllowedResource {

  @Override
  public List<String> allowedUris() {
    return List.of("/health","/metrics");
  }
}`}
              </Code>
            </AppearCode>
            <p style={{ ...st, marginTop: 10 }}>URIs that skip tenant validation</p>
          </div>
        </Appear>
        <Appear>
          <div style={card(accent2)}>
            <div style={h3(accent2)}>Custom Kafka Consumer</div>
            <AppearCode>
              <Code>
{`@Component
public class OrderConsumer extends
  MultitenantKeyEventConsumer
    <String, OrderEvent> {

  @Override
  protected void handle(OrderEvent e) {
    // tenantId already in context
    orderService.process(e);
  }
}`}
              </Code>
            </AppearCode>
          </div>
        </Appear>
      </Grid>
    </SlideContent>
  );
}

/* ── Slide 21: Extensibility SQS + summary ── */
function ExtensibilitySqsSlide() {
  return (
    <SlideContent title="Extensibility Points — Messaging">
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div style={card(purple)}>
            <div style={h3(purple)}>Custom SQS Handler</div>
            <AppearCode>
              <Code>
{`@Component
public class PaymentHandler extends
  MultitenancyEventHandler
    <PaymentProto> {

  @Override
  protected void handle(PaymentProto p) {
    // tenantId already in context
    paymentService.process(p);
  }
}`}
              </Code>
            </AppearCode>
          </div>
        </Appear>
        <Appear>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={card(accent3)}>
            <div style={h3(accent3)}>The Pattern</div>
            <p style={st}>Same across Kafka and SQS — extend the base class, implement <code style={{ color: accent3, fontFamily: fm }}>handle()</code>, context is already set.</p>
            <p style={{ ...st, marginTop: 8 }}>No boilerplate. No manual context management. Just business logic.</p>
          </div>
          <div style={card(grey)}>
            <div style={h3(grey)}>Available Base Classes</div>
            <ul style={{ ...ul, fontSize: 20 }}>
              <li><code style={{ color: accent, fontFamily: fm }}>MultitenantKeyEventConsumer</code></li>
              <li><code style={{ color: accent, fontFamily: fm }}>MultitenantValueEventConsumer</code></li>
              <li><code style={{ color: purple, fontFamily: fm }}>MultitenancyEventHandler</code></li>
            </ul>
          </div>
          </div>
        </Appear>
      </Grid>
    </SlideContent>
  );
}


/* ── Slide 22: Demo ── */
function DemoSlide() {
  return (
    <SlideContent title="Demo" titleColor={accent3}>
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%" alignItems="start">
        <Appear>
          <div>
            <div style={{ ...card(accent3), marginBottom: 18 }}>
              <div style={h3(accent3)}>What we'll show</div>
              <ul style={ul}>
                <li>Bootstrap with <code style={{ color: accent3, fontFamily: fm }}>@EnableMultiTenancy</code></li>
                <li>Configure two tenants in <code style={{ color: accent3, fontFamily: fm }}>application.yml</code></li>
                <li>HTTP request with <code style={{ color: accent3, fontFamily: fm }}>X-Tenant-Id</code> routing to correct DB</li>
                <li>Missing or invalid tenant header handling</li>
              </ul>
            </div>
            <div style={card(accent)}>
              <div style={h3(accent)}>What to watch for</div>
              <ul style={ul}>
                <li>Zero boilerplate in the service layer</li>
                <li>Context set and cleared automatically</li>
                <li>Same code path, different database per tenant</li>
              </ul>
            </div>
          </div>
        </Appear>
        <Appear>
          <FlexBox alignItems="center" justifyContent="center" height="100%">
          <svg viewBox="0 0 380 290" style={{ width: '100%', height: 'auto', fontFamily: ff }}>
            <rect x="10" y="5" width="360" height="48" rx="8" fill="#3a2a1b" stroke={accent3} strokeWidth="2"/>
            <text x="190" y="34" textAnchor="middle" fill={accent3} fontSize="13" fontWeight="bold" fontFamily={ff}>{'curl -H "X-Tenant-Id: 9b09d8ba-..." /v1/order'}</text>
            <line x1="190" y1="53" x2="190" y2="80" stroke={accent3} strokeWidth="2"/>
            <polygon points="190,80 185,72 195,72" fill={accent3}/>
            <rect x="40" y="80" width="300" height="48" rx="8" fill="#2a1a3e" stroke={purple} strokeWidth="2"/>
            <text x="190" y="104" textAnchor="middle" fill={purple} fontSize="14" fontWeight="bold" fontFamily={ff}>MultitenancyInterceptor</text>
            <text x="190" y="120" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>validates → sets context</text>
            <line x1="190" y1="128" x2="190" y2="155" stroke={purple} strokeWidth="2"/>
            <polygon points="190,155 185,147 195,147" fill={purple}/>
            <rect x="40" y="155" width="300" height="48" rx="8" fill="#1e3a5f" stroke={accent} strokeWidth="2"/>
            <text x="190" y="179" textAnchor="middle" fill={accent} fontSize="14" fontWeight="bold" fontFamily={ff}>OrderController</text>
            <text x="190" y="195" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>no tenant code needed</text>
            <line x1="190" y1="203" x2="190" y2="230" stroke={accent2} strokeWidth="2"/>
            <polygon points="190,230 185,222 195,222" fill={accent2}/>
            <rect x="40" y="230" width="300" height="45" rx="8" fill="#1b3a2a" stroke={accent2} strokeWidth="2"/>
            <text x="190" y="252" textAnchor="middle" fill={accent2} fontSize="14" fontWeight="bold" fontFamily={ff}>tenant_a_db.orders</text>
            <text x="190" y="268" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily={ff}>correct database, automatically</text>
          </svg>
        </FlexBox>
        </Appear>
      </Grid>
    </SlideContent>
  );
}

/* ── Slide 23: Conclusions ── */
function ConclusionsSlide() {
  return (
    <SlideContent title="Conclusions">
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div style={card(accent2)}>
            <div style={h3(accent2)}>What We Built</div>
            <ul style={ul}>
              <li>Shared library eliminating multitenancy boilerplate</li>
              <li>Consistent context lifecycle: HTTP, Kafka, SQS, WebSocket, Scheduler</li>
              <li>Safe async propagation with <code style={{ color: accent3, fontFamily: fm }}>ContextRunnable</code> / <code style={{ color: accent3, fontFamily: fm }}>ofReusable()</code></li>
              <li>Per-tenant DB pools, S3 clients, outbox patterns</li>
              <li>One annotation: <code style={{ color: accent3, fontFamily: fm }}>@EnableMultiTenancy</code></li>
            </ul>
          </div>
        </Appear>
        <Appear>
          <div style={card(grey)}>
            <div style={h3(grey)}>Lessons Learned</div>
            <ul style={ul}>
              <li>ThreadLocal + thread pools = silent data corruption if not managed carefully</li>
              <li>Context lifecycle must be owned by the framework, not the developer</li>
              <li>Async boundaries are the hardest part to get right</li>
            </ul>
          </div>
        </Appear>
      </Grid>
    </SlideContent>
  );
}

/* ── Slide 24: What's Next ── */
function WhatsNextSlide() {
  return (
    <SlideContent title="What's Next" subtitle={<>Migrating to <span style={{ color: accent3, fontWeight: 'bold' }}>Spring Boot 4</span> + <span style={{ color: accent3, fontWeight: 'bold' }}>Java 25</span> — rethinking the concurrency model entirely.</>}>
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={28} width="100%">
        <Appear>
          <div style={card(accent)}>
            <div style={h3(accent)}>Virtual Threads (Project Loom)</div>
            <p style={st}>Replace the thread pool with virtual threads. Each request/message gets its own lightweight thread — no more thread reuse concerns. <code style={{ color: accent3, fontFamily: fm }}>ThreadLocal</code> leaks become a non-issue.</p>
          </div>
        </Appear>
        <Appear>
          <div style={card(purple)}>
            <div style={h3(purple)}>ScopedValues (JEP 446)</div>
            <p style={st}>Replace <code style={{ color: accent3, fontFamily: fm }}>ThreadLocal</code> with <code style={{ color: accent3, fontFamily: fm }}>ScopedValue</code>. Immutable, structured scope — context bound to a scope, not a thread.</p>
            <AppearCode>
              <Code style={{ marginTop: 10 }}>
{`ScopedValue.where(TENANT_CTX, ctx)
  .run(() -> orderService.process(event));`}
              </Code>
            </AppearCode>
          </div>
        </Appear>
      </Grid>
    </SlideContent>
  );
}

/* ── Slide 25: Q&A ── */
function QASlide() {
  return (
    <FlexBox flexDirection="column" alignItems="center" justifyContent="center" height="100%">
      <div className="fade-in-up">
        <Heading fontSize="56px" fontFamily={ff} color={accent} margin="0 0 24px 0">Questions?</Heading>
      </div>
      <div className="fade-in-up-d1">
        <Text fontSize="24px" fontFamily={ff} color="#888" margin="0 0 48px 0">Thank you for listening.</Text>
      </div>

    </FlexBox>
  );
}


export default function Presentation() {
  const sp = { padding: '30px 60px' };
  return (
    <Deck theme={theme} transition={fadeTransition} template={() => (
      <>
        <GlobalCSS />
        <FlexBox justifyContent="flex-end" position="absolute" bottom={0} width={1} padding="0 1em 0.5em 0">
          <Progress />
        </FlexBox>
      </>
    )}>
      <Slide backgroundColor={bg} {...sp}>
        <TitleSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Hey everyone, thanks for being here.\n\nSo — \"One App, Many Customers.\" That's the short version of what I want to talk about today.\n\nWe build software for highway concessions — toll systems, traffic management, that kind of thing. And at some point we went from serving one operator to serving many, across different countries, with different legal requirements.\n\nThis talk is the story of how we built a shared multitenancy library for Spring Boot that handles all of that. We'll go through the evolution — the early decisions, the bugs we hit, and where we're heading next.\n\nLet's start from the beginning.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <StorySlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"So here's how it started.\n\n[CLICK] We had one highway concession. One Spring Boot app, one database. Life was simple.\n\n[CLICK] Then we grew. New operators came on board — different companies, different countries. Each one needed their data isolated. So now we had one app but multiple databases.\n\n[CLICK] Then the legal side kicked in. Some countries — Spain, Costa Rica, Portugal — have data residency laws. Your data has to live in a specific region. Others had operational reasons for wanting full separation.\n\n[CLICK] So we ended up with a hybrid model. Some services share a database with a tenant_id column — that's logical multitenancy. Others get their own dedicated database — physical multitenancy. And the choice depends on the domain context of each service, not on the concession itself.\n\nThe question became: how do we support all of this without duplicating logic across every service?\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <StoryArchSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"This is the high-level picture.\n\nAt the top you have your Spring Boot app — just a normal service. Below it sits our multitenancy library. And below that, the concessions.\n\nNotice the labels. Portugal shares a database — logical multitenancy. Spain gets its own database because of legislation. Costa Rica and the US get their own databases for regional operational reasons.\n\nThe key insight here: the app code doesn't know or care which strategy is in use. The library abstracts all of it. A service is either single-DB or multi-DB — that decision is made at configuration time, not in code.\n\nSo how does the library actually work? Let me first clarify what we mean by multitenancy.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <WhatIsMultitenancySlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Quick level-set for anyone not familiar with the terminology.\n\n[CLICK] Physical multitenancy means each tenant gets its own dedicated database. Full isolation. This is what you need when the law says \"this country's data cannot leave this region\" or when an operator demands complete independence.\n\nLogical multitenancy means everyone shares one database, but every row has a tenant_id column that scopes the data. Simpler to operate, but less isolation.\n\n[CLICK] On the right you can see the diagram — the Tenant Router decides where to send each request. Service A and C have their own databases. Service B shares one.\n\nThe important thing: this choice is driven by the service's domain context. Some services deal with sensitive financial data — they need physical isolation. Others handle shared reference data — logical is fine.\n\nOur library supports both, but you can't mix them.\n\nNow let me show you the problem this library actually solves.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <ProblemSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"I want to be clear — this isn't a before/after timeline. We built the library when the challenge first appeared. This comparison shows what life looks like with or without this kind of solution.\n\n[CLICK] Without it: every team reimplements tenant resolution. Header parsing is inconsistent across services. There's no standard for how Kafka or SQS consumers handle tenants. And the worst part — bugs silently write data to the wrong database. No exception, no warning. Just corrupted data.\n\n[CLICK] With the library: one shared dependency, one annotation — @EnableMultiTenancy — and you're done. Tenant context is consistent across HTTP, Kafka, SQS, WebSocket. Teams write business logic, not infrastructure plumbing.\n\nSo let me walk you through how we actually built this, step by step. It wasn't perfect from day one — it evolved through four major iterations.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <EvolutionV1ConceptsSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Alright, iteration one — the foundation.\n\n[CLICK] At the heart of everything is TenantContextHolder. It's a ThreadLocal holding a ContextMessage with the tenantId and userId. Static methods, no injection needed — any code anywhere can call getCurrentContext() and know which tenant it's serving.\n\nThink of it as the single source of truth for \"who is this request for?\"\n\n[CLICK] Now, we needed to populate that context from three different entry points.\n\n[CLICK] First, HTTP. We wrote an AsyncHandlerInterceptor that reads the X-Tenant-Id header, validates it, and sets the context.\n\nSecond, SQS. Our MultitenancyEventHandler extracts the tenant_id from Protobuf messages.\n\nThird, Kafka. The MultitenantMessageEventConsumer does the same from Avro messages.\n\nThree doors in, but they all lead to the same room — TenantContextHolder.\n\nLet me show you the flow visually.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <EvolutionV1FlowSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Here's the visual version of what I just described.\n\nOn the left you see the three entry points — HTTP request with the X-Tenant-Id header, SQS message with tenant_id in Protobuf, Kafka message with tenantId in Avro.\n\nEach one goes through its own interception layer — the purple boxes in the middle. But they all converge into TenantContextHolder on the right.\n\nFrom there, business logic downstream is completely tenant-aware without any explicit wiring. Your service layer never touches tenant resolution — it just calls getCurrentContext() and gets the answer.\n\nThis worked great. For a while.\n\n[pause]\n\nThen we found a bug.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <EvolutionV2BugSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Iteration two — the bug. And this is the one that keeps you up at night.\n\n[CLICK] Here's what happened. We use a thread pool — threads get reused across requests. That's normal, that's efficient. But ThreadLocal is mutable, and we never cleared it between requests.\n\nSo picture this: Thread #3 processes a request for Tenant A. Sets the ThreadLocal to \"tenant-a\". Request finishes. Thread goes back to the pool.\n\nNext request comes in — it's for Tenant B. Thread #3 picks it up. But the ThreadLocal still says \"tenant-a\".\nResult? We silently wrote Tenant B's data into Tenant A's database.\n\n[CLICK] And here's the scary part — there was no exception. No warning in the logs. The write succeeded perfectly. It just went to the wrong place. We only found out because our tests reported data inconsistencies.\n\nThis was a serious wake-up call. We needed a proper lifecycle.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <EvolutionV3LifecycleSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"So iteration three — the fix. We enforced a strict lifecycle: set, use, clear. No exceptions.\n\n[CLICK] First, a guard on set. Before writing to the ThreadLocal, we check if it's already populated. If it is, we throw an IllegalStateException. This catches accidental overwrites mid-request — something that should never happen.\n\nYou can see the code here — simple check, big impact.\n\n[CLICK] Second, guaranteed cleanup. We implemented what I call the triple-clear pattern in our MultitenancyInterceptor.\n\npostHandle() clears after the handler executes. afterCompletion() is the safety net — it clears after the full request lifecycle, even if something threw. And afterConcurrentHandlingStarted() clears on the original thread when async processing begins.\n\nFor Kafka and SQS, we have an onComplete() hook that clears after every message.\n\nThe key takeaway here: context lifecycle is owned by the framework, not by the developer. If you're relying on developers to remember to clear ThreadLocals... you're going to have a bad time.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <EvolutionV3DiagramSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Compare this with the bug slide we just saw — same Thread #3, same two requests.\n\nBut now, after Request 1 finishes, afterCompletion() fires and clears the context. See that dashed line in the middle? That's the thread in a clean state — no stale data.\n\nWhen Request 2 comes in for Tenant B, it gets a fresh context. Sets tenant-b. Processes correctly. Clears again.\n\nThread reuse is now safe because the lifecycle is enforced by the framework. The developer doesn't have to think about it.\n\n[pause]\n\nSo we solved the thread reuse problem. But then we hit another wall — what happens when you go async?\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <EvolutionV4AsyncSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Iteration four — async context propagation. This is where ThreadLocal really fights you.\n\nThe problem is simple: ThreadLocal doesn't cross thread boundaries. When you submit a task to an executor, the worker thread has no idea what tenant you're serving. The context is just... gone.\n\nLook at the diagram. The main thread has tenantId = \"tenant-abc\". It submits two tasks.\n\nOn the left — a plain lambda. The worker thread gets null for the tenant. That's a bug waiting to happen.\n\nOn the right — we wrap it with ContextRunnable.of(). This captures the context at creation time and restores it when the worker thread runs the task. tenantId = \"tenant-abc\" — preserved.\n\nWe built a family of wrappers for this: ContextRunnable, ContextCallable, ContextSupplier, ContextFunction. Same idea, different functional interfaces.\n\nLet me show you the API in more detail.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <EvolutionV4WrapperSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Two flavors, and the distinction matters.\n\n[CLICK] of() — captures context once. Fire-and-forget. Here we send a notification on a background thread — ContextRunnable.of() makes sure it knows which tenant it's serving.\n\n[CLICK] ofReusable() — captures and restores context on every invocation. This is for CompletableFuture pipelines where each stage might run on a different thread. supplyAsync fetches the order, thenApply enriches it — both wrapped with ofReusable so context flows through the entire chain. We use ofReusable for both stages because you don't control which thread pool each stage runs on.\n\nThat's the evolution — four iterations from a simple ThreadLocal to a full lifecycle with async propagation. Let me show you how this is organized as a library.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <ModuleArchSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Here's the module architecture.\n\nIn the center sits multitenancy-core — that's the TenantContextHolder, the interceptor, the configuration. Everything we've been talking about.\n\nAround it, plug-in modules. On the left, the data layer — mysql with HikariCP, Flyway, and JPA; mongodb with its own database factory routing. Below that, the messaging layer — kafka with Avro consumer base classes, sqs with Protobuf event handlers.\n\nOn the right, s3 for per-region client routing, websocket with AOP-based context injection, and the outbox-pattern module for transactional messaging.\n\nEach module is optional. You pull in what you need. If your service only does HTTP and MySQL, you only depend on core and mysql. If it also consumes Kafka, add the kafka module.\n\nLet me drill into a few of these, starting with the HTTP request flow.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <HttpFlowSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Let's trace an HTTP request end to end.\n\nStep 1 — a request arrives with the X-Tenant-Id header. That's the contract: every request must carry this header.\n\nStep 2 — our AsyncHandlerInterceptor picks it up. First thing it does is check the bypass list — is this a Swagger URL? An OPTIONS preflight? A Kafka or JMS internal endpoint? If so, skip tenant validation entirely. You can see the bypass list at the bottom.\n\nStep 3 — if it's not bypassed, the TenantValidator checks if this tenantId actually exists in our configured tenant list. Unknown tenant? Rejected.\n\nStep 4 — context is set. ThreadLocal gets populated with a ContextMessage containing the tenantId and userId.\n\nFrom there, the controller and service layer just call getCurrentContext(). No tenant code in your business logic.\n\nStep 5 — cleanup. The triple-clear pattern we talked about earlier: postHandle, afterCompletion, afterConcurrentHandlingStarted. The thread is always clean when it goes back to the pool.\n\nNow let's look at what happens at the database level.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <MysqlSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"The MySQL module — this is where the rubber meets the road.\n\nWhen your JPA repository makes a call, Hibernate's multitenancy SPI kicks in. Two key interfaces:\n\nCurrentTenantIdentifierResolver — this reads from our TenantContextHolder. It answers the question \"which tenant is this query for?\"\n\nDataSourceBasedConnectionProvider — this routes to the correct HikariCP pool based on that tenant identifier.\n\nAt the bottom you can see the map — each tenant gets its own HikariCP connection pool. tenant-a maps to DS_A, tenant-b to DS_B, and so on. Completely isolated connections.\n\nAnd Flyway runs migrations per tenant at startup, so every tenant's schema is always up to date. You add a new migration, deploy, and all tenants get it automatically.\n\nThat's the database side. Let's look at how messaging works.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <KafkaSqsSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Kafka and SQS — message-driven tenancy. Same philosophy, different transports.\n\nOn the left, Kafka. An Avro message arrives. The tenantId is extracted from either the message key or the value — depends on your schema. Our MultitenantMessageEventConsumer calls preHandle(), sets the context, and your business logic runs with the tenant already resolved.\n\nOn the right, SQS. Same flow, different format. A Protobuf message arrives with a tenant_id field. MultitenancyEventHandler does the extraction and context setup.\n\nThe important thing is the lifecycle is identical for both: preHandle sets the context, your code runs, onComplete clears it. Same pattern, same guarantees, regardless of whether the message came from Kafka or SQS.\n\nLet me show you the other two modules — S3 and WebSocket.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <S3WebSocketSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Two more modules worth highlighting.\n\nS3 — per-region client routing. Remember how different concessions operate in different AWS regions? The AmazonS3Factory looks at the current tenant's configured region and returns the right S3 client. One client per region — eu-west-1, us-east-1, ap-south-1. Your code just calls getAmazonS3() and gets the right one.\n\nWebSocket — this one's interesting. WebSocket messages don't go through the HTTP interceptor, so we use AOP instead. A ControllerAspect with @Around intercepts your WebSocket handlers. It reads the tenantId from the first argument — which must implement MultiTenantMessage — and sets the context before your handler executes.\n\nSo that covers the modules for request-driven and message-driven flows. But what about code that runs outside of a request? Scheduled jobs, batch processing?\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <MultitenantHelperSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"MultitenantHelper — this is for everything that doesn't start with a request or a message.\n\nThink cron jobs, data migrations, batch processing. There's no HTTP header, no Kafka message to extract a tenant from. You need to explicitly iterate over tenants.\n\nThat's what runForAllTenants does. It loops through every configured tenant. For each one: sets the context, runs your task, clears the context. Clean and safe.\n\nYou can see in the diagram — the scheduled job calls MultitenantHelper, which fans out to tenant-a, tenant-b, tenant-c, all the way to tenant-n. Each one gets the full set-run-clear lifecycle.\n\nThere's also runForTenant if you need to target a specific one, and supplyForAllTenants if you want to collect results — like aggregating metrics across all tenants.\n\nAlright, let me show you how easy it is to actually set this up.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <ConfigSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Configuration — and this is the part people usually don't believe until they see it.\n\n[CLICK] One annotation. @EnableMultiTenancy on your main class. That's it for the code side. It wires up the interceptor, the context holder, the datasource routing — everything.\n\n[CLICK] Then in application.yml, you declare your tenants. Each one has a name, a unique identifier — usually a UUID — the JDBC connection string, credentials, pool size, and optionally an AWS region for S3 routing.\n\nAdd a new tenant? Add a block to the YAML and redeploy. Remove one? Delete the block. The library handles the rest.\n\nNo other setup required. No custom beans, no manual wiring.\n\nBut what if you need to customize behavior? Let me show you the extensibility points.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <ExtensibilitySlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Two extensibility points on this slide.\n\n[CLICK] First, custom bypass URIs. Sometimes you have endpoints that shouldn't require a tenant — health checks, metrics, Prometheus scraping. You implement ConfigurableAllowedResource, return a list of URI patterns, and those skip tenant validation entirely. Clean separation.\n\n[CLICK] Second, custom Kafka consumers. You extend MultitenantKeyEventConsumer, parameterize it with your key and value types, and implement handle(). By the time handle() is called, the tenantId is already in context. You just write business logic.\n\nNotice the pattern — no boilerplate, no manual context management. Extend the base class, implement one method, done.\n\nSame pattern works for SQS — let me show you.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <ExtensibilitySqsSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"[CLICK] SQS follows the exact same pattern. Extend MultitenancyEventHandler, parameterize with your Protobuf type, implement handle(). Context is already set when your code runs.\n\n[CLICK] And that's really the takeaway for extensibility — the pattern is consistent across all messaging. Extend the base class, implement handle(), context is managed for you.\n\nThree base classes to choose from depending on your use case: MultitenantKeyEventConsumer for Kafka when the tenant is in the key, MultitenantValueEventConsumer when it's in the value, and MultitenancyEventHandler for SQS with Protobuf.\n\nSame mental model everywhere. Once a developer learns one, they know them all.\n\nAlright — enough slides. Let me show you this working for real.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <DemoSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Demo time.\n\n[CLICK] Here's what I'm going to show you:\n\nFirst, a Spring Boot app bootstrapped with @EnableMultiTenancy and two tenants configured in application.yml.\n\nThen I'll fire an HTTP request with X-Tenant-Id set — you'll see it route to the correct database automatically. On the right you can see the flow: curl hits the endpoint, the interceptor validates and sets context, the controller runs with zero tenant code, and the query goes to acme_db.\n\nI'll also show what happens when you send a missing or invalid tenant header — you get a clear error response, not a silent failure.\n\nAnd finally, a Kafka consumer picking up a message with a tenantId baked into the Avro schema.\n\nThings to watch for: zero boilerplate in the service layer, context set and cleared automatically, same code path but different database per tenant.\n\n[Switch to demo environment]\n\n[CLICK to advance when done]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <ConclusionsSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Alright, wrapping up.\n\n[CLICK] What we built: a shared library that eliminates multitenancy boilerplate across all our services. Consistent context lifecycle — whether the request comes from HTTP, Kafka, SQS, WebSocket, or a scheduled job. Safe async propagation with ContextRunnable. Per-tenant database pools, S3 clients, outbox patterns. And it all starts with one annotation.\n\n[CLICK] Lessons learned — and these are the ones I'd want you to take away even if you forget everything else:\n\nThreadLocal plus thread pools equals silent data corruption if you don't manage the lifecycle. We learned that the hard way.\n\nContext lifecycle must be owned by the framework. The moment you rely on developers to remember to clear state, you've already lost.\n\nAnd async boundaries are the hardest part to get right. ThreadLocal just doesn't cross thread boundaries — you need explicit propagation.\n\nBut we're not done. Let me tell you where this is heading.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <WhatsNextSlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"We're moving to Spring Boot 4 and Java 25.\n\n[CLICK] Virtual threads — each request gets its own thread. No pool, no reuse, no stale ThreadLocals. The bug from v2? Gone by design.\n\n[CLICK] ScopedValues — the ThreadLocal replacement.\n\n[CLICK] Look at the code. TENANT_CTX is the key — like a named slot. ctx is the value we bind. .where() creates the binding, .run() defines the scope. When the lambda ends, the binding is gone. No clear needed, no leak possible. And it propagates to child threads automatically.\n\nOur triple-clear pattern, the guards — all of that becomes unnecessary. The language handles it.\n\n[pause]\n\nThat's the journey — from ThreadLocal to scoped values. Thank you.\n\n[CLICK to advance]"}</div>
        </Notes>
      </Slide>
      <Slide backgroundColor={bg} {...sp}>
        <QASlide />
        <Notes>
          <div style={{ whiteSpace: 'pre-line' }}>{"Thanks everyone. Happy to take questions."}</div>
        </Notes>
      </Slide>
    </Deck>
  );
}
