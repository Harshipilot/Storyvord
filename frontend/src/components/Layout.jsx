import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'

function Layout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <Sidebar onLogout={handleLogout} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
