import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  LogOut,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { defaultSiteContent } from '../data/defaultSiteContent'
import { useSiteContent } from '../hooks/useSiteContent'
import { validateSiteContent } from '../lib/siteContentSanitizer'
import { initializeSiteContent, saveSiteContent } from '../services/siteContentService'
import { uploadPublicImage } from '../services/storageService'

const tabs = [
  'Hero',
  'About',
  'Skills',
  'Experience',
  'Projects',
  'Case Studies',
  'Contact',
  'Settings',
]

const createClone = (value) =>
  globalThis.structuredClone
    ? globalThis.structuredClone(value)
    : JSON.parse(JSON.stringify(value))

function setValueAtPath(target, path, value) {
  const clone = createClone(target)
  let cursor = clone

  for (let index = 0; index < path.length - 1; index += 1) {
    cursor = cursor[path[index]]
  }

  cursor[path[path.length - 1]] = value
  return clone
}

function AdminCard({ title, description, actions, children }) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-2 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500 ${props.className || ''}`}
    />
  )
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500 ${props.className || ''}`}
    />
  )
}

function ActionButton({ children, variant = 'default', ...props }) {
  const styles = {
    default: 'border-white/[0.08] bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]',
    primary: 'border-sky-500/20 bg-sky-500/15 text-sky-100 hover:bg-sky-500/25',
    danger: 'border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  }

  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${styles[variant]} ${props.className || ''}`}
    >
      {children}
    </button>
  )
}

function StringListEditor({ items, onChange, addLabel = 'Add item' }) {
  const [nextValue, setNextValue] = useState('')

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-200">
            <span>{item}</span>
            <button type="button" onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))} className="text-slate-500 transition hover:text-rose-300">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <TextInput value={nextValue} onChange={(event) => setNextValue(event.target.value)} placeholder="Add a new item" />
        <ActionButton
          type="button"
          onClick={() => {
            if (!nextValue.trim()) return
            onChange([...items, nextValue.trim()])
            setNextValue('')
          }}
        >
          <Plus size={14} />
          {addLabel}
        </ActionButton>
      </div>
    </div>
  )
}

function UploadField({ label, previewUrl, folder, onUploaded }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      event.target.value = ''
      return
    }

    setUploading(true)
    setError('')

    try {
      const url = await uploadPublicImage(file, folder)
      onUploaded(url)
    } catch (nextError) {
      setError(nextError.message || 'Upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-slate-500">Upload a real image. Public site falls back gracefully if empty.</p>
        </div>
        <ActionButton type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading ? 'Uploading…' : 'Upload image'}
        </ActionButton>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {previewUrl ? (
        <img src={previewUrl} alt="Preview" className="h-40 w-full rounded-2xl object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl bg-slate-950/70 text-sm text-slate-500">
          No image uploaded
        </div>
      )}

      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  )
}

function ItemToolbar({ onMoveUp, onMoveDown, onDelete, disableUp, disableDown }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton type="button" onClick={onMoveUp} disabled={disableUp}>
        <ArrowUp size={14} />
      </ActionButton>
      <ActionButton type="button" onClick={onMoveDown} disabled={disableDown}>
        <ArrowDown size={14} />
      </ActionButton>
      <ActionButton type="button" variant="danger" onClick={onDelete}>
        <Trash2 size={14} /> Delete
      </ActionButton>
    </div>
  )
}

function AdminDashboardPage() {
  const { content, loading } = useSiteContent()
  const { signOut, user } = useAuth()
  const [activeTab, setActiveTab] = useState('Hero')
  const [draft, setDraft] = useState(defaultSiteContent)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [initializing, setInitializing] = useState(false)

  useEffect(() => {
    if (!loading) {
      setDraft(content)
    }
  }, [content, loading])

  const updatePath = (path, value) => {
    setDraft((current) => setValueAtPath(current, path, value))
  }

  const moveItem = (path, index, direction) => {
    setDraft((current) => {
      const clone = createClone(current)
      let cursor = clone
      for (let i = 0; i < path.length; i += 1) cursor = cursor[path[i]]
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= cursor.length) return current
      ;[cursor[index], cursor[nextIndex]] = [cursor[nextIndex], cursor[index]]
      return clone
    })
  }

  const removeItem = (path, index) => {
    setDraft((current) => {
      const clone = createClone(current)
      let cursor = clone
      for (let i = 0; i < path.length; i += 1) cursor = cursor[path[i]]
      cursor.splice(index, 1)
      return clone
    })
  }

  const addItem = (path, item) => {
    setDraft((current) => {
      const clone = createClone(current)
      let cursor = clone
      for (let i = 0; i < path.length; i += 1) cursor = cursor[path[i]]
      cursor.push(item)
      return clone
    })
  }

  const updateArrayItem = (path, index, nextItem) => {
    setDraft((current) => {
      const clone = createClone(current)
      let cursor = clone
      for (let i = 0; i < path.length; i += 1) cursor = cursor[path[i]]
      cursor[index] = nextItem
      return clone
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setStatus('')

    try {
      const { content: sanitizedDraft, errors } = validateSiteContent(draft)

      if (errors.length > 0) {
        setStatus(`Validation failed: ${errors[0]}`)
        return
      }

      await saveSiteContent(sanitizedDraft)
      setStatus('Saved successfully.')
    } catch (error) {
      setStatus(error.message || 'Unable to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleInitialize = async () => {
    setInitializing(true)
    setStatus('')

    try {
      const initialized = await initializeSiteContent()
      setDraft(initialized)
      setStatus('Content document initialized from your existing site data.')
    } catch (error) {
      setStatus(error.message || 'Unable to initialize content.')
    } finally {
      setInitializing(false)
    }
  }

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'Hero':
        return (
          <div className="space-y-6">
            <AdminCard title="Hero content" description="Edit headline, subheadline, CTAs, role tags, and your main profile image.">
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Headline">
                  <TextInput value={draft.hero.headline} onChange={(event) => updatePath(['hero', 'headline'], event.target.value)} />
                </Field>
                <Field label="Location">
                  <TextInput value={draft.hero.location} onChange={(event) => updatePath(['hero', 'location'], event.target.value)} />
                </Field>
                <div className="lg:col-span-2">
                  <Field label="Subheadline">
                    <TextArea rows={4} value={draft.hero.subheadline} onChange={(event) => updatePath(['hero', 'subheadline'], event.target.value)} />
                  </Field>
                </div>
                <Field label="Availability">
                  <TextInput value={draft.hero.availability} onChange={(event) => updatePath(['hero', 'availability'], event.target.value)} />
                </Field>
                <Field label="Image alt text">
                  <TextInput value={draft.hero.profileImageAlt} onChange={(event) => updatePath(['hero', 'profileImageAlt'], event.target.value)} />
                </Field>
                <div className="lg:col-span-2">
                  <UploadField
                    label="Profile image"
                    previewUrl={draft.hero.profileImageUrl}
                    folder="profile"
                    onUploaded={(url) => updatePath(['hero', 'profileImageUrl'], url)}
                  />
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Hero role tags">
              <StringListEditor items={draft.hero.roleTags} onChange={(nextItems) => updatePath(['hero', 'roleTags'], nextItems)} addLabel="Add tag" />
            </AdminCard>

            <AdminCard title="Hero CTA buttons" actions={<ActionButton type="button" onClick={() => addItem(['hero', 'ctas'], { label: 'New CTA', url: '#', style: 'secondary', icon: 'mail' })}><Plus size={14} /> Add CTA</ActionButton>}>
              <div className="space-y-4">
                {draft.hero.ctas.map((cta, index) => (
                  <div key={`${cta.label}-${index}`} className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">CTA {index + 1}</p>
                      <ItemToolbar
                        onMoveUp={() => moveItem(['hero', 'ctas'], index, -1)}
                        onMoveDown={() => moveItem(['hero', 'ctas'], index, 1)}
                        onDelete={() => removeItem(['hero', 'ctas'], index)}
                        disableUp={index === 0}
                        disableDown={index === draft.hero.ctas.length - 1}
                      />
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="Label">
                        <TextInput value={cta.label} onChange={(event) => updateArrayItem(['hero', 'ctas'], index, { ...cta, label: event.target.value })} />
                      </Field>
                      <Field label="URL">
                        <TextInput value={cta.url} onChange={(event) => updateArrayItem(['hero', 'ctas'], index, { ...cta, url: event.target.value })} />
                      </Field>
                      <Field label="Style">
                        <select value={cta.style} onChange={(event) => updateArrayItem(['hero', 'ctas'], index, { ...cta, style: event.target.value })} className="w-full rounded-2xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-500">
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="ghost">Ghost</option>
                        </select>
                      </Field>
                      <Field label="Icon">
                        <select value={cta.icon} onChange={(event) => updateArrayItem(['hero', 'ctas'], index, { ...cta, icon: event.target.value })} className="w-full rounded-2xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-500">
                          <option value="linkedin">LinkedIn</option>
                          <option value="github">GitHub</option>
                          <option value="mail">Mail</option>
                          <option value="external">External</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        )
      case 'About':
        return (
          <div className="space-y-6">
            <AdminCard title="About intro" description="Keep the message recruiter-friendly, but edit all public text here.">
              <div className="grid gap-4">
                <Field label="Eyebrow">
                  <TextInput value={draft.about.eyebrow} onChange={(event) => updatePath(['about', 'eyebrow'], event.target.value)} />
                </Field>
                <Field label="Title">
                  <TextInput value={draft.about.title} onChange={(event) => updatePath(['about', 'title'], event.target.value)} />
                </Field>
                <Field label="Description">
                  <TextArea rows={4} value={draft.about.description} onChange={(event) => updatePath(['about', 'description'], event.target.value)} />
                </Field>
              </div>
            </AdminCard>
            <AdminCard title="Why me cards" actions={<ActionButton type="button" onClick={() => addItem(['whyMe'], { title: 'New card', description: '', tag: 'Value', accent: 'from-sky-500 to-blue-600' })}><Plus size={14} /> Add card</ActionButton>}>
              <div className="space-y-4">
                {draft.whyMe.map((card, index) => (
                  <div key={`${card.title}-${index}`} className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-white">Card {index + 1}</p>
                      <ItemToolbar onMoveUp={() => moveItem(['whyMe'], index, -1)} onMoveDown={() => moveItem(['whyMe'], index, 1)} onDelete={() => removeItem(['whyMe'], index)} disableUp={index === 0} disableDown={index === draft.whyMe.length - 1} />
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="Tag"><TextInput value={card.tag} onChange={(event) => updateArrayItem(['whyMe'], index, { ...card, tag: event.target.value })} /></Field>
                      <Field label="Gradient classes"><TextInput value={card.accent} onChange={(event) => updateArrayItem(['whyMe'], index, { ...card, accent: event.target.value })} /></Field>
                      <Field label="Title" ><TextInput value={card.title} onChange={(event) => updateArrayItem(['whyMe'], index, { ...card, title: event.target.value })} /></Field>
                      <div className="lg:col-span-2"><Field label="Description"><TextArea rows={4} value={card.description} onChange={(event) => updateArrayItem(['whyMe'], index, { ...card, description: event.target.value })} /></Field></div>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        )
      case 'Skills':
        return (
          <div className="space-y-6">
            <AdminCard title="Skills list"><StringListEditor items={draft.skills} onChange={(nextItems) => updatePath(['skills'], nextItems)} addLabel="Add skill" /></AdminCard>
            <AdminCard title="Languages"><StringListEditor items={draft.languages} onChange={(nextItems) => updatePath(['languages'], nextItems)} addLabel="Add language" /></AdminCard>
            <AdminCard title="Impact metrics" actions={<ActionButton type="button" onClick={() => addItem(['metrics'], { value: '0', unit: 'new metric', description: 'metric description' })}><Plus size={14} /> Add metric</ActionButton>}>
              <div className="space-y-4">
                {draft.metrics.map((metric, index) => (
                  <div key={`${metric.unit}-${index}`} className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-white">Metric {index + 1}</p>
                      <ItemToolbar onMoveUp={() => moveItem(['metrics'], index, -1)} onMoveDown={() => moveItem(['metrics'], index, 1)} onDelete={() => removeItem(['metrics'], index)} disableUp={index === 0} disableDown={index === draft.metrics.length - 1} />
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <Field label="Value"><TextInput value={metric.value} onChange={(event) => updateArrayItem(['metrics'], index, { ...metric, value: event.target.value })} /></Field>
                      <Field label="Unit"><TextInput value={metric.unit} onChange={(event) => updateArrayItem(['metrics'], index, { ...metric, unit: event.target.value })} /></Field>
                      <Field label="Description"><TextInput value={metric.description} onChange={(event) => updateArrayItem(['metrics'], index, { ...metric, description: event.target.value })} /></Field>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        )
      case 'Experience':
        return (
          <AdminCard title="Experience cards" description="Add, reorder, and upload company visuals if you want them used publicly." actions={<ActionButton type="button" onClick={() => addItem(['experience'], { role: 'New role', company: 'Company', period: 'Date range', accent: 'from-sky-500/20 to-blue-600/10', glowColor: 'rgba(56,189,248,0.15)', points: ['New responsibility'], logoUrl: '' })}><Plus size={14} /> Add experience</ActionButton>}>
            <div className="space-y-5">
              {draft.experience.map((item, index) => (
                <div key={`${item.company}-${index}`} className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">Experience {index + 1}</p>
                    <ItemToolbar onMoveUp={() => moveItem(['experience'], index, -1)} onMoveDown={() => moveItem(['experience'], index, 1)} onDelete={() => removeItem(['experience'], index)} disableUp={index === 0} disableDown={index === draft.experience.length - 1} />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Role"><TextInput value={item.role} onChange={(event) => updateArrayItem(['experience'], index, { ...item, role: event.target.value })} /></Field>
                    <Field label="Company"><TextInput value={item.company} onChange={(event) => updateArrayItem(['experience'], index, { ...item, company: event.target.value })} /></Field>
                    <Field label="Date range"><TextInput value={item.period} onChange={(event) => updateArrayItem(['experience'], index, { ...item, period: event.target.value })} /></Field>
                    <Field label="Gradient classes"><TextInput value={item.accent} onChange={(event) => updateArrayItem(['experience'], index, { ...item, accent: event.target.value })} /></Field>
                    <div className="lg:col-span-2">
                      <UploadField label="Company image / logo" previewUrl={item.logoUrl} folder={`experience/${index + 1}`} onUploaded={(url) => updateArrayItem(['experience'], index, { ...item, logoUrl: url })} />
                    </div>
                    <div className="lg:col-span-2">
                      <Field label="Bullets">
                        <StringListEditor items={item.points} onChange={(nextItems) => updateArrayItem(['experience'], index, { ...item, points: nextItems })} addLabel="Add bullet" />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        )
      case 'Projects':
        return (
          <AdminCard title="Project cards" description="Edit copy, links, technologies, and real project screenshots." actions={<ActionButton type="button" onClick={() => addItem(['projects'], { title: 'New project', description: '', tech: [], value: '', gradient: 'from-sky-500/30 via-blue-600/20 to-transparent', icon: '⚡', imageUrl: '', primaryLink: '#', primaryLinkLabel: 'View project', secondaryLink: '#contact', secondaryLinkLabel: 'Request walkthrough' })}><Plus size={14} /> Add project</ActionButton>}>
            <div className="space-y-5">
              {draft.projects.map((project, index) => (
                <div key={`${project.title}-${index}`} className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">Project {index + 1}</p>
                    <ItemToolbar onMoveUp={() => moveItem(['projects'], index, -1)} onMoveDown={() => moveItem(['projects'], index, 1)} onDelete={() => removeItem(['projects'], index)} disableUp={index === 0} disableDown={index === draft.projects.length - 1} />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Title"><TextInput value={project.title} onChange={(event) => updateArrayItem(['projects'], index, { ...project, title: event.target.value })} /></Field>
                    <Field label="Emoji / icon"><TextInput value={project.icon} onChange={(event) => updateArrayItem(['projects'], index, { ...project, icon: event.target.value })} /></Field>
                    <div className="lg:col-span-2"><Field label="Description"><TextArea rows={4} value={project.description} onChange={(event) => updateArrayItem(['projects'], index, { ...project, description: event.target.value })} /></Field></div>
                    <div className="lg:col-span-2"><Field label="Value / impact"><TextArea rows={3} value={project.value} onChange={(event) => updateArrayItem(['projects'], index, { ...project, value: event.target.value })} /></Field></div>
                    <Field label="Gradient classes"><TextInput value={project.gradient} onChange={(event) => updateArrayItem(['projects'], index, { ...project, gradient: event.target.value })} /></Field>
                    <Field label="Primary link"><TextInput value={project.primaryLink} onChange={(event) => updateArrayItem(['projects'], index, { ...project, primaryLink: event.target.value })} /></Field>
                    <Field label="Primary link label"><TextInput value={project.primaryLinkLabel} onChange={(event) => updateArrayItem(['projects'], index, { ...project, primaryLinkLabel: event.target.value })} /></Field>
                    <Field label="Secondary link"><TextInput value={project.secondaryLink} onChange={(event) => updateArrayItem(['projects'], index, { ...project, secondaryLink: event.target.value })} /></Field>
                    <Field label="Secondary link label"><TextInput value={project.secondaryLinkLabel} onChange={(event) => updateArrayItem(['projects'], index, { ...project, secondaryLinkLabel: event.target.value })} /></Field>
                    <div className="lg:col-span-2">
                      <Field label="Technologies"><StringListEditor items={project.tech} onChange={(nextItems) => updateArrayItem(['projects'], index, { ...project, tech: nextItems })} addLabel="Add technology" /></Field>
                    </div>
                    <div className="lg:col-span-2">
                      <UploadField label="Project screenshot / image" previewUrl={project.imageUrl} folder={`projects/${index + 1}`} onUploaded={(url) => updateArrayItem(['projects'], index, { ...project, imageUrl: url })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        )
      case 'Case Studies':
        return (
          <AdminCard title="Case studies" description="Manage problem/action/result stories and ordering." actions={<ActionButton type="button" onClick={() => addItem(['caseStudies'], { number: String(draft.caseStudies.length + 1).padStart(2, '0'), title: 'New case study', problem: '', action: '', result: '', accent: 'text-sky-400', border: 'border-sky-500/20' })}><Plus size={14} /> Add case study</ActionButton>}>
            <div className="space-y-5">
              {draft.caseStudies.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">Case study {index + 1}</p>
                    <ItemToolbar onMoveUp={() => moveItem(['caseStudies'], index, -1)} onMoveDown={() => moveItem(['caseStudies'], index, 1)} onDelete={() => removeItem(['caseStudies'], index)} disableUp={index === 0} disableDown={index === draft.caseStudies.length - 1} />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Number"><TextInput value={item.number} onChange={(event) => updateArrayItem(['caseStudies'], index, { ...item, number: event.target.value })} /></Field>
                    <Field label="Title"><TextInput value={item.title} onChange={(event) => updateArrayItem(['caseStudies'], index, { ...item, title: event.target.value })} /></Field>
                    <Field label="Accent class"><TextInput value={item.accent} onChange={(event) => updateArrayItem(['caseStudies'], index, { ...item, accent: event.target.value })} /></Field>
                    <Field label="Border class"><TextInput value={item.border} onChange={(event) => updateArrayItem(['caseStudies'], index, { ...item, border: event.target.value })} /></Field>
                    <div className="lg:col-span-2"><Field label="Problem"><TextArea rows={3} value={item.problem} onChange={(event) => updateArrayItem(['caseStudies'], index, { ...item, problem: event.target.value })} /></Field></div>
                    <div className="lg:col-span-2"><Field label="Action"><TextArea rows={3} value={item.action} onChange={(event) => updateArrayItem(['caseStudies'], index, { ...item, action: event.target.value })} /></Field></div>
                    <div className="lg:col-span-2"><Field label="Result"><TextArea rows={3} value={item.result} onChange={(event) => updateArrayItem(['caseStudies'], index, { ...item, result: event.target.value })} /></Field></div>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        )
      case 'Contact':
        return (
          <div className="space-y-6">
            <AdminCard title="Contact section copy">
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Title"><TextInput value={draft.contact.title} onChange={(event) => updatePath(['contact', 'title'], event.target.value)} /></Field>
                <Field label="Location"><TextInput value={draft.contact.location} onChange={(event) => updatePath(['contact', 'location'], event.target.value)} /></Field>
                <div className="lg:col-span-2"><Field label="Description"><TextArea rows={4} value={draft.contact.description} onChange={(event) => updatePath(['contact', 'description'], event.target.value)} /></Field></div>
                <Field label="Email"><TextInput value={draft.contact.email} onChange={(event) => updatePath(['contact', 'email'], event.target.value)} /></Field>
                <Field label="Phone"><TextInput value={draft.contact.phone} onChange={(event) => updatePath(['contact', 'phone'], event.target.value)} /></Field>
                <Field label="Primary CTA label"><TextInput value={draft.contact.ctaPrimaryLabel} onChange={(event) => updatePath(['contact', 'ctaPrimaryLabel'], event.target.value)} /></Field>
                <Field label="Primary CTA URL"><TextInput value={draft.contact.ctaPrimaryUrl} onChange={(event) => updatePath(['contact', 'ctaPrimaryUrl'], event.target.value)} /></Field>
                <Field label="Secondary CTA label"><TextInput value={draft.contact.ctaSecondaryLabel} onChange={(event) => updatePath(['contact', 'ctaSecondaryLabel'], event.target.value)} /></Field>
                <Field label="Secondary CTA URL"><TextInput value={draft.contact.ctaSecondaryUrl} onChange={(event) => updatePath(['contact', 'ctaSecondaryUrl'], event.target.value)} /></Field>
              </div>
            </AdminCard>
            <AdminCard title="Social links" actions={<ActionButton type="button" onClick={() => addItem(['contact', 'socials'], { label: 'New social', value: '', url: '', icon: 'external' })}><Plus size={14} /> Add social</ActionButton>}>
              <div className="space-y-4">
                {draft.contact.socials.map((social, index) => (
                  <div key={`${social.label}-${index}`} className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">Social {index + 1}</p>
                      <ItemToolbar onMoveUp={() => moveItem(['contact', 'socials'], index, -1)} onMoveDown={() => moveItem(['contact', 'socials'], index, 1)} onDelete={() => removeItem(['contact', 'socials'], index)} disableUp={index === 0} disableDown={index === draft.contact.socials.length - 1} />
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <Field label="Label"><TextInput value={social.label} onChange={(event) => updateArrayItem(['contact', 'socials'], index, { ...social, label: event.target.value })} /></Field>
                      <Field label="Display value"><TextInput value={social.value} onChange={(event) => updateArrayItem(['contact', 'socials'], index, { ...social, value: event.target.value })} /></Field>
                      <Field label="URL"><TextInput value={social.url} onChange={(event) => updateArrayItem(['contact', 'socials'], index, { ...social, url: event.target.value })} /></Field>
                      <Field label="Icon">
                        <select value={social.icon || 'external'} onChange={(event) => updateArrayItem(['contact', 'socials'], index, { ...social, icon: event.target.value })} className="w-full rounded-2xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-500">
                          <option value="linkedin">LinkedIn</option>
                          <option value="github">GitHub</option>
                          <option value="external">External</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        )
      case 'Settings':
        return (
          <div className="space-y-6">
            <AdminCard title="SEO and footer">
              <div className="grid gap-4">
                <Field label="SEO title"><TextInput value={draft.settings.seoTitle} onChange={(event) => updatePath(['settings', 'seoTitle'], event.target.value)} /></Field>
                <Field label="SEO description"><TextArea rows={4} value={draft.settings.seoDescription} onChange={(event) => updatePath(['settings', 'seoDescription'], event.target.value)} /></Field>
                <Field label="Footer text"><TextInput value={draft.settings.footerText} onChange={(event) => updatePath(['settings', 'footerText'], event.target.value)} /></Field>
              </div>
            </AdminCard>
            <AdminCard title="Navigation labels" actions={<ActionButton type="button" onClick={() => addItem(['navLinks'], { id: 'new-section', label: 'New Section' })}><Plus size={14} /> Add nav item</ActionButton>}>
              <div className="space-y-4">
                {draft.navLinks.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">Nav item {index + 1}</p>
                      <ItemToolbar onMoveUp={() => moveItem(['navLinks'], index, -1)} onMoveDown={() => moveItem(['navLinks'], index, 1)} onDelete={() => removeItem(['navLinks'], index)} disableUp={index === 0} disableDown={index === draft.navLinks.length - 1} />
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="Section id"><TextInput value={item.id} onChange={(event) => updateArrayItem(['navLinks'], index, { ...item, id: event.target.value })} /></Field>
                      <Field label="Label"><TextInput value={item.label} onChange={(event) => updateArrayItem(['navLinks'], index, { ...item, label: event.target.value })} /></Field>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
            <AdminCard title="Section visibility" description="Hide sections without deleting their content.">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(draft.settings.visibility).map(([key, value]) => (
                  <button key={key} type="button" onClick={() => updatePath(['settings', 'visibility', key], !value)} className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-slate-950/60 px-4 py-3 text-left text-sm text-white transition hover:border-sky-500/30">
                    <span className="capitalize">{key}</span>
                    <span className={`inline-flex items-center gap-2 text-xs ${value ? 'text-emerald-300' : 'text-slate-500'}`}>
                      {value ? <Eye size={14} /> : <EyeOff size={14} />} {value ? 'Visible' : 'Hidden'}
                    </span>
                  </button>
                ))}
              </div>
            </AdminCard>
          </div>
        )
      default:
        return null
    }
  }, [activeTab, draft])

  return (
    <div className="min-h-screen bg-[#05080f] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Private dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Site content & media admin</h1>
            <p className="mt-2 text-sm text-slate-400">Signed in as {user?.email}. Edit every existing public section from one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton type="button" onClick={handleInitialize} disabled={initializing}>
              {initializing ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}
              Initialize content
            </ActionButton>
            <ActionButton type="button" variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving…' : 'Save changes'}
            </ActionButton>
            <ActionButton type="button" onClick={signOut}>
              <LogOut size={14} /> Sign out
            </ActionButton>
          </div>
        </div>

        {status ? <p className="mb-4 text-sm text-sky-200">{status}</p> : null}

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-3 backdrop-blur-xl">
            <nav className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-sky-500/20 to-violet-500/20 text-white'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">{tabContent}</div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
