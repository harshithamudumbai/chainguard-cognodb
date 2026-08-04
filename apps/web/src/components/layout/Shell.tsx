import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  AlertTriangle, 
  ArrowLeftRight, 
  AlertOctagon, 
  Building2,
  Database
} from 'lucide-react';
import { useHealthCheck } from '../../hooks/queries';
import { cn } from '../../utils/cn';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Network Explorer', path: '/network', icon: Network },
  { name: 'Risk Impact', path: '/risks', icon: AlertTriangle },
  { name: 'Product Comparison', path: '/compare', icon: ArrowLeftRight },
  { name: 'Critical Dependencies', path: '/critical-dependencies', icon: AlertOctagon },
  { name: 'Suppliers', path: '/suppliers', icon: Building2 },
];

export function Shell() {
  const location = useLocation();
  const { data: health, isError } = useHealthCheck();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-card bg-card/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-card">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Network className="w-6 h-6" />
            <span>ChainGuard</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground/70 hover:bg-card hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-card">
          <div className="flex items-center gap-2 text-xs text-foreground/60">
            <Database className="w-4 h-4" />
            <span>DB Status:</span>
            <span className={cn(
              "font-medium",
              isError ? "text-danger" : (health?.database === 'connected' ? "text-success" : "text-warning")
            )}>
              {isError ? "Disconnected" : (health?.database || "Checking...")}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="h-16 border-b border-card bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-8 z-10">
          <h1 className="text-lg font-semibold capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1].replace('-', ' ')}
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
