import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Task Status', path: '/status' },
]

function Sidebar({ onLogout }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('authToken')

  return (
    <aside className="sidebar-panel">
      <div className="brand-block">
        <div className="brand-icon">AI</div>
        <div>
          <div className="brand-title">AI Media</div>
          <div className="brand-subtitle">Processing Platform</div>
        </div>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-note">Powering AI tasks asynchronously.</div>
        {token ? (
          <button type="button" className="logout-button" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <button
            type="button"
            className="logout-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
