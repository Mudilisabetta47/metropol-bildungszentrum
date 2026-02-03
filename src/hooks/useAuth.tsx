import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "admin" | "employee" | "instructor" | "support" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const checkUserRoles = async (userId: string) => {
    try {
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesData) {
        const roleList = rolesData.map((r) => r.role as AppRole);
        setRoles(roleList);
        setIsSuperAdmin(roleList.includes("super_admin"));
        setIsAdmin(roleList.includes("admin") || roleList.includes("super_admin"));
        setIsStaff(
          roleList.includes("admin") || 
          roleList.includes("super_admin") || 
          roleList.includes("employee") ||
          roleList.includes("instructor") ||
          roleList.includes("support")
        );
      }
    } catch (error) {
      console.error("Error checking user roles:", error);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    if (roles.includes("super_admin")) return true;
    return roles.includes(role);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Defer role check with setTimeout
        if (session?.user) {
          setTimeout(() => {
            checkUserRoles(session.user.id);
          }, 0);
        } else {
          setIsStaff(false);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setRoles([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user) {
        checkUserRoles(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsStaff(false);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isStaff,
        isAdmin,
        isSuperAdmin,
        roles,
        hasRole,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
