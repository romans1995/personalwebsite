import { CheckCircle2 } from 'lucide-react'
import SectionHeader from './SectionHeader'

const valuePoints = [
  'Troubleshoot systems quickly and methodically under pressure.',
  'Understand APIs, product logic, and web application behavior.',
  'Support customers with clear, practical communication.',
  'Improve workflows through automation and process design.',
  'Coordinate effectively across technical and business teams.',
]

function AboutSection() {
  return (
    <section id="about" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <SectionHeader
          eyebrow="About"
          title="I bridge technical execution with customer outcomes"
          description="I work at the intersection of operations, support, and product logic. I can diagnose technical issues, communicate clearly with customers, and align actions with business priorities."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Value proposition</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            I am not only technical and not only customer-facing. I combine troubleshooting, communication, and
            operational ownership to keep systems running, customers informed, and teams aligned.
          </p>

          <ul className="mt-6 space-y-3">
            {valuePoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-sky-700" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
