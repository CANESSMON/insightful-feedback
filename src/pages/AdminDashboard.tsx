import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  FileBarChart, 
  Activity, 
  RefreshCw,
  Shield,
  Clock,
  MoreHorizontal,
  Search
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Job {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  reviewCount: number;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

// Mock data
const mockUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "user", createdAt: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "admin", createdAt: "2024-01-10" },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "user", createdAt: "2024-02-01" },
];

const mockJobs: Job[] = [
  { id: "1", status: "completed", reviewCount: 150, createdAt: "2024-02-20" },
  { id: "2", status: "processing", reviewCount: 75, createdAt: "2024-02-21" },
  { id: "3", status: "pending", reviewCount: 200, createdAt: "2024-02-21" },
];

const mockAuditLogs: AuditLog[] = [
  { id: "1", action: "User login", user: "john@example.com", timestamp: "2024-02-21 14:30" },
  { id: "2", action: "Batch processed", user: "jane@example.com", timestamp: "2024-02-21 14:15" },
  { id: "3", action: "User created", user: "admin@example.com", timestamp: "2024-02-21 13:00" },
];

export default function AdminDashboard() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [loading, setLoading] = useState(false);
  const [jobsFilter, setJobsFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
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
      if (parsed.role !== "admin") {
        navigate("/dashboard");
        return;
      }
      setUser(parsed);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast({ title: "Data refreshed" });
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredJobs = jobs.filter((j) =>
    jobsFilter === "all" || j.status === jobsFilter
  );

  const stats = {
    totalUsers: users.length,
    totalJobs: jobs.length,
    completedJobs: jobs.filter((j) => j.status === "completed").length,
    reviewsProcessed: jobs.reduce((acc, j) => acc + j.reviewCount, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={true}
        userName={user?.name}
        isAdmin={true}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage users, monitor jobs, and view system activity
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={Users}
              delay={0}
            />
            <StatsCard 
              title="Total Jobs" 
              value={stats.totalJobs} 
              icon={FileBarChart}
              delay={0.05}
            />
            <StatsCard 
              title="Completed" 
              value={stats.completedJobs} 
              icon={Activity}
              delay={0.1}
            />
            <StatsCard 
              title="Reviews Processed" 
              value={stats.reviewsProcessed.toLocaleString()} 
              icon={Clock}
              delay={0.15}
            />
          </div>

          {/* Users Table */}
          <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-medium">Users</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Name</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Email</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Role</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Joined</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{u.createdAt}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-medium">Processing Jobs</h2>
              <Select value={jobsFilter} onValueChange={setJobsFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Job ID</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Reviews</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredJobs.map((j) => (
                    <tr key={j.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">#{j.id}</td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={
                            j.status === "completed" ? "default" :
                            j.status === "processing" ? "secondary" :
                            j.status === "failed" ? "destructive" : "outline"
                          }
                        >
                          {j.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{j.reviewCount}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{j.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-medium">Recent Activity</h2>
            </div>
            <div className="divide-y divide-border">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.user}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
