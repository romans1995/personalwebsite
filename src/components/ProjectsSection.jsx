import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { isLinkedInPostUrl, trackLinkedinPostClick, trackProjectClick } from "../lib/analytics"
import { isSafeExternalUrl, normalizeImageUrl, normalizeUrl } from "../lib/security"

function ProjectsSection({ projects = [] }) {
  return (
    <section id="projects" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-[5%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">Projects</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Work that{" "}
            <span className="bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">ships and delivers</span>
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-400">
            Built, debugged, and shipped — every project focused on practical value and real outcomes.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((proj, i) => (
            (() => {
              const primaryHref = normalizeUrl(proj.primaryLink, {
                allowHash: true,
                allowRelative: true,
                allowMailto: true,
                allowTel: true,
                fallback: '#',
              })
              const secondaryHref = normalizeUrl(proj.secondaryLink, {
                allowHash: true,
                allowRelative: true,
                allowMailto: true,
                allowTel: true,
                fallback: '#',
              })

              const hasValidPrimaryLink = primaryHref !== '#'
              const hasValidSecondaryLink = secondaryHref !== '#'

              return (
            <motion.article key={proj.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: (i % 2) * 0.1 }}
              whileHover={{ y: -6 }}
              className="glow-border group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05]">
              {/* Visual top area */}
              <div className={"relative h-44 overflow-hidden bg-gradient-to-br " + proj.gradient}>
                {normalizeImageUrl(proj.imageUrl) ? (
                  <img src={normalizeImageUrl(proj.imageUrl)} alt={`${proj.title} preview`} className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-6xl opacity-30">{proj.icon}</div>
                    <div className="pointer-events-none absolute inset-0" style={{backgroundImage:"radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px)",backgroundSize:"18px 18px"}} />
                  </>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#05080f] via-[#05080f]/60 to-transparent" />
                <span className="pointer-events-none absolute bottom-4 left-5 text-3xl">{proj.icon}</span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{proj.description}</p>
                <div className="my-4 flex flex-wrap gap-2">
                  {proj.tech.map((t) => (
                    <span key={t} className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-slate-400">{t}</span>
                  ))}
                </div>
                <p className="mt-auto text-xs leading-relaxed text-slate-500">{proj.value}</p>
                <div className="relative z-20 mt-5 flex gap-3 pointer-events-auto">
                  {hasValidPrimaryLink ? (
                    <a href={primaryHref} target={isSafeExternalUrl(primaryHref) ? "_blank" : undefined} rel={isSafeExternalUrl(primaryHref) ? "noopener noreferrer" : undefined}
                      onClick={() => {
                        trackProjectClick({
                          project_title: proj.title,
                          link_type: 'primary',
                          link_label: proj.primaryLinkLabel,
                          destination: primaryHref,
                        })

                        if (isLinkedInPostUrl(primaryHref)) {
                          trackLinkedinPostClick({
                            source: 'project_link',
                            project_title: proj.title,
                            link_type: 'primary',
                            destination: primaryHref,
                          })
                        }
                      }}
                      className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:text-white">
                      {proj.primaryLinkLabel} <ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <button type="button" disabled aria-disabled="true"
                      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-600 opacity-60">
                      {proj.primaryLinkLabel} <ArrowUpRight size={12} />
                    </button>
                  )}

                  {hasValidSecondaryLink ? (
                    <a href={secondaryHref} target={isSafeExternalUrl(secondaryHref) ? "_blank" : undefined} rel={isSafeExternalUrl(secondaryHref) ? "noopener noreferrer" : undefined}
                      onClick={() => {
                        trackProjectClick({
                          project_title: proj.title,
                          link_type: 'secondary',
                          link_label: proj.secondaryLinkLabel,
                          destination: secondaryHref,
                        })

                        if (isLinkedInPostUrl(secondaryHref)) {
                          trackLinkedinPostClick({
                            source: 'project_link',
                            project_title: proj.title,
                            link_type: 'secondary',
                            destination: secondaryHref,
                          })
                        }
                      }}
                      className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-medium text-sky-400 transition hover:bg-sky-500/20">
                      {proj.secondaryLinkLabel} <ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <button type="button" disabled aria-disabled="true"
                      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/5 px-3.5 py-1.5 text-xs font-medium text-sky-700 opacity-60">
                      {proj.secondaryLinkLabel} <ArrowUpRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
              )
            })()
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProjectsSection