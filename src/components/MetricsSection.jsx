import { motion } from "framer-motion"

function MetricsSection({ metrics = [] }) {
  return (
    <section className="relative px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-sky-900/30 via-slate-900/60 to-violet-900/30 p-8 backdrop-blur-xl lg:p-12">
          {/* glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{background:"radial-gradient(ellipse 60% 50% at 50% 0%, rgba(56,189,248,0.1) 0%, transparent 70%)"}} />
          <div className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
            {metrics.map((m, i) => (
              <motion.div key={m.unit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center">
                <p className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                    {m.value}
                  </span>
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-300">{m.unit}</p>
                <p className="mt-1 text-xs text-slate-500">{m.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MetricsSection