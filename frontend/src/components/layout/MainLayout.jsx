import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'
import MobileBottomNav from './MobileBottomNav'
import MobileFAB from './MobileFAB'

const MainLayout = () => {
  return (
    <div className="bg-[var(--bg)] text-[var(--text)] h-screen flex flex-col overflow-hidden">
      {/* Mobile-only top bar */}
      <Navbar />
      
      {/* Main 3-column layout */}
      <div className="flex-1 overflow-hidden w-full max-w-[1400px] mx-auto px-0 md:px-6 lg:px-8 flex justify-center">
        
        {/* Left Navigation Rail */}
        <div className="hidden md:block w-52 shrink-0 h-full overflow-y-auto no-scrollbar py-6 pr-2">
          <Sidebar />
        </div>
        
        {/* Center Feed */}
        <main className="flex-1 w-full max-w-2xl min-w-0 h-full overflow-y-auto no-scrollbar pb-24 md:pb-6 px-4 md:px-6 pt-4 md:pt-6">
          <Outlet />
        </main>
        
        {/* Right Contextual Sidebar */}
        <div className="hidden lg:block w-72 shrink-0 h-full overflow-y-auto no-scrollbar py-6 pl-2">
          <RightSidebar />
        </div>
      </div>

      <MobileFAB />
      <MobileBottomNav />
    </div>
  )
}

export default MainLayout
