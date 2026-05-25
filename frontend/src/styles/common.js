// src/styles/common.js
// VerseLy — Coffee Cream Design System
// "Quiet interface. Loud thoughts."

// ─── Layout ───────────────────────────────────────────
export const pageBackground =
  "bg-[var(--bg)] text-[var(--text)] min-h-screen transition-colors duration-200"
export const pageWrapper = "max-w-2xl mx-auto px-5 sm:px-6 py-10"
export const wideWrapper = "max-w-6xl mx-auto px-5 sm:px-8 py-12"
export const section = "mb-12"

// ─── Cards ────────────────────────────────────────────
export const cardClass =
  "bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5"
export const cardHover =
  "bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--border-strong)] transition-all duration-200 cursor-pointer"

// ─── Typography ───────────────────────────────────────────
export const pageTitleClass = "text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-[var(--text)] leading-[1.15] mb-1 font-[family-name:var(--font-heading)]"
export const pageSubtitle = "text-[15px] text-[var(--muted)] leading-relaxed max-w-lg"
export const headingClass = "text-lg font-semibold text-[var(--text)] tracking-[-0.02em] font-[family-name:var(--font-heading)]"
export const subHeadingClass = "text-sm font-medium text-[var(--muted)]"
export const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] font-[family-name:var(--font-sans)]"
export const bodyText = "text-[15px] text-[var(--text)] leading-relaxed"
export const mutedText = "text-sm text-[var(--muted)]"
export const linkClass =
  "text-[var(--accent)] hover:text-[var(--accent-active)] font-medium transition-colors cursor-pointer"
export const accentText = "font-semibold text-[var(--accent)]"

// ─── Buttons ──────────────────────────────────────────
export const primaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-ink)] px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
export const secondaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--text)] px-5 py-2.5 text-sm font-medium border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
export const dangerBtn =
  "inline-flex items-center justify-center rounded-lg bg-[var(--danger-soft)] text-[var(--danger)] px-4 py-2 text-sm font-medium border border-[color:color-mix(in_srgb,var(--danger)_20%,var(--border))] hover:opacity-90 transition-all duration-200 cursor-pointer"
export const ghostBtn =
  "inline-flex items-center justify-center rounded-lg text-[var(--muted)] px-3 py-2 text-sm font-medium hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-200 cursor-pointer"
export const iconBtn =
  "p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-200 cursor-pointer"

// ─── Forms ────────────────────────────────────────────
export const formCard =
  "bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 max-w-sm mx-auto"
export const formTitle = "text-xl font-semibold tracking-tight text-[var(--text)] text-center mb-6"
export const labelClass = "text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)] mb-2 block"
export const inputClass =
  "w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text)] placeholder-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-[var(--border-strong)] transition-all duration-200 text-sm"
export const textareaClass =
  "w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text)] placeholder-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-[var(--border-strong)] transition-all duration-200 resize-none text-sm"
export const formGroup = "mb-5"
export const submitBtn =
  "w-full inline-flex items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-ink)] font-semibold py-3 text-sm transition-all duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-40 disabled:cursor-not-allowed mt-2 cursor-pointer"
export const formError = "text-[var(--danger)] text-xs mt-1.5 font-medium"
export const formLink = "text-[var(--accent)] hover:text-[var(--accent-active)] font-medium cursor-pointer transition-colors"

// ─── Navbar (mobile-only slim bar) ─────────────────────
export const navbarClass =
  "bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-50 md:hidden"
export const navContainerClass = "px-4 h-14 flex items-center justify-between"
export const navBrandClass = "flex items-center gap-2.5 cursor-pointer"
export const navLogoClass = "h-7 w-7 object-contain"
export const navBrandText = "text-[15px] font-semibold tracking-tight text-[var(--text)]"
export const navLinksClass = "flex items-center gap-1"
export const navLinkClass =
  "p-2 rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer"
export const navLinkActiveClass =
  "p-2 rounded-lg text-[var(--accent)] bg-[var(--accent-soft)] cursor-pointer"
export const navSearchClass =
  "flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-1.5 gap-2 focus-within:border-[var(--border-strong)] transition-all duration-200 hidden sm:flex"
export const navSearchInput =
  "bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none w-40 lg:w-56"

// ─── Sidebar (desktop left rail) ──────────────────────
export const sidebarClass = "hidden md:flex flex-col h-full py-2"
export const sidebarLink =
  "flex items-center gap-3 px-3 py-2.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-all duration-200 cursor-pointer font-medium text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] outline-offset-2"
export const sidebarLinkActive =
  "flex items-center gap-3 px-3 py-2.5 text-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[14px] rounded-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] outline-offset-2"

// ─── Post (editorial feed item) ───────────────────────
export const postCard =
  "bg-transparent border-b border-[var(--border)] py-5 px-1"
