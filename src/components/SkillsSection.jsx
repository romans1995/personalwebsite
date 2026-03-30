import { Languages, MonitorCog, Users, BriefcaseBusiness } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { skills, languages } from '../data/content'

const iconMap = {
  Technical: MonitorCog,
  'Customer / Communication': Users,
  'Operations / Business': BriefcaseBusiness,
}

function SkillsSection() {
  return (
    <section id="skills" className="bg-slate-50/70 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Core Strengths"
          title="Skills that support customers, systems, and growth"
          description="A balanced toolkit across technical troubleshooting, customer communication, and operational execution."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {skills.map((group) => {
            const Icon = iconMap[group.category]
            return (
              <article
                key={group.category}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-sky-700" />
                  <h3 className="text-base font-semibold text-slate-900">{group.category}</h3>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Languages size={18} className="text-sky-700" />
            <h3 className="text-base font-semibold text-slate-900">Languages</h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {languages.map((language) => (
              <span
                key={language}
                className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SkillsSection
