'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthCheckProps {
  children: React.ReactNode;
  requiredRoles: string[];
  redirectTo: string;
}

const AuthCheck: React.FC<AuthCheckProps> = ({
  children,
  requiredRoles,
  redirectTo,
}) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the user is authenticated and has the required roles
    const checkAuth = async () => {
      try {
        // Example API call to verify authentication and roles
        // Adjust this based on your authentication system
        const response = await fetch('/api/staff/auth/session/verify', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const userData = await response.json();
        
        // Check if user has at least one of the required roles
        const hasRequiredRole = requiredRoles.some(role => 
          userData.roles && userData.roles.includes(role)
        );

        if (!hasRequiredRole) {
          throw new Error('Insufficient permissions');
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthorized(false);
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [requiredRoles, redirectTo, router]);

  // Show nothing while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authorized, render children
  return isAuthorized ? <>{children}</> : null;
};

export default AuthCheck; 