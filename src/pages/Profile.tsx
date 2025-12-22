import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, Edit2, Check, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setEditName(parsed.name);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    
    const updatedUser = { ...user!, name: editName };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    setIsLoading(false);
    
    toast({
      title: "Profile updated",
      description: "Your changes have been saved.",
    });
  };

  const handleCancel = () => {
    setEditName(user?.name || "");
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={true}
        userName={user.name}
        isAdmin={user.role === "admin"}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
            {/* Avatar Section */}
            <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
              <div className="absolute -bottom-10 left-6">
                <div className="h-20 w-20 rounded-xl bg-primary/10 border-4 border-card flex items-center justify-center shadow-elevated">
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="pt-14 px-6 pb-6 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Full name</Label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      <Check className="h-4 w-4 text-positive" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-medium">{user.name}</p>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Email address
                </Label>
                <p className="text-sm">{user.email}</p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  Role
                </Label>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since
                </Label>
                <p className="text-sm">December 2024</p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-xl border border-border bg-card shadow-soft p-6">
            <h2 className="font-medium mb-4">Your Activity</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-semibold">12</p>
                <p className="text-xs text-muted-foreground">Batches Processed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-semibold">1,847</p>
                <p className="text-xs text-muted-foreground">Reviews Analyzed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-semibold">34</p>
                <p className="text-xs text-muted-foreground">Corrections Made</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h2 className="font-medium text-destructive mb-2">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
