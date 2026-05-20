// src/styles/common.js
// Theme: Calm, typographic product UI with an indigo accent.

// ─── Layout ───────────────────────────────────────────
export const pageBackground =
  "bg-[color:var(--bg)] text-[color:var(--text)] min-h-screen transition-colors duration-200"
export const pageWrapper = "max-w-2xl mx-auto px-4 sm:px-6 py-8"
export const wideWrapper = "max-w-6xl mx-auto px-4 sm:px-6 py-10"
export const section = "mb-10"

// ─── Cards ────────────────────────────────────────────
export const cardClass =
  "bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-5 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]"
export const cardHover =
  "bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-5 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] hover:border-[color:var(--border-strong)] hover:shadow-md transition-all duration-200 cursor-pointer"

// ─── Typography ───────────────────────────────────────
export const pageTitleClass = "text-2xl sm:text-[1.7rem] font-semibold tracking-tight text-[color:var(--text)] mb-3"
export const headingClass = "text-lg font-semibold text-[color:var(--text)]"
export const subHeadingClass = "text-sm font-medium text-[color:var(--muted)]"
export const bodyText = "text-base text-[color:var(--text)] leading-relaxed"
export const mutedText = "text-sm text-[color:var(--muted)]"
export const linkClass =
  "text-[color:var(--accent)] hover:text-[color:var(--text)] font-medium transition-colors cursor-pointer"
export const accentText = "font-semibold text-[color:var(--accent)]"

// ─── Buttons ──────────────────────────────────────────
export const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--accent-ink)] px-5 py-2.5 text-sm font-medium shadow-sm transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed"
export const secondaryBtn =
  "inline-flex items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--text)] px-5 py-2.5 text-sm font-medium border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] transition disabled:opacity-50 disabled:cursor-not-allowed"
export const dangerBtn =
  "inline-flex items-center justify-center rounded-full bg-[color:color-mix(in_oklab,var(--danger)_14%,var(--surface))] text-[color:var(--danger)] px-4 py-2 text-sm font-medium border border-[color:color-mix(in_oklab,var(--danger)_32%,var(--border))] hover:brightness-95 transition"
export const ghostBtn =
  "inline-flex items-center justify-center rounded-full text-[color:var(--muted)] px-3 py-2 text-sm font-medium hover:text-[color:var(--text)] hover:bg-[color:var(--surface-2)] transition"
export const iconBtn =
  "p-2 rounded-full text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--surface-2)] transition"

// ─── Forms ────────────────────────────────────────────
export const formCard =
  "bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-7 max-w-sm mx-auto shadow-[0_1px_0_0_rgba(0,0,0,0.04)]"
export const formTitle = "text-xl font-semibold tracking-tight text-[color:var(--text)] text-center mb-6"
export const labelClass = "text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)] mb-1.5 block"
export const inputClass =
  "w-full bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl px-3.5 py-2.5 text-[color:var(--text)] placeholder-[color:var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:border-[color:var(--border-strong)] transition text-sm"
export const textareaClass =
  "w-full bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl px-3.5 py-2.5 text-[color:var(--text)] placeholder-[color:var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:border-[color:var(--border-strong)] transition resize-none text-sm"
export const formGroup = "mb-4"
export const submitBtn =
  "w-full inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--accent-ink)] font-medium py-2.5 text-sm shadow-sm transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
export const formError = "text-[color:var(--danger)] text-xs mt-1.5 font-medium"
export const formLink = "text-[color:var(--text)] hover:text-[color:var(--accent)] font-medium cursor-pointer"

// ─── Navbar ───────────────────────────────────────────
export const navbarClass =
  "bg-[color:var(--bg)] border-b border-[color:var(--border)] sticky top-0 z-50 backdrop-blur transition-colors duration-200"
export const navContainerClass = "max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3"
export const navBrandClass = "flex items-center gap-3 cursor-pointer"
export const navLogoClass = "h-8 w-8 object-contain"
export const navBrandText = "text-base font-semibold tracking-tight text-[color:var(--text)]"
export const navLinksClass = "flex items-center gap-1.5"
export const navLinkClass =
  "p-2 rounded-full text-[color:var(--muted)] hover:text-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] transition-colors duration-150 cursor-pointer"
export const navLinkActiveClass =
  "p-2 rounded-full text-[color:var(--accent)] bg-[color:var(--accent-soft)] cursor-pointer font-medium"
export const navSearchClass =
  "flex items-center bg-[color:var(--surface-2)] border border-[color:var(--border)] rounded-full px-3 py-1.5 gap-2 focus-within:border-[color:var(--border-strong)] transition-all duration-200 hidden sm:flex"
export const navSearchInput =
  "bg-transparent text-sm text-[color:var(--text)] placeholder-[color:var(--muted)] focus:outline-none w-40 lg:w-56"

// ─── Sidebar ──────────────────────────────────────────
export const sidebarClass = "hidden md:block w-64 shrink-0"
export const sidebarLink =
  "flex items-center gap-3 px-3 py-2 text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--surface-2)] rounded-lg transition-colors duration-150 cursor-pointer font-medium text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] outline-offset-2"
export const sidebarLinkActive =
  "flex items-center gap-3 px-3 py-2 text-[color:var(--text)] font-semibold text-[15px] rounded-lg bg-transparent transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] outline-offset-2"

// ─── Post (feed card) ─────────────────────────────────
// Borderless divider model: items separated by a bottom border, not boxed cards.
// This reads as editorial prose, not a SaaS card grid.
export const postCard =
  "bg-transparent border-b border-[color:var(--border)] py-4 px-1"
export const postAuthorRow = "flex items-center gap-2.5 mb-2.5"
export const postAvatar =
  "w-8 h-8 rounded-full bg-[color:var(--surface-2)] flex items-center justify-center text-[color:var(--muted)] font-semibold text-xs border border-[color:var(--border)] shrink-0"
export const postUsername = "font-medium text-[color:var(--text)] hover:text-[color:var(--accent)] cursor-pointer text-sm transition-colors duration-150"
export const postTime = "text-xs text-[color:var(--muted)]"
export const postContent = "text-[color:var(--text)] leading-relaxed mb-3 whitespace-pre-wrap text-[15px]"
export const postActions = "flex items-center gap-5 pt-2.5 border-t border-[color:var(--border)]"
export const postActionBtn =
  "flex items-center gap-1.5 text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors duration-150 cursor-pointer text-sm font-medium select-none"
export const postActionBtnActive =
  "flex items-center gap-1.5 text-[color:var(--danger)] transition-colors duration-150 cursor-pointer text-sm font-medium select-none"

// ─── Composer (distinct from feed cards) ──────────────
// Lighter surface, no border at rest — focus ring activates the edge.
export const composerCard =
  "bg-[color:var(--surface)] rounded-2xl px-4 pt-4 pb-3 border border-[color:var(--border)] mb-6"

// ─── Comments ─────────────────────────────────────────
export const commentCard = "flex gap-3 py-3 border-b border-[color:var(--border)] last:border-0"
export const commentAvatar =
  "w-7 h-7 rounded-full bg-[color:var(--surface-2)] flex items-center justify-center text-[color:var(--muted)] font-medium text-xs shrink-0 border border-[color:var(--border)]"
export const commentBody = "flex-1 min-w-0"
export const commentUsername = "font-medium text-sm text-[color:var(--text)]"
export const commentText = "text-[14px] text-[color:var(--text)] mt-0.5 leading-snug"
export const commentTime = "text-xs text-[color:var(--muted)] mt-1"

// ─── User / Profile ───────────────────────────────────
export const profileHeader =
  "py-8 mb-4 border-b border-[color:var(--border)]"
export const profileAvatar =
  "w-20 h-20 rounded-full bg-[color:var(--surface-2)] flex items-center justify-center text-[color:var(--muted)] font-semibold text-3xl border border-[color:var(--border)] shrink-0"
export const profileName = "text-2xl font-bold tracking-tight text-[color:var(--text)] mt-4"
export const profileBio = "text-[15px] text-[color:var(--text)] mt-3 max-w-lg leading-relaxed"
export const profileStat = "cursor-pointer group flex items-baseline gap-1.5"
export const profileStatNumber =
  "text-sm font-semibold text-[color:var(--text)] group-hover:text-[color:var(--accent)] transition-colors duration-150 tabular-nums"
export const profileStatLabel = "text-sm text-[color:var(--muted)]"
export const userCard =
  "flex flex-row items-center gap-3 p-3 rounded-xl hover:bg-[color:var(--surface-2)] transition-colors duration-150 cursor-pointer border border-transparent hover:border-[color:var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
export const userAvatar =
  "w-10 h-10 rounded-full bg-[color:var(--surface-2)] flex items-center justify-center text-[color:var(--muted)] font-medium text-sm shrink-0 border border-[color:var(--border)]"

// ─── Follow Button ────────────────────────────────────
export const followBtn =
  "px-4 py-1.5 rounded-full font-semibold text-xs transition-colors duration-150 cursor-pointer"
export const followBtnFollow =
  "bg-[color:var(--accent)] text-[color:var(--accent-ink)] hover:brightness-95"
export const followBtnUnfollow =
  "bg-[color:var(--surface)] text-[color:var(--text)] border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--danger)]"

// ─── Tabs ─────────────────────────────────────────────
export const tabsContainer = "flex border-b border-[color:var(--border)] mb-6 gap-6"
export const tab =
  "pb-3 text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--text)] border-b-2 border-transparent transition-colors cursor-pointer"
export const tabActive =
  "pb-3 text-sm font-semibold text-[color:var(--accent)] border-b-2 border-[color:var(--accent)] cursor-pointer"

// ─── Feedback ─────────────────────────────────────────
export const errorClass =
  "bg-[color:var(--danger-soft)] text-[color:var(--danger)] border border-[color:color-mix(in_oklab,var(--danger)_28%,var(--border))] rounded-xl p-3 text-sm text-center"
export const successClass =
  "bg-[color:var(--success-soft)] text-[color:var(--success)] border border-[color:color-mix(in_oklab,var(--success)_28%,var(--border))] rounded-xl p-3 text-sm text-center"
export const loadingClass = "flex items-center justify-center py-10"
export const emptyStateClass = "text-center py-16 text-[color:var(--muted)]"
export const emptyStateIcon = "text-2xl mb-3 opacity-40"
export const emptyStateText = "text-sm font-medium text-[color:var(--muted)]"

// ─── Archives ─────────────────────────────────────────
export const archiveCard =
  "bg-transparent border-b border-[color:var(--border)] py-4 px-1 group"
export const restoreBtn =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--surface-2)] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"

// ─── Misc ─────────────────────────────────────────────
export const divider = "h-px bg-[color:var(--border)] my-4"
export const badge =
  "text-[11px] font-medium px-2 py-0.5 rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent)] border border-[color:var(--accent-border)]"
export const overlay =
  "fixed inset-0 bg-[color:color-mix(in_oklab,var(--bg)_55%,transparent)] backdrop-blur-sm z-40"
export const modal =
  "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-6 z-50 w-full max-w-sm shadow-xl"
