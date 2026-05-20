import { Link } from 'react-router-dom'
import { pageBackground, primaryBtn, secondaryBtn, bodyText, mutedText, badge } from '../styles/common'
import logo from '../assets/logo.png'

const Landing = () => {
  return (
    <div className={`${pageBackground} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-6 py-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center">
              <img src={logo} alt="VerseLy" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className={`${mutedText} font-medium`}>VerseLy</p>
              <p className="text-xs text-[color:var(--muted)]">A calmer social space for writing.</p>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[color:var(--text)] leading-tight">
            Write short thoughts, follow the people you care about, and keep the feed focused.
          </h1>

          <p className={`${bodyText} mt-5 max-w-xl`}>
            VerseLy keeps the interface quiet so your words stand out. Post fast, attach a photo when it matters, and
            move through updates without noise.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/register" className={`${primaryBtn} py-3 px-7 text-center`}>
              Create account
            </Link>
            <Link to="/login" className={`${secondaryBtn} py-3 px-7 text-center`}>
              Sign in
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className={badge}>Focused feed</span>
            <span className={badge}>Fast replies</span>
            <span className={badge}>Photo-friendly</span>
            <span className={badge}>Low noise</span>
          </div>
        </div>

        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-3xl p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-[color:var(--text)]">Today</p>
            <span className="text-xs text-[color:var(--muted)]">3 updates</span>
          </div>
          <div className="space-y-5">
            {[
              { name: 'Asha', time: '2m', text: 'Drafting a small story about the morning rain.' },
              { name: 'Milan', time: '18m', text: 'A single idea, shared before the day gets loud.' },
              { name: 'Priya', time: '1h', text: 'Reading through new voices and taking notes.' },
            ].map((item, index) => (
              <div key={item.name}>
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[color:var(--surface-2)] border border-[color:var(--border)] flex items-center justify-center text-xs font-semibold text-[color:var(--muted)]">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-[color:var(--text)]">{item.name}</span>
                      <span className="text-[color:var(--muted)]">{item.time}</span>
                    </div>
                    <p className="text-sm text-[color:var(--text)] leading-relaxed">{item.text}</p>
                  </div>
                </div>
                {index < 2 && <div className="h-px bg-[color:var(--border)] mt-5" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
