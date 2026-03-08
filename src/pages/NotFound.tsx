import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-foreground mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Oops! Page not found</p>
      <Link
        to="/"
        className="text-primary hover:underline font-medium"
      >
        Return to Home
      </Link>
    </div>
  );
}
