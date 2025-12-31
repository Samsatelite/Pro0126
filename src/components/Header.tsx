import { memo } from 'react';
import { Zap, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.svg';

export const Header = memo(function Header() {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
              <img src={logo} alt="InverterSize Logo" className="relative h-10 w-10" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                InverterSize
              </h1>
              <p className="text-xs text-muted-foreground">
                Plan your inverter & battery setup
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>Real-time calculations</span>
            </div>
            <Link 
              to="/auth" 
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              title="Admin"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
});
