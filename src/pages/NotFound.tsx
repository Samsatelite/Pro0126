import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
      <div className="relative text-center">
        {/* Animated illustration */}
        <div className="mb-8 flex justify-center">
          <img
            src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
            alt="404 Animation"
            className="h-64 w-auto rounded-2xl object-contain md:h-80"
          />
        </div>

        {/* Error text */}
        <div className="animate-fade-in space-y-4">
          <h1 className="font-display text-8xl font-bold text-gradient md:text-9xl">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
            Oops! Page Not Found
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            The page you're looking for seems to have wandered off. 
            Don't worry, let's get you back on track!
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      </div>
    </div>
  );
};

export default NotFound;