export const postAuthorRow = "flex items-center gap-3 mb-3"
export const postAvatar =
  "w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] font-semibold text-sm border border-[var(--border)] shrink-0"
export const postUsername = "font-semibold text-[var(--text)] hover:text-[var(--accent)] cursor-pointer text-[14px] transition-colors duration-200"
export const postTime = "text-xs text-[var(--muted)] tabular-nums"
export const postContent = "text-[var(--text)] leading-[1.7] whitespace-pre-wrap text-[16px]"
export const postActions = "flex items-center gap-6 pt-3 mt-1"
export const postActionBtn =
  "flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-200 cursor-pointer text-[13px] font-medium select-none"
export const postActionBtnActive =
  "flex items-center gap-1.5 text-[var(--danger)] transition-colors duration-200 cursor-pointer text-[13px] font-medium select-none"

// ─── Composer ─────────────────────────────────────────
export const composerCard =
  "bg-[var(--surface)] rounded-xl px-5 pt-5 pb-4 border border-[var(--border)] mb-8"

// ─── Comments ─────────────────────────────────────────
export const commentCard = "flex gap-3 py-3.5 border-b border-[var(--border)] last:border-0"
export const commentAvatar =
  "w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] font-medium text-xs shrink-0 border border-[var(--border)]"
export const commentBody = "flex-1 min-w-0"
export const commentUsername = "font-semibold text-sm text-[var(--text)]"
export const commentText = "text-[14px] text-[var(--text)] mt-0.5 leading-relaxed"
export const commentTime = "text-xs text-[var(--muted)] mt-1 tabular-nums"

// ─── User / Profile ───────────────────────────────────
export const profileHeader =
  "py-10 mb-6 border-b border-[var(--border)]"
export const profileAvatar =
  "w-24 h-24 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] font-semibold text-4xl border-2 border-[var(--border)] shrink-0"
export const profileName = "text-[1.75rem] font-bold tracking-tight text-[var(--text)] mt-4"
export const profileBio = "text-[15px] text-[var(--muted)] mt-3 max-w-lg leading-relaxed"
export const profileStat = "cursor-pointer group flex items-baseline gap-1.5"
export const profileStatNumber =
  "text-base font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200 tabular-nums"
export const profileStatLabel = "text-sm text-[var(--muted)]"
export const userCard =
  "flex flex-row items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--surface-2)] transition-all duration-200 cursor-pointer border border-transparent hover:border-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
export const userAvatar =
  "w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] font-semibold text-sm shrink-0 border border-[var(--border)]"

// ─── Follow Button ────────────────────────────────────
export const followBtn =
  "px-4 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 cursor-pointer"
export const followBtnFollow =
  "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
export const followBtnUnfollow =
  "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--danger)]"

// ─── Tabs ─────────────────────────────────────────────
export const tabsContainer = "flex border-b border-[var(--border)] mb-8 gap-8"
export const tab =
  "pb-3 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] border-b-2 border-transparent transition-all duration-200 cursor-pointer"
export const tabActive =
  "pb-3 text-sm font-semibold text-[var(--accent)] border-b-2 border-[var(--accent)] cursor-pointer"

// ─── Feedback ─────────────────────────────────────────
export const errorClass =
  "bg-[var(--danger-soft)] text-[var(--danger)] border border-[color:color-mix(in_srgb,var(--danger)_20%,var(--border))] rounded-xl p-3 text-sm text-center"
export const successClass =
  "bg-[var(--success-soft)] text-[var(--success)] border border-[color:color-mix(in_srgb,var(--success)_20%,var(--border))] rounded-xl p-3 text-sm text-center"
export const loadingClass = "flex items-center justify-center py-12"
export const emptyStateClass = "text-center py-20 text-[var(--muted)]"
export const emptyStateIcon = "text-3xl mb-4 text-[var(--accent)] opacity-50"
export const emptyStateText = "text-[15px] font-medium text-[var(--muted)] leading-relaxed"

// ─── Archives ─────────────────────────────────────────
export const archiveCard =
  "bg-[var(--surface)] border border-[var(--border)] rounded-xl py-5 px-5 mb-3 group"
export const restoreBtn =
  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--info)] bg-[var(--info-soft)] border border-[color:color-mix(in_srgb,var(--info)_20%,var(--border))] hover:opacity-90 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"

// ─── Misc ─────────────────────────────────────────────
export const divider = "h-px bg-[var(--border)] my-6"
export const badge =
  "text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]"
export const topicPill =
  "text-[12px] font-medium px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-all duration-200 cursor-pointer"
export const overlay =
  "fixed inset-0 bg-neutral-950/40 dark:bg-black/60 backdrop-blur-sm z-40"
export const modal =
  "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 z-50 w-full max-w-sm shadow-lg"
