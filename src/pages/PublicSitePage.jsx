import { useEffect } from 'react'
import CaseStudiesSection from '../components/CaseStudiesSection'
import ContactSection from '../components/ContactSection'
import ExperienceSection from '../components/ExperienceSection'
import HeroSection from '../components/HeroSection'
import MetricsSection from '../components/MetricsSection'
import Navbar from '../components/Navbar'
import ProjectsSection from '../components/ProjectsSection'
import WhyMeSection from '../components/WhyMeSection'
import { useSiteContent } from '../hooks/useSiteContent'

function PublicSitePage() {
  const { content, loading } = useSiteContent()
  const visibility = content.settings?.visibility || {}
  const navItems = (content.navLinks || []).filter((item) => {
    const map = {
      about: visibility.about,
      experience: visibility.experience,
      projects: visibility.projects,
      impact: visibility.caseStudies,
      contact: visibility.contact,
    }

    return map[item.id] !== false
  })

  useEffect(() => {
    document.title = content.settings?.seoTitle || document.title

    const existingMeta = document.querySelector('meta[name="description"]')
    const description = content.settings?.seoDescription || ''

    if (existingMeta) {
      existingMeta.setAttribute('content', description)
    } else if (description) {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = description
      document.head.appendChild(meta)
    }
  }, [content.settings?.seoDescription, content.settings?.seoTitle])

  return (
    <div className="min-h-screen bg-[#05080f]">
      <Navbar navItems={navItems} />
      <main>
        {visibility.hero !== false && <HeroSection hero={content.hero} metrics={content.metrics} />}
        {visibility.metrics !== false && <MetricsSection metrics={content.metrics} loading={loading} />}
        {visibility.about !== false && (
          <WhyMeSection about={content.about} cards={content.whyMe} skills={content.skills} languages={content.languages} />
        )}
        {visibility.experience !== false && <ExperienceSection experience={content.experience} />}
        {visibility.projects !== false && <ProjectsSection projects={content.projects} />}
        {visibility.caseStudies !== false && <CaseStudiesSection caseStudies={content.caseStudies} />}
        {visibility.contact !== false && <ContactSection contact={content.contact} />}
      </main>

      <footer className="border-t border-white/[0.05] px-4 py-6 text-center text-xs text-slate-600 sm:px-6 lg:px-8">
        {content.settings?.footerText}
      </footer>
    </div>
  )
}

export default PublicSitePage
