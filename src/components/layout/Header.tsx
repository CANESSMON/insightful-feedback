import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquareText, User, LogOut, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export function Header({ isLoggedIn = false, userName, isAdmin, onLogout }: HeaderProps) {
  const location = useLocation();
  
  const navItems = isLoggedIn ? [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Settings }] : []),
    { href: "/profile", label: "Profile", icon: User },
  ] : [];

  return (
    <motion.header 
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
            <MessageSquareText className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">
            ReviewSense
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
          
          {isLoggedIn ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
