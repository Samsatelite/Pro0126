import { Sun, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sun className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Solar Load Calculator</h1>
            <p className="text-xs text-muted-foreground">Plan your inverter & battery setup</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 text-xs text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Real-time calculations</span>
        </div>
      </div>
    </header>
  );
}
