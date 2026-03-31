import { motion } from "framer-motion"
import { Mail, MapPin, ArrowRight, ExternalLink } from "lucide-react"
import { isLinkedInPostUrl, trackHeroCtaClick, trackLinkedinPostClick } from "../lib/analytics"
import { isSafeExternalUrl, normalizeImageUrl, normalizeUrl } from "../lib/security"

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
)
const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.604-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>
)

function renderIcon(icon) {
  if (icon === 'linkedin') return <LinkedInIcon />
  if (icon === 'github') return <GitHubIcon />
  if (icon === 'mail') return <Mail size={15} />
  return <ExternalLink size={15} />
}

function MockDashboard({ hero, metrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 2 }}
      transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
      className="pointer-events-none absolute right-[-2rem] top-[-1rem] hidden w-[380px] lg:block xl:right-0"
    >
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl">
        <div className="mb-5 flex items-start gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-sky-500/30 via-slate-900 to-violet-500/25 p-1 shadow-[0_0_40px_rgba(56,189,248,0.18)]">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] bg-slate-950/90 text-2xl font-semibold text-white">
              {normalizeImageUrl(hero?.profileImageUrl) ? (
                <img src={normalizeImageUrl(hero?.profileImageUrl)} alt={hero.profileImageAlt || 'Profile'} className="h-full w-full object-cover" />
              ) : (
                <span>RS</span>
              )}
            </div>
          </div>
          <div className="pt-1">
            <p className="text-sm font-semibold text-white">Roman Stavinsky</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">Technical support, customer success, operations thinking, and system troubleshooting in one profile.</p>
          </div>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-xs font-medium text-slate-400">Operations Dashboard — Live</span>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(metrics || []).slice(0, 4).map((m, index) => (
            <div key={`${m.unit}-${index}`} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-[10px] text-slate-500">{m.unit}</p>
              <p className={"mt-1 text-xl font-bold " + ['text-sky-400','text-emerald-400','text-violet-400','text-amber-400'][index % 4]}>{m.value}</p>
            </div>
          ))}
        </div>
        <div className="mb-3 space-y-2">
          {[{l:"Automation Pipeline",p:85,c:"bg-sky-500"},{l:"Customer Tickets",p:62,c:"bg-violet-500"},{l:"Data Accuracy",p:99,c:"bg-emerald-500"}].map(b => (
            <div key={b.l}>
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-slate-400">{b.l}</span>
                <span className="text-slate-300">{b.p}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: b.p + "%" }}
                  transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
                  className={"h-full rounded-full " + b.c}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
          <p className="font-mono text-[9px] text-slate-500">{">"} automation.run() — WhatsApp reporter</p>
          <p className="mt-1 font-mono text-[9px] text-emerald-400">✓ report dispatched — 0.3s</p>
        </div>
      </div>
    </motion.div>
  )
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: "easeOut" },
})

function HeroSection({ hero, metrics = [] }) {
  const titleParts = hero?.headline?.split(' ') || []
  const highlightStart = Math.max(1, titleParts.length - 2)
  const prefix = titleParts.slice(0, highlightStart).join(' ')
  const highlight = titleParts.slice(highlightStart).join(' ')

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8">
      {/* Blobs */}
      <div className="blob-1 pointer-events-none absolute left-[-15%] top-[-10%] h-[600px] w-[600px] rounded-full bg-sky-600/15 blur-[120px]" />
      <div className="blob-2 pointer-events-none absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="blob-3 pointer-events-none absolute bottom-[-5%] left-[30%] h-[400px] w-[400px] rounded-full bg-teal-600/10 blur-[100px]" />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0" style={{backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",backgroundSize:"60px 60px"}} />

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="relative lg:pr-[420px]">
          {/* Location badge */}
          <motion.div {...fadeUp(0.1)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
              <MapPin size={12} className="text-sky-400" />
              {hero?.location} · {hero?.availability}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.25)} className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {prefix}{" "}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {highlight}
            </span>{" "}
          </motion.h1>

          {/* Subheadline */}
          <motion.p {...fadeUp(0.4)} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            {hero?.subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div {...fadeUp(0.55)} className="mt-8 flex flex-wrap gap-3">
            {(hero?.ctas || []).map((cta) => {
              const href = normalizeUrl(cta.url, { allowHash: true, allowRelative: true, allowMailto: true, allowTel: true, fallback: '#' })
              const styleMap = {
                primary: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/50 hover:brightness-110',
                secondary: 'border border-white/15 bg-white/5 text-white backdrop-blur-sm hover:border-white/30 hover:bg-white/10',
                ghost: 'border border-sky-500/40 bg-sky-500/10 text-sky-300 hover:border-sky-500/60 hover:bg-sky-500/20',
              }

              return (
                <a key={`${cta.label}-${cta.url}`} href={href} target={isSafeExternalUrl(href) ? '_blank' : undefined} rel={isSafeExternalUrl(href) ? 'noopener noreferrer' : undefined}
                  onClick={() => {
                    trackHeroCtaClick({
                      cta_label: cta.label,
                      cta_style: cta.style || 'secondary',
                      destination: href,
                      section: 'hero',
                    })

                    if (isLinkedInPostUrl(href)) {
                      trackLinkedinPostClick({
                        source: 'hero_cta',
                        label: cta.label,
                        destination: href,
                      })
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${styleMap[cta.style] || styleMap.secondary}`}>
                  {renderIcon(cta.icon)} {cta.label}
                </a>
              )
            })}
          </motion.div>

          {/* Role tags */}
          <motion.div {...fadeUp(0.7)} className="mt-8 flex flex-wrap gap-2">
            {(hero?.roleTags || []).map((tag, i) => (
              <motion.span key={tag}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.05 }}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-400">
                {tag}
              </motion.span>
            ))}
          </motion.div>

          {/* Scroll nudge */}
          <motion.div {...fadeUp(1.1)} className="mt-12 flex items-center gap-2 text-xs text-slate-600">
            <ArrowRight size={12} />
            <span>Scroll to explore</span>
          </motion.div>
        </div>

        {/* Mock Dashboard */}
        <MockDashboard hero={hero} metrics={metrics} />
      </div>
    </section>
  )
}

export default HeroSection