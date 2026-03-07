import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();
  const isProfessional = location.pathname === "/professional";

  return (
    <header className="border-b border-border bg-card">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="text-xl font-bold text-foreground">
          Inverter Calculator
        </Link>
        <nav className="flex gap-4">
          {isProfessional ? (
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Non Professional
            </Link>
          ) : (
            <Link to="/professional" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Professional
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
