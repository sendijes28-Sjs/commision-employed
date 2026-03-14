import { useState, useEffect } from "react";
import { Plus, Edit, UserX, Trash2, Search, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

// Zod Schema for User Form
const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.string().min(1, "Role is required"),
  team: z.string().min(1, "Team is required"),
  status: z.string().default("Active"),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string;
  status: string;
}

const API_URL = "http://localhost:3001/api";

export function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [teamFilter, setTeamFilter] = useState("All Teams");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "User",
      team: "Lelang",
      status: "Active"
    }
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUserId(user.id);
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("role", user.role);
      setValue("team", user.team);
      setValue("status", user.status || "Active");
      setValue("password", ""); // Keep blank when editing unless changing
    } else {
      setEditingUserId(null);
      reset({ role: "User", team: "Lelang", status: "Active", password: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setEditingUserId(null);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUserId) {
        // Only send password if it was filled out
        const payload = data.password ? data : { ...data, password: undefined };
        await axios.put(`${API_URL}/users/${editingUserId}`, payload);
      } else {
        if (!data.password) {
          alert("Password is required for new users");
          return;
        }
        await axios.post(`${API_URL}/users`, data);
      }
      await fetchUsers();
      closeModal();
    } catch (error: any) {
      console.error("Save user error:", error);
      alert(error.response?.data?.error || "Failed to save user");
    }
  };

  const deleteUser = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete user ${name}?`)) {
      try {
        await axios.delete(`${API_URL}/users/${id}`);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("Failed to delete user");
      }
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      await axios.put(`${API_URL}/users/${user.id}`, { ...user, status: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All Roles" || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchTeam = teamFilter === "All Teams" || u.team.toLowerCase() === teamFilter.toLowerCase();
    return matchSearch && matchRole && matchTeam;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1>Users Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>All Roles</option>
            <option>Super_Admin</option>
            <option>Admin</option>
            <option>User</option>
          </select>
          <select 
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>All Teams</option>
            <option>Lelang</option>
            <option>Shopee</option>
            <option>Offline</option>
            <option>IT Division</option>
            <option>HR</option>
            <option>CEO</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 text-primary font-bold rounded-full flex items-center justify-center text-sm">
                          {user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs uppercase font-medium tracking-wide ${
                        user.role === "super_admin" ? "bg-purple-100 text-purple-700" :
                        user.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded border border-border bg-card text-xs font-medium text-foreground">
                        {user.team}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}></span>
                          {user.status || "Active"}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openModal(user)}
                          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleStatus(user)}
                          className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors text-muted-foreground hover:text-yellow-600"
                          title={user.status === "Active" ? "Deactivate User" : "Activate User"}
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id, user.name)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Could be extracted to a separate component */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h2 className="text-xl font-bold">{editingUserId ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  {...register("name")}
                  className={`w-full px-3 py-2 bg-input-background border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.name ? 'border-red-500' : 'border-input'}`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full px-3 py-2 bg-input-background border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.email ? 'border-red-500' : 'border-input'}`}
                  placeholder="john@glory.com"
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password {editingUserId && <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>}</label>
                <input
                  {...register("password")}
                  type="password"
                  className={`w-full px-3 py-2 bg-input-background border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.password ? 'border-red-500' : 'border-input'}`}
                  placeholder="••••••••"
                />
                 {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    {...register("role")}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Team</label>
                  <select
                    {...register("team")}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Lelang">Lelang</option>
                    <option value="Shopee">Shopee</option>
                    <option value="Offline">Offline</option>
                    <option value="IT Division">IT Division</option>
                    <option value="HR">HR</option>
                    <option value="CEO">CEO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    {...register("status")}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 hover:bg-secondary rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingUserId ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
