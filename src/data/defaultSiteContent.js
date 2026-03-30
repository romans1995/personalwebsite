import {
  caseStudies,
  experience,
  languages,
  metrics,
  navLinks,
  projects,
  roleTags,
  skills,
  whyMe,
} from './content'

export const defaultSiteContent = {
  navLinks,
  hero: {
    headline: 'Technical Customer Success & Operations Specialist',
    subheadline:
      'I bridge technical systems and human outcomes. I troubleshoot, automate, onboard, and communicate across teams, workflows, and customer journeys.',
    location: 'Israel',
    availability: 'Open to remote',
    roleTags,
    ctas: [
      {
        label: 'LinkedIn',
        url: 'https://linkedin.com/in/roman-stavinsky',
        style: 'primary',
        icon: 'linkedin',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/romans1995',
        style: 'secondary',
        icon: 'github',
      },
      {
        label: 'Email Me',
        url: 'mailto:stavinskyroman@gmail.com',
        style: 'ghost',
        icon: 'mail',
      },
    ],
    profileImageUrl: '',
    profileImageAlt: 'Roman Stavinsky profile photo',
  },
  about: {
    eyebrow: 'Why me',
    title: 'Not a developer. Not just support. Both.',
    description:
      'Most roles sit at one end. I sit at the intersection — technical enough to investigate systems, customer-facing enough to build trust, and operational enough to improve how work gets done.',
  },
  metrics,
  whyMe,
  skills,
  languages,
  experience: experience.map((item) => ({
    ...item,
    logoUrl: item.logoUrl || '',
  })),
  projects: projects.map((item) => ({
    ...item,
    imageUrl: item.imageUrl || '',
    primaryLink: item.primaryLink || 'https://github.com/romans1995',
    primaryLinkLabel: item.primaryLinkLabel || 'View Code',
    secondaryLink: item.secondaryLink || '#contact',
    secondaryLinkLabel: item.secondaryLinkLabel || 'Request Demo',
  })),
  caseStudies,
  contact: {
    title: "Let's build something together",
    description:
      'Open to Technical Customer Success, Solutions, Support, Technical Operations, and customer-facing tech roles.',
    email: 'stavinskyroman@gmail.com',
    phone: '052-6737759',
    location: 'Israel',
    socials: [
      {
        label: 'LinkedIn',
        value: 'linkedin.com/in/roman-stavinsky',
        url: 'https://linkedin.com/in/roman-stavinsky',
        icon: 'linkedin',
      },
      {
        label: 'GitHub',
        value: 'github.com/romans1995',
        url: 'https://github.com/romans1995',
        icon: 'github',
      },
    ],
    ctaPrimaryLabel: 'Send me an email',
    ctaPrimaryUrl: 'mailto:stavinskyroman@gmail.com',
    ctaSecondaryLabel: 'LinkedIn Profile',
    ctaSecondaryUrl: 'https://linkedin.com/in/roman-stavinsky',
  },
  settings: {
    seoTitle: 'Roman Stavinsky | Technical Customer Success & Operations',
    seoDescription:
      'Premium personal site for Roman Stavinsky — technical customer success, support, operations, and customer-facing tech roles.',
    footerText: 'Roman Stavinsky · Customer Success · Technical Operations · Solutions',
    visibility: {
      hero: true,
      metrics: true,
      about: true,
      experience: true,
      projects: true,
      caseStudies: true,
      contact: true,
    },
  },
}
