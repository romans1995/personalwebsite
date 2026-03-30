import { motion } from "framer-motion"

function CaseStudiesSection({ caseStudies = [] }) {
  return (
    <section id="impact" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-teal-700/10 blur-[100px]" />

      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-teal-400">Case Studies</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Real problems.{" "}
            <span className="bg-gradient-to-r from-teal-400 to-sky-400 bg-clip-text text-transparent">Real outcomes.</span>
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-400">
            Three business scenarios showing how I diagnose, act, and deliver — across systems, processes, and people.
          </p>
        </motion.div>

        <div className="space-y-5">
          {caseStudies.map((cs, i) => (
            <motion.article key={cs.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={"glow-border group relative overflow-hidden rounded-2xl border bg-white/[0.02] p-7 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] " + cs.border}>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                {/* Number */}
                <div className="shrink-0">
                  <span className={"text-5xl font-black " + cs.accent}>{cs.number}</span>
                  <div className="mt-2 h-0.5 w-12 rounded-full opacity-50" style={{background:"currentColor"}} />
                </div>
                {/* Title + PAR */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{cs.title}</h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Problem", text: cs.problem, dotClass: "bg-red-400/70" },
                      { label: "Action", text: cs.action, dotClass: "bg-amber-400/70" },
                      { label: "Result", text: cs.result, dotClass: "bg-emerald-400/70" },
                    ].map((step) => (
                      <div key={step.label}>
                        <div className="mb-2 flex items-center gap-2">
                          <span className={"h-2 w-2 rounded-full " + step.dotClass} />
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{step.label}</p>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-300">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CaseStudiesSection