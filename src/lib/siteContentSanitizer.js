import { defaultSiteContent } from '../data/defaultSiteContent'
import {
  normalizeImageUrl,
  normalizeUrl,
  sanitizeClassToken,
  sanitizeMultilineText,
  sanitizeSectionId,
  sanitizeText,
} from './security'

const CTA_STYLES = new Set(['primary', 'secondary', 'ghost'])
const CTA_ICONS = new Set(['linkedin', 'github', 'mail', 'external'])
const SOCIAL_ICONS = new Set(['linkedin', 'github', 'external'])

export function sanitizeSiteContent(input) {
  const source = input || defaultSiteContent

  const heroCtas = (source.hero?.ctas || []).map((cta) => ({
    label: sanitizeText(cta.label, 40),
    url: normalizeUrl(cta.url, {
      allowHash: true,
      allowRelative: true,
      allowMailto: true,
      allowTel: true,
      fallback: '#',
    }),
    style: CTA_STYLES.has(cta.style) ? cta.style : 'secondary',
    icon: CTA_ICONS.has(cta.icon) ? cta.icon : 'external',
  }))

  const navLinks = (source.navLinks || []).map((item) => ({
    id: sanitizeSectionId(item.id),
    label: sanitizeText(item.label, 30),
  }))

  const experience = (source.experience || []).map((item) => ({
    role: sanitizeText(item.role, 120),
    company: sanitizeText(item.company, 120),
    period: sanitizeText(item.period, 80),
    accent: sanitizeClassToken(item.accent, 150),
    glowColor: sanitizeText(item.glowColor, 80),
    logoUrl: normalizeImageUrl(item.logoUrl),
    points: (item.points || []).map((point) => sanitizeMultilineText(point, 260)).filter(Boolean),
  }))

  const projects = (source.projects || []).map((item) => ({
    title: sanitizeText(item.title, 120),
    description: sanitizeMultilineText(item.description, 550),
    tech: (item.tech || []).map((tech) => sanitizeText(tech, 60)).filter(Boolean),
    value: sanitizeMultilineText(item.value, 500),
    gradient: sanitizeClassToken(item.gradient, 160),
    icon: sanitizeText(item.icon, 6),
    imageUrl: normalizeImageUrl(item.imageUrl),
    primaryLink: normalizeUrl(item.primaryLink, {
      allowHash: true,
      allowRelative: true,
      allowMailto: true,
      allowTel: true,
      fallback: '#',
    }),
    primaryLinkLabel: sanitizeText(item.primaryLinkLabel, 40),
    secondaryLink: normalizeUrl(item.secondaryLink, {
      allowHash: true,
      allowRelative: true,
      allowMailto: true,
      allowTel: true,
      fallback: '#',
    }),
    secondaryLinkLabel: sanitizeText(item.secondaryLinkLabel, 40),
  }))

  const caseStudies = (source.caseStudies || []).map((item, index) => ({
    number: sanitizeText(item.number, 4) || String(index + 1).padStart(2, '0'),
    title: sanitizeText(item.title, 120),
    problem: sanitizeMultilineText(item.problem, 550),
    action: sanitizeMultilineText(item.action, 550),
    result: sanitizeMultilineText(item.result, 550),
    accent: sanitizeClassToken(item.accent, 60),
    border: sanitizeClassToken(item.border, 60),
  }))

  const socials = (source.contact?.socials || []).map((item) => ({
    label: sanitizeText(item.label, 40),
    value: sanitizeText(item.value, 120),
    url: normalizeUrl(item.url, { fallback: '#' }),
    icon: SOCIAL_ICONS.has(item.icon) ? item.icon : 'external',
  }))

  return {
    navLinks,
    hero: {
      headline: sanitizeText(source.hero?.headline, 160),
      subheadline: sanitizeMultilineText(source.hero?.subheadline, 600),
      location: sanitizeText(source.hero?.location, 80),
      availability: sanitizeText(source.hero?.availability, 120),
      roleTags: (source.hero?.roleTags || []).map((tag) => sanitizeText(tag, 40)).filter(Boolean),
      ctas: heroCtas,
      profileImageUrl: normalizeImageUrl(source.hero?.profileImageUrl),
      profileImageAlt: sanitizeText(source.hero?.profileImageAlt, 120),
    },
    about: {
      eyebrow: sanitizeText(source.about?.eyebrow, 32),
      title: sanitizeText(source.about?.title, 160),
      description: sanitizeMultilineText(source.about?.description, 600),
    },
    metrics: (source.metrics || []).map((item) => ({
      value: sanitizeText(item.value, 30),
      unit: sanitizeText(item.unit, 50),
      description: sanitizeText(item.description, 120),
    })),
    whyMe: (source.whyMe || []).map((item) => ({
      title: sanitizeText(item.title, 120),
      description: sanitizeMultilineText(item.description, 420),
      accent: sanitizeClassToken(item.accent, 120),
      tag: sanitizeText(item.tag, 40),
    })),
    skills: (source.skills || []).map((item) => sanitizeText(item, 60)).filter(Boolean),
    languages: (source.languages || []).map((item) => sanitizeText(item, 40)).filter(Boolean),
    experience,
    projects,
    caseStudies,
    contact: {
      title: sanitizeText(source.contact?.title, 160),
      description: sanitizeMultilineText(source.contact?.description, 500),
      email: sanitizeText(source.contact?.email, 120),
      phone: sanitizeText(source.contact?.phone, 40),
      location: sanitizeText(source.contact?.location, 80),
      socials,
      ctaPrimaryLabel: sanitizeText(source.contact?.ctaPrimaryLabel, 40),
      ctaPrimaryUrl: normalizeUrl(source.contact?.ctaPrimaryUrl, {
        allowHash: true,
        allowRelative: true,
        allowMailto: true,
        allowTel: true,
        fallback: '#',
      }),
      ctaSecondaryLabel: sanitizeText(source.contact?.ctaSecondaryLabel, 40),
      ctaSecondaryUrl: normalizeUrl(source.contact?.ctaSecondaryUrl, {
        allowHash: true,
        allowRelative: true,
        allowMailto: true,
        allowTel: true,
        fallback: '#',
      }),
    },
    settings: {
      seoTitle: sanitizeText(source.settings?.seoTitle, 120),
      seoDescription: sanitizeText(source.settings?.seoDescription, 220),
      footerText: sanitizeText(source.settings?.footerText, 160),
      visibility: {
        hero: Boolean(source.settings?.visibility?.hero),
        metrics: Boolean(source.settings?.visibility?.metrics),
        about: Boolean(source.settings?.visibility?.about),
        experience: Boolean(source.settings?.visibility?.experience),
        projects: Boolean(source.settings?.visibility?.projects),
        caseStudies: Boolean(source.settings?.visibility?.caseStudies),
        contact: Boolean(source.settings?.visibility?.contact),
      },
    },
  }
}

const urlFieldValidators = [
  ['hero.ctas[].url', (content) => content.hero.ctas.map((item) => item.url)],
  ['projects[].primaryLink', (content) => content.projects.map((item) => item.primaryLink)],
  ['projects[].secondaryLink', (content) => content.projects.map((item) => item.secondaryLink)],
  ['contact.socials[].url', (content) => content.contact.socials.map((item) => item.url)],
  ['contact.ctaPrimaryUrl', (content) => [content.contact.ctaPrimaryUrl]],
  ['contact.ctaSecondaryUrl', (content) => [content.contact.ctaSecondaryUrl]],
]

export function validateSiteContent(input) {
  const errors = []
  const content = sanitizeSiteContent(input)

  if (content.hero.headline.length < 8) {
    errors.push('Hero headline is too short.')
  }

  if (!/^\S+@\S+\.\S+$/.test(content.contact.email)) {
    errors.push('Contact email is invalid.')
  }

  urlFieldValidators.forEach(([label, getValues]) => {
    getValues(content).forEach((value) => {
      if (!value || value === '#') {
        errors.push(`Invalid URL in ${label}.`)
      }
    })
  })

  return { content, errors }
}
