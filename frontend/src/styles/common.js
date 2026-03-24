// src/styles/common.js
// Theme: Clean & Minimal — High-end monochrome with subtle blue accents, crisp borders, no heavy gradients.

// ─── Layout ───────────────────────────────────────────
export const pageBackground = "bg-[#fcfcfc] dark:bg-[#0a0a0b] min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200"
export const pageWrapper = "max-w-2xl mx-auto px-4 py-8"
export const wideWrapper = "max-w-5xl mx-auto px-4 py-8"
export const section = "mb-10"

// ─── Cards ────────────────────────────────────────────
export const cardClass =
  "bg-white dark:bg-[#111113] border-y sm:border border-gray-200 dark:border-gray-800/60 sm:rounded-xl p-4 sm:p-5 shadow-sm"
export const cardHover =
  "bg-white dark:bg-[#111113] border-y sm:border border-gray-200 dark:border-gray-800/60 sm:rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 cursor-pointer"

// ─── Typography ───────────────────────────────────────
export const pageTitleClass = "text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-3"
export const headingClass = "text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
export const subHeadingClass = "text-base font-medium text-gray-800 dark:text-gray-200"
export const bodyText = "text-base text-gray-700 dark:text-gray-300 leading-relaxed"
export const mutedText = "text-sm text-gray-500 dark:text-gray-400"
export const linkClass = "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer"
export const gradientText = "font-semibold text-gray-900 dark:text-white" // Removed gradient, keeping semantic name for compatibility

// ─── Buttons ──────────────────────────────────────────
export const primaryBtn =
  "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-medium px-5 py-2 rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
export const secondaryBtn =
  "bg-white dark:bg-[#1a1a1c] text-gray-700 dark:text-gray-200 font-medium px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#222225] transition-colors duration-150 cursor-pointer shadow-sm text-sm"
export const dangerBtn =
  "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors duration-150 cursor-pointer text-sm"
export const ghostBtn =
  "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer text-sm"
export const iconBtn =
  "p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 cursor-pointer"

// ─── Forms ────────────────────────────────────────────
export const formCard = "bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800/80 rounded-2xl p-8 max-w-sm mx-auto shadow-sm"
export const formTitle = "text-xl font-bold tracking-tight text-gray-900 dark:text-white text-center mb-6"
export const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
export const inputClass =
  "w-full bg-gray-50 dark:bg-[#1a1a1c] border border-gray-300 dark:border-gray-700 rounded-lg px-3.5 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-shadow duration-150 text-sm"
export const textareaClass =
  "w-full bg-gray-50 dark:bg-[#1a1a1c] border border-gray-300 dark:border-gray-700 rounded-lg px-3.5 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-shadow duration-150 resize-none text-sm"
export const formGroup = "mb-4"
export const submitBtn =
  "w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-medium py-2.5 rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm mt-2"
export const formError = "text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium"
export const formLink = "text-gray-900 dark:text-white hover:underline font-medium cursor-pointer"

// ─── Navbar ───────────────────────────────────────────
export const navbarClass =
  "bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/80 sticky top-0 z-50 transition-colors duration-200"
export const navContainerClass = "max-w-5xl mx-auto px-4 h-14 flex items-center justify-between"
export const navBrandClass = "flex items-center gap-2 cursor-pointer"
export const navLogoClass = "h-7 w-7 object-contain opacity-90"
export const navBrandText = "text-lg font-bold tracking-tight text-gray-900 dark:text-white"
export const navLinksClass = "flex items-center gap-1.5"
export const navLinkClass = "p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
export const navLinkActiveClass = "p-2 rounded-md text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 cursor-pointer font-medium"
export const navSearchClass = "flex items-center bg-gray-100 dark:bg-[#1a1a1c] border border-transparent dark:border-gray-800 rounded-lg px-3 py-1.5 gap-2 focus-within:bg-white dark:focus-within:bg-[#1a1a1c] focus-within:border-gray-300 dark:focus-within:border-gray-600 focus-within:shadow-sm transition-all duration-200 hidden sm:flex"
export const navSearchInput = "bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-40 lg:w-56"

// ─── Sidebar ──────────────────────────────────────────
export const sidebarClass = "hidden md:block w-56 shrink-0"
export const sidebarLink = "flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1c] transition-colors duration-150 cursor-pointer font-medium text-sm"
export const sidebarLinkActive = "flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1a1a1c] font-semibold text-sm"

