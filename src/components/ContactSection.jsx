import { motion } from "framer-motion"
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import { isSafeExternalUrl, normalizeUrl } from "../lib/security"

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
)
const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.604-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>
)

const iconMap = {
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  external: ExternalLink,
}

function ContactSection({ contact }) {
  const titleWords = (contact?.title || '').split(' ')
  const titlePrefix = titleWords.slice(0, Math.max(1, titleWords.length - 2)).join(' ')
  const titleHighlight = titleWords.slice(Math.max(1, titleWords.length - 2)).join(' ')

  const contacts = [
    { label: "Email", value: contact.email, href: `mailto:${contact.email}`, Icon: Mail },
    { label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`, Icon: Phone },
    ...(contact.socials || []).map((social) => ({
      label: social.label,
      value: social.value,
      href: social.url,
      Icon: iconMap[social.icon] || ExternalLink,
    })),
  ]

  return (
    <section id="contact" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      {/* Grand blobs */}
      <div className="pointer-events-none absolute inset-0" style={{background:"radial-gradient(ellipse 80% 60% at 50% 100%, rgba(56,189,248,0.08) 0%, transparent 60%)"}} />
      <div className="blob-1 pointer-events-none absolute left-[-20%] bottom-[-20%] h-[700px] w-[700px] rounded-full bg-sky-600/10 blur-[150px]" />
      <div className="blob-2 pointer-events-none absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-14 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">Contact</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {titlePrefix}{" "}
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">{titleHighlight}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-slate-400">
            {contact.description} Based in {contact.location}, open to remote.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={normalizeUrl(contact.ctaPrimaryUrl, { allowHash: true, allowRelative: true, allowMailto: true, allowTel: true, fallback: '#' })}
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-sky-500 to-violet-600 px-7 py-3 text-sm font-bold text-white shadow-2xl shadow-sky-500/20 transition-all hover:shadow-sky-500/40 hover:brightness-110">
              <Mail size={16} /> {contact.ctaPrimaryLabel}
            </a>
            <a href={normalizeUrl(contact.ctaSecondaryUrl, { allowHash: true, allowRelative: true, allowMailto: true, allowTel: true, fallback: '#' })} target={isSafeExternalUrl(contact.ctaSecondaryUrl) ? "_blank" : undefined} rel={isSafeExternalUrl(contact.ctaSecondaryUrl) ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-bold text-white transition-all hover:border-white/25 hover:bg-white/10">
              <LinkedInIcon /> {contact.ctaSecondaryLabel}
            </a>
          </div>
        </motion.div>

        {/* Contact cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contacts.map((c, i) => (
            <motion.a key={c.label} href={normalizeUrl(c.href, { allowHash: true, allowRelative: true, allowMailto: true, allowTel: true, fallback: '#' })}
              target={isSafeExternalUrl(c.href) ? "_blank" : undefined}
              rel={isSafeExternalUrl(c.href) ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glow-border group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.07]">
              <c.Icon className="text-sky-400" size={18} />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{c.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-200 break-all">{c.value}</p>
            </motion.a>
          ))}
        </div>

        {/* Location chip */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-sm text-slate-400">
            <MapPin size={14} className="text-sky-500" /> {contact.location}
          </span>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactSection