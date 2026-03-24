import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'
import MobileBottomNav from './MobileBottomNav'
import MobileFAB from './MobileFAB'
import { pageBackground } from '../../styles/common'

const MainLayout = () => {
  return (
    <div className={`${pageBackground} h-screen flex flex-col overflow-hidden`}>
      {/* 1. Fixed Top Navbar */}
      <div className="shrink-0 z-50">
        <Navbar />
      </div>
      
      {/* 2. Scrollable / Computable Content Area beneath Navbar */}
      <div className="flex-1 overflow-hidden w-full max-w-7xl mx-auto px-0 sm:px-4 py-0 sm:py-6 flex gap-6 lg:gap-8 justify-center">
        
        {/* Left Navigation (hidden on mobile) */}
        <div className="hidden md:block w-64 shrink-0 h-full overflow-y-auto no-scrollbar pb-6">
          <Sidebar />
        </div>
        
        {/* Main Feed Activity (Scrolls independently) */}
        <main className="flex-1 w-full max-w-2xl min-w-0 h-full overflow-y-auto no-scrollbar pb-24 md:pb-6">
          <Outlet />
        </main>
        
        {/* Right Recommendations (hidden on mobile and tablet) */}
        <div className="hidden lg:block w-72 shrink-0 h-full overflow-y-auto no-scrollbar pb-6">
          <RightSidebar />
        </div>

      </div>

      <MobileFAB />
      
      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <MobileBottomNav />
    </div>
  )
}

export default MainLayout