// ─── Post ─────────────────────────────────────────────
export const postCard =
  "bg-white dark:bg-[#111113] border-y sm:border-x sm:border border-gray-200 dark:border-gray-800/80 sm:rounded-xl p-4 sm:p-5 mb-0 sm:mb-4"
export const postAuthorRow = "flex items-center gap-2.5 mb-3"
export const postAvatar = "w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-sm border border-gray-200 dark:border-gray-700"
export const postUsername = "font-medium text-gray-900 dark:text-gray-100 hover:underline cursor-pointer text-sm"
export const postTime = "text-xs text-gray-500 dark:text-gray-500"
export const postContent = "text-gray-800 dark:text-gray-200 leading-relaxed mb-4 whitespace-pre-wrap text-[15px]"
export const postActions = "flex items-center gap-5 pt-3 border-t border-gray-100 dark:border-gray-800/80"
export const postActionBtn = "flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer text-sm font-medium"
export const postActionBtnActive = "flex items-center gap-1.5 text-red-500 dark:text-red-400 transition-colors cursor-pointer text-sm font-medium"

// ─── Comments ─────────────────────────────────────────
export const commentCard = "flex gap-3 py-3 border-b border-gray-100 dark:border-gray-800/50 last:border-0"
export const commentAvatar = "w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-xs shrink-0 border border-gray-200 dark:border-gray-700"
export const commentBody = "flex-1 min-w-0"
export const commentUsername = "font-medium text-sm text-gray-900 dark:text-gray-200"
export const commentText = "text-[14px] text-gray-700 dark:text-gray-300 mt-0.5 leading-snug"
export const commentTime = "text-xs text-gray-400 dark:text-gray-500 mt-1"

// ─── User / Profile ───────────────────────────────────
export const profileHeader = "bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800/80 rounded-xl p-6 mb-6"
export const profileAvatar = "w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-2xl border border-gray-200 dark:border-gray-700"
export const profileName = "text-xl font-bold tracking-tight text-gray-900 dark:text-white mt-4"
export const profileBio = "text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-sm leading-relaxed"
export const profileStat = "cursor-pointer group"
export const profileStatNumber = "text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
export const profileStatLabel = "text-xs text-gray-500 dark:text-gray-500"
export const userCard = "flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1c] transition-colors cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-800/60"
export const userAvatar = "w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm shrink-0 border border-gray-200 dark:border-gray-700"

// ─── Follow Button ────────────────────────────────────
export const followBtn =
  "px-4 py-1.5 rounded-full font-medium text-sm transition-colors duration-150 cursor-pointer"
export const followBtnFollow =
  "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white"
export const followBtnUnfollow =
  "bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-red-200 hover:text-red-600 hover:bg-red-50 dark:hover:border-red-900/50 dark:hover:text-red-400 dark:hover:bg-red-500/10"

// ─── Tabs ─────────────────────────────────────────────
export const tabsContainer = "flex border-b border-gray-200 dark:border-gray-800 mb-6 gap-6"
export const tab = "pb-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent transition-colors cursor-pointer"
export const tabActive = "pb-3 text-sm font-medium text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white cursor-pointer"

// ─── Feedback ─────────────────────────────────────────
export const errorClass = "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg p-3 text-sm text-center"
export const successClass = "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-lg p-3 text-sm text-center"
export const loadingClass = "flex items-center justify-center py-10"
export const emptyStateClass = "text-center py-12 text-gray-500 dark:text-gray-400"
export const emptyStateIcon = "text-3xl mb-3 opacity-50 grayscale"
export const emptyStateText = "text-sm font-medium"

// ─── Archives ─────────────────────────────────────────
export const archiveCard =
  "bg-gray-50 dark:bg-[#111113] border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-150"
export const restoreBtn =
  "px-3 py-1 rounded-md text-xs font-medium bg-white dark:bg-[#1a1a1c] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-sm"

// ─── Misc ─────────────────────────────────────────────
export const divider = "h-px bg-gray-200 dark:bg-gray-800 my-4"
export const badge = "text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
export const overlay = "fixed inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm z-40"
export const modal = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800/80 rounded-xl p-6 z-50 w-full max-w-sm shadow-xl"
