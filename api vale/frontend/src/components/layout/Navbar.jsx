import { useAuth } from '../../context';
import { ICONS } from '../../utils/icons';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between px-4 sm:px-6 
                       glass border-b border-light-400/10 backdrop-blur-xl bg-dark-900/60">
      
      {/* Menu Toggle for mobile */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-light-400 hover:bg-dark-700/50 hover:text-white lg:hidden transition-colors"
          dangerouslySetInnerHTML={{ __html: ICONS.menu }}
          aria-label="Abrir menú"
        />
        
        {/* Aquí podría ir pan de migas (breadcrumbs) o título de página, por ahora vacío */}
        <div className="hidden sm:block">
          {/* Opcional: Saludo */}
          <p className="text-sm text-light-300">
            Panel de control / <span className="text-primary-light font-medium">Dashboard</span>
          </p>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'Administrador'}</p>
            <p className="text-xs text-light-400">{user?.role}</p>
          </div>
          
          {/* Avatar (Generado usando inicial) */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-accent to-primary text-sm font-bold text-white shadow-lg shadow-primary/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>

        <div className="h-6 w-px bg-light-400/20" />

        <button
          onClick={logout}
          className="group flex h-10 w-10 items-center justify-center rounded-xl text-light-400 hover:bg-danger/10 hover:text-danger transition-all duration-300"
          title="Cerrar sesión"
          dangerouslySetInnerHTML={{ __html: ICONS.logOut }}
        />
      </div>
    </header>
  );
}
