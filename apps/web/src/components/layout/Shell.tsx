import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  AlertTriangle, 
  ArrowLeftRight, 
  AlertOctagon, 
  Building2,
  Database,
  ShieldCheck
} from 'lucide-react';
import { useHealthCheck } from '../../hooks/queries';
import { cn } from '../../utils/cn';

const navGroups = [
  {
    group: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard }
    ]
  },
  {
    group: 'ANALYSIS',
    items: [
      { name: 'Network Explorer', path: '/network', icon: Network },
      { name: 'Risk Impact', path: '/risks', icon: AlertTriangle },
      { name: 'Product Comparison', path: '/compare', icon: ArrowLeftRight },
      { name: 'Critical Dependencies', path: '/critical-dependencies', icon: AlertOctagon },
    ]
  },
  {
    group: 'DIRECTORY',
    items: [
      { name: 'Suppliers', path: '/suppliers', icon: Building2 },
    ]
  }
];

export function Shell() {
  const location = useLocation();
  const { data: health, isError } = useHealthCheck();

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard';
      case '/network': return 'Network Explorer';
      case '/risks': return 'Risk Impact';
      case '/compare': return 'Product Comparison';
      case '/critical-dependencies': return 'Critical Dependencies';
      case '/suppliers': return 'Suppliers Directory';
      default:
        if (location.pathname.startsWith('/suppliers/')) return 'Supplier Details';
        if (location.pathname.startsWith('/products/')) return 'Product Details';
        return 'ChainGuard';
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-card-border bg-card flex flex-col shadow-sm z-20 relative">
        <div className="h-16 flex items-center px-6 border-b border-card-border">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground hover:text-primary transition-colors">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>ChainGuard</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {navGroups.map((group, idx) => (
            <div key={group.group} className={cn("mb-6", idx === navGroups.length - 1 && "mb-0")}>
              <h4 className="px-3 text-xs font-semibold text-muted tracking-wider mb-2">
                {group.group}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || 
                                  (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-primary-light text-primary shadow-sm" 
                          : "text-muted hover:bg-muted-light/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-card-border bg-muted-light/30">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Database className="w-4 h-4" />
            <span>DB Status:</span>
            <span className={cn(
              "font-semibold flex items-center gap-1",
              isError ? "text-danger" : (health?.database === 'connected' ? "text-success" : "text-warning")
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full",
                isError ? "bg-danger" : (health?.database === 'connected' ? "bg-success" : "bg-warning")
              )}></span>
              {isError ? "Disconnected" : (health?.database || "Checking")}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-background">
        <header className="h-16 border-b border-card-border bg-card/80 backdrop-blur-md flex items-center px-8 z-10 shadow-sm sticky top-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground">
              {getPageTitle()}
            </h1>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
