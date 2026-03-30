function SectionHeader({ eyebrow, title, description, invert = false }) {
  return (
    <div className="max-w-3xl">
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${
          invert ? 'text-sky-400' : 'text-sky-700'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`text-3xl font-semibold tracking-tight sm:text-4xl ${
          invert ? 'text-slate-100' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg ${
            invert ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default SectionHeader
