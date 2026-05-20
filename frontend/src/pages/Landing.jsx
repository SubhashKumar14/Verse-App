import { Link } from 'react-router-dom'
import { pageBackground, primaryBtn, ghostBtn, bodyText, mutedText, badge } from '../styles/common'
import logo from '../assets/logo.png'

const Landing = () => {
  return (
    <div className={`${pageBackground} min-h-screen`}>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="max-w-6xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VerseLy" className="h-8 w-8 object-contain" />
          <span className="text-[16px] font-semibold tracking-tight text-[var(--text)]">
            VerseLy
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-200"
          >
            Sign in
          </Link>
          <Link to="/register" className={`${primaryBtn} px-5 py-2`}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        <span className={badge}>A calmer social space</span>
        <h1 className="mt-6 text-[2.75rem] sm:text-[3.75rem] font-bold tracking-tight text-[var(--text)] leading-[1.1]">
          Write without noise.
        </h1>
        <p className={`${bodyText} mt-6 max-w-xl mx-auto text-[var(--muted)] text-lg leading-relaxed`}>
          A calmer place for thoughtful updates. For people who build, write, and think.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className={`${primaryBtn} px-8 py-3 text-base`}>
            Start writing
          </Link>
          <a
            href="#philosophy"
            className={`${ghostBtn} px-6 py-3 text-base`}
          >
            Learn more ↓
          </a>
        </div>
      </section>

      {/* ── Product Mock ────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 sm:px-8 pb-24">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold text-[var(--text)]">Today</p>
            <span className="text-xs text-[var(--muted)]">3 updates</span>
          </div>
          <div className="space-y-0">
            {[
              { name: 'Asha', time: '2m', text: 'Drafting a small story about the morning rain.' },
              { name: 'Milan', time: '18m', text: 'A single idea, shared before the day gets loud.' },
              { name: 'Priya', time: '1h', text: 'Reading through new voices and taking notes.' },
            ].map((item, index) => (
              <div key={item.name} className={`py-5 ${index < 2 ? 'border-b border-[var(--border)]' : ''}`}>
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-xs font-semibold text-[var(--muted)] shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-[var(--text)]">{item.name}</span>
                      <span className="text-[var(--muted)] text-xs tabular-nums">{item.time}</span>
                    </div>
                    <p className="text-[15px] text-[var(--text)] leading-relaxed mt-0.5">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy ──────────────────────────────────── */}
      <section id="philosophy" className="max-w-5xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
        <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold tracking-tight text-[var(--text)] text-center leading-tight">
          Why VerseLy exists
        </h2>
        <p className={`${mutedText} text-center mt-3 max-w-lg mx-auto text-[15px]`}>
          Three principles that shape everything we build.
        </p>

        <div className="grid sm:grid-cols-3 gap-8 sm:gap-12 mt-14">
          {[
            {
              title: 'Writing first',
              desc: 'The composer is never buried. Writing should feel natural and immediate.',
            },
            {
              title: 'Calm is a feature',
              desc: 'Visual noise is a design failure. Every element earns its place.',
            },
            {
              title: 'Your words, your space',
              desc: 'No algorithms, no engagement bait. Just thoughtful updates from people you follow.',
            },
          ].map((principle) => (
            <div key={principle.title} className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-[var(--text)] tracking-tight">
                {principle.title}
              </h3>
              <p className="text-[14px] text-[var(--muted)] mt-2 leading-relaxed">
                {principle.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Archives Feature ────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
        <span className={badge}>Archives</span>
        <h2 className="mt-5 text-[1.75rem] sm:text-[2.25rem] font-bold tracking-tight text-[var(--text)] leading-tight">
          Never lose a thought
        </h2>
        <p className="text-[15px] text-[var(--muted)] mt-4 max-w-lg mx-auto leading-relaxed">
          Every post you remove goes to your personal archive — a digital memory vault.
          Nothing is truly gone. Restore any thought, anytime, with a single tap.
        </p>
      </section>

      {/* ── Final CTA ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center border-t border-[var(--border)]">
        <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold tracking-tight text-[var(--text)] leading-tight">
          Ready to write?
        </h2>
        <p className="text-[15px] text-[var(--muted)] mt-3 max-w-md mx-auto leading-relaxed">
          Join a community that values substance over noise.
        </p>
        <div className="mt-8">
          <Link to="/register" className={`${primaryBtn} px-8 py-3 text-base`}>
            Create your account
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="py-10 text-center">
        <p className="text-xs text-[var(--muted)]">
          © 2025 VerseLy. A calmer social space.
        </p>
      </footer>
    </div>
  )
}

export default Landing
