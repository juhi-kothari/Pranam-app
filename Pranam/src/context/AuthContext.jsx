import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    console.log('🔄 AuthContext initializing...');
    const storedAuth = localStorage.getItem("auth");
    console.log('📦 Stored auth data:', storedAuth);

    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        console.log('✅ AuthContext loaded stored auth:', parsedAuth);
        console.log('👤 Stored user role:', parsedAuth.user?.role);
        setAuth(parsedAuth);
      } catch (error) {
        console.error('❌ AuthContext failed to parse stored auth:', error);
        localStorage.removeItem("auth");
      }
    } else {
      console.log('📭 AuthContext: No stored auth data found');
    }

    setIsLoading(false);
    console.log('✅ AuthContext initialization complete');
  }, []);

  const login = (userData) => {
    console.log('🔐 AuthContext login called with:', userData);

    // Handle both old format (userData, token) and new format (single object)
    let newAuth;
    if (typeof userData === 'object' && userData.token) {
      // New format: single object with user data and token
      newAuth = {
        user: {
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user'
        },
        token: userData.token
      };
    } else {
      // Old format: separate userData and token parameters
      newAuth = { user: userData, token: arguments[1] };
    }

    console.log('💾 AuthContext saving auth data:', newAuth);
    console.log('👤 User role:', newAuth.user?.role);

    setAuth(newAuth);
    localStorage.setItem("auth", JSON.stringify(newAuth));

    console.log('✅ AuthContext auth data saved to localStorage');
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
