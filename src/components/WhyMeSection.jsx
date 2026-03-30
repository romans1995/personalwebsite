import { motion } from "framer-motion"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

function WhyMeSection({ about, cards = [], skills = [], languages = [] }) {
  return (
    <section id="about" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-[20%] top-0 h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">{about?.eyebrow}</p>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {about?.title}
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-400">
            {about?.description}
          </p>
        </motion.div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_320px]">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid gap-5 lg:grid-cols-3">
          {cards.map((card) => (
            <motion.article key={card.title} variants={item}
              whileHover={{ y: -4 }}
              className="glow-border group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06]">
              {/* glow blob */}
              <div className={"absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40 " + card.accent} />
              {/* tag */}
              <span className={"mb-5 inline-block rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white " + card.accent}>
                {card.tag}
              </span>
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.description}</p>
            </motion.article>
          ))}
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glow-border relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Languages</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {languages.map((language) => (
                <span key={language} className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
                  {language}
                </span>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Strength stack</p>
              <div className="mt-4 space-y-3">
                {skills.slice(0, 5).map((skill) => (
                  <div key={skill} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Skill pills strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 flex flex-wrap gap-2.5">
          {skills.map((s, i) => (
            <motion.span key={s}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">
              {s}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default WhyMeSection