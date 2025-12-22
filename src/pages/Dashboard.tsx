import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { BulkReviewProcessor } from "@/components/BulkReviewProcessor";

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={true}
        userName={user?.name}
        isAdmin={user?.role === "admin"}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Upload and analyze customer reviews with AI-powered sentiment analysis
            </p>
          </div>

          {/* Main Content */}
          <BulkReviewProcessor />
        </motion.div>
      </main>
    </div>
  );
}
