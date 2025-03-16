
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-fade-in p-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <span className="font-semibold text-muted-foreground">404</span>
        </div>
        <h1 className="text-3xl font-semibold mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus-ring transition-colors"
        >
          Return home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
