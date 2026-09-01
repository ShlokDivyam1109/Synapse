import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4 opacity-50" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Page not found
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          The page you're looking for doesn't exist. It might be coming soon or already removed.
        </p>
        <Link to="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
