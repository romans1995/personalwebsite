export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'impact', label: 'Impact' },
  { id: 'contact', label: 'Contact' },
]

export const roleTags = [
  'Customer Success', 'Technical Ops', 'Automation',
  'API / Web Apps', 'Problem Solving', 'Support', 'Sales', 'Process Design',
]

export const metrics = [
  { value: '~1hr', unit: 'saved daily', description: 'via process automation' },
  { value: '10+', unit: 'tools daily', description: 'systems operated in parallel' },
  { value: '5+', unit: 'reports/day', description: 'operational data distributed' },
  { value: '3+', unit: 'years', description: 'in technical customer roles' },
]

export const whyMe = [
  {
    title: 'Technical without being a developer',
    description: 'I understand APIs, web app behavior, databases, and system workflows. I can debug, investigate, and translate technical issues into clear language for any audience.',
    accent: 'from-sky-500 to-blue-600',
    tag: 'Technical',
  },
  {
    title: 'Customer-facing with substance',
    description: 'I manage full customer journeys — onboarding, issue resolution, expectation management — while keeping technical accuracy and business outcomes front of mind.',
    accent: 'from-violet-500 to-purple-600',
    tag: 'Customer',
  },
  {
    title: 'Operations and process mindset',
    description: 'I spot bottlenecks, build automations, standardize reporting, and improve daily workflows. I make systems more reliable and teams more efficient.',
    accent: 'from-teal-500 to-emerald-600',
    tag: 'Operations',
  },
]

export const skills = [
  'Technical Troubleshooting', 'Systems Monitoring', 'Back Office Operations',
  'Process Automation', 'Data Analysis (Excel)', 'A/B Testing Support',
  'REST APIs / JSON', 'Firebase / MongoDB', 'React / Web Apps',
  'Customer Onboarding', 'Cross-team Communication', 'Issue De-escalation',
  'Asana / Slack', 'Needs Analysis',
]

export const languages = ['Hebrew', 'Russian', 'English']

export const experience = [
  {
    role: 'Technical Operations & Customer Success',
    company: 'Fast Lane',
    period: 'Jan 2023 — Present',
    accent: 'from-sky-500/20 to-blue-600/10',
    glowColor: 'rgba(56,189,248,0.15)',
    points: [
      'Monitor and operate real-time operational systems to keep daily workflows reliable and accurate.',
      'Create and distribute ~5 operational and performance reports daily for cross-team visibility.',
      'Handle live technical and operational issues — diagnose fast, coordinate faster.',
      'Built a WhatsApp automation tool, eliminating ~1 hour of manual reporting per day.',
      'Resolved a complex data error by tracing and correcting faulty Excel formula chains.',
      'Juggle 10+ tools, dashboards, and systems simultaneously while maintaining data integrity.',
    ],
  },
  {
    role: 'Customer Support & Web Solutions Specialist',
    company: 'Maxi Site',
    period: 'Jan 2022 — Jan 2023',
    accent: 'from-violet-500/20 to-purple-600/10',
    glowColor: 'rgba(139,92,246,0.15)',
    points: [
      'Supported customers across WordPress platforms on technical and service-level issues.',
      'Translated client needs into practical web solutions with clear implementation guidance.',
      'Delivered onboarding that measurably improved user adoption and product confidence.',
      'Managed parallel support queues while keeping accuracy and response quality high.',
    ],
  },
  {
    role: 'Sales Manager',
    company: 'Rikoshet',
    period: 'Jan 2018 — Jan 2022',
    accent: 'from-teal-500/20 to-emerald-600/10',
    glowColor: 'rgba(20,184,166,0.15)',
    points: [
      'Consistently exceeded monthly sales targets through structured customer discovery.',
      'Matched customers to the right solutions using needs analysis and active listening.',
      'Owned the full customer journey — first conversation through post-purchase support.',
      'Built strong communication and prioritization habits under consistent pressure.',
    ],
  },
]

export const projects = [
  {
    title: 'Challenge App',
    description: 'Web app for tracking nutrition, habits, and personal goals with user progress flows and data management.',
    tech: ['React', 'State Management', 'User Flows', 'Data Tracking'],
    value: 'Shows product thinking, user-oriented UX, and frontend execution.',
    gradient: 'from-sky-500/30 via-blue-600/20 to-transparent',
    icon: '🎯',
  },
  {
    title: 'Video Editing App',
    description: 'Built and deployed a video editor on Base44 including timeline editing, subtitle workflow, and export logic.',
    tech: ['Base44', 'Workflow Design', 'Debugging', 'UX'],
    value: 'Complex feature workflow ownership and fast product iteration.',
    gradient: 'from-violet-500/30 via-purple-600/20 to-transparent',
    icon: '🎬',
  },
  {
    title: 'API / Auth / Upload Systems',
    description: 'Hands-on work with REST APIs, JSON payloads, authentication flows, and file upload handling.',
    tech: ['REST APIs', 'JSON', 'Auth Flows', 'File Uploads'],
    value: 'Practical understanding of system behavior and web app internals.',
    gradient: 'from-teal-500/30 via-emerald-600/20 to-transparent',
    icon: '⚡',
  },
  {
    title: 'Reporting Automation',
    description: 'Designed automation tools that eliminated repetitive reporting steps and improved operational consistency.',
    tech: ['Automation', 'Excel Logic', 'Process Design', 'Ops'],
    value: 'Delivered ~1 hour/day in time savings and stronger data reliability.',
    gradient: 'from-amber-500/30 via-orange-600/20 to-transparent',
    icon: '🔧',
  },
]

export const caseStudies = [
  {
    number: '01',
    title: 'Reporting Automation',
    problem: 'Manual reporting consumed significant daily time, created bottlenecks, and introduced human error into operational outputs.',
    action: 'Designed and built a WhatsApp-based automation tool that standardized report generation and distribution.',
    result: 'Saved ~1 hour per day, improved consistency, reduced errors, and freed bandwidth for higher-priority tasks.',
    accent: 'text-sky-400',
    border: 'border-sky-500/20',
  },
  {
    number: '02',
    title: 'Critical Reporting Error Fix',
    problem: 'A reporting issue was silently outputting incorrect data — affecting operational decisions without obvious symptoms.',
    action: 'Investigated source data, traced faulty Excel formula chains, corrected logic, and validated outputs.',
    result: 'Prevented escalation, restored trust in the data, and stabilized reporting accuracy across the team.',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
  },
  {
    number: '03',
    title: 'Technical x Customer Bridge',
    problem: 'Customers and internal teams needed practical technical help but lacked a clear path to resolution.',
    action: 'Provided direct technical support, translated system behavior into plain language, and coordinated cross-team.',
    result: 'Faster resolution cycles, stronger customer confidence, and smoother daily operations.',
    accent: 'text-teal-400',
    border: 'border-teal-500/20',
  },
]
