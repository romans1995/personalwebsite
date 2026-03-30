import { motion } from "framer-motion"
import { normalizeImageUrl } from "../lib/security"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

function ExperienceSection({ experience = [] }) {
  return (
    <section id="experience" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute right-[5%] top-[10%] h-[600px] w-[600px] rounded-full bg-sky-700/8 blur-[140px]" />

      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">Experience</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Professional{" "}
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">track record</span>
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-400">
            Customer-facing roles with technical ownership, measurable improvements, and business impact.
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-5">
          {experience.map((role, idx) => (
            <motion.article key={role.company + role.role} variants={item}
              whileHover={{ x: 4 }}
              className="glow-border group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05]">
              {/* ambient glow */}
              <div className={"pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 " + role.accent} />
              {/* number */}
              <span className="pointer-events-none absolute right-6 top-4 font-black text-slate-800 text-7xl leading-none select-none">
                {String(idx + 1).padStart(2, "0")}
              </span>

              <div className="relative">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{role.period}</p>
                    <h3 className="mt-1.5 text-xl font-bold text-white">{role.role}</h3>
                    <p className="mt-0.5 text-sm font-medium text-slate-400">{role.company}</p>
                  </div>
                  {normalizeImageUrl(role.logoUrl) ? (
                    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2">
                      <img src={normalizeImageUrl(role.logoUrl)} alt={`${role.company} visual`} className="h-12 w-12 rounded-xl object-cover" />
                    </div>
                  ) : null}
                </div>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {role.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500/70" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default ExperienceSection