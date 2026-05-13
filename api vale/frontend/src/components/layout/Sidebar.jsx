import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Shield, X } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/users', label: 'Usuarios', icon: Users },
  { path: '/admin/audit', label: 'Auditoría', icon: FileText },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-dark-900/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Asume un glass effect bonito y responsive */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen w-72 transform 
                    glass border-r border-light-400/10 
                    transition-transform duration-300 ease-in-out lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
      >
        <div className="flex h-full flex-col backdrop-blur-2xl bg-dark-900/60">
          
          {/* Logo / Header Area */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-light-400/10">
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30"
              >
                <Shield size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">VGCM <span className="text-primary-light text-sm font-normal align-top">admin</span></span>
            </div>
            
            {/* Botón cerrar solo en móviles */}
            <button 
              className="lg:hidden text-light-400 hover:text-white"
              onClick={toggleSidebar}
            >
              <X size={24} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-2 px-4 py-8 overflow-y-auto overflow-x-hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `
                  group relative flex items-center gap-4 px-4 py-3.5 rounded-xl
                  font-medium text-sm transition-all duration-300
                  ${isActive 
                    ? 'text-white bg-primary/10 shadow-[inset_0px_0px_20px_rgba(99,102,241,0.15)] overflow-hidden' 
                    : 'text-light-400 hover:text-white hover:bg-dark-700/50'
                  }
                `}
              >
                {({ isActive }) => {
                  const Icon = item.icon;
                  return (
                    <>
                      {/* Borde activo lateral */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-md shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                      )}

                      <span className={`transition-colors duration-300 ${isActive ? 'text-primary-light' : 'text-light-400 group-hover:text-primary-light'}`}>
                        <Icon size={20} />
                      </span>
                      {item.label}
                    </>
                  );
                }}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
