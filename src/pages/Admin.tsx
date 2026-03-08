import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Admin() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!data) {
        navigate("/");
        return;
      }
      setAuthorized(true);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground bg-background">Loading...</div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-4 text-muted-foreground">Contact submissions will appear here.</p>
      </main>
    </div>
  );
}
