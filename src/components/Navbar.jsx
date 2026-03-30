import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Menu, X } from "lucide-react"

function Navbar({ navItems = [] }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#05080f]/90 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="text-sm font-semibold tracking-tight text-white">
          <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">Roman</span>{" "}
          Stavinsky
        </a>
        <ul className="hidden items-center gap-7 lg:flex">
          {navItems.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} className="text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-white">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <a href="#contact" className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition-all duration-200 hover:shadow-sky-500/40 hover:brightness-110 sm:inline-flex">
            <Mail size={14} /> Let&apos;s Connect
          </a>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="border-t border-white/[0.06] bg-[#05080f]/95 backdrop-blur-2xl lg:hidden">
            <ul className="flex flex-col gap-1 px-4 py-4">
              {navItems.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} onClick={() => setMobileOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#contact" onClick={() => setMobileOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-violet-600 py-3 text-sm font-medium text-white">
                  <Mail size={14} /> Let&apos;s Connect
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
