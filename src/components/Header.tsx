import { memo } from 'react';
import { Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import { Button } from '@/components/ui/button';

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
            </div>
          </Link>
          
          <nav>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/professional" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                For Professional
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
});
