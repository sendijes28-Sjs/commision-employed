import { useState, useEffect } from "react";
import { Plus, Edit, UserX, Trash2, Search, X, Loader2, Users, ShieldCheck, Mail, Briefcase, ChevronRight, Check, ShieldAlert, Fingerprint, Activity, UserPlus, KeyRound, LayoutGrid } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader } from "../components/PageHeader.jsx";

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.string().min(1, "Role is required"),
  team: z.string().min(1, "Team is required"),
  status: z.string().default("Active"),
});



import { API_URL } from '@/lib/api.js';

export function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [userToDelete, setUserToDelete] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { role: "user", team: "Lelang", status: "Active" }
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
    } catch (error) { toast.error("An error occurred"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUserId(user.id);
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("role", user.role);
      setValue("team", user.team);
      setValue("status", user.status || "Active");
      setValue("password", "");
    } else {
      setEditingUserId(null);
      reset({ role: "user", team: "Lelang", status: "Active", password: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); reset(); setEditingUserId(null); };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUserId) {
        const payload = data.password ? data : { ...data, password };
        await axios.put(`${API_URL}/users/${editingUserId}`, payload);
        toast.success("User profile updated");
      } else {
        if (!data.password) return toast.error("Password is required");
        await axios.post(`${API_URL}/users`, data);
        toast.success("New user created");
      }
      fetchUsers();
      closeModal();
    } catch (error) { toast.error(error.response?.data?.error || "Unable to process request"); }
  };

  const confirmDeleteUser = (id, name) => {
    setUserToDelete({ id, name });
  };

  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${API_URL}/users/${userToDelete.id}`);
      fetchUsers();
      toast.success("User successfully deleted");
      setUserToDelete(null);
    } catch (error) { 
      toast.error("Failed to delete user"); 
      setUserToDelete(null);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      await axios.patch(`${API_URL}/users/${user.id}/status`, { status: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      toast.success(`${user.name} is now ${newStatus}`);
    } catch (error) { toast.error("Status toggle failed"); }
  };

  const filteredUsers = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    const matchRole = roleFilter === "All Roles" || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchTeam = teamFilter === "All Teams" || u.team.toLowerCase() === teamFilter.toLowerCase();
    
    // Safety check: Regular admin can never see super admin
    if (currentUser?.role === 'admin' && (u.role === 'super_admin' || u.role === 'Super Admin')) {
      return false;
    }
    
    return matchSearch && matchRole && matchTeam;
  });

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <PageHeader
        title="Users"
        subtitle="Manage system access and organization structure"
        actions={
          <button 
            onClick={() => openModal()}
            className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all font-medium text-sm active:scale-95 shadow-sm"
          >
            Add User
          </button>
        }
      />

      <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-3 items-center">
        <div className="flex-1 relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg outline-none focus:border-primary transition-all text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 lg:flex-none px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-sm text-slate-600 shadow-sm"
            >
               <option>All Roles</option>
               {currentUser?.role === 'super_admin' && <option>Super_Admin</option>}
               <option>Admin</option>
               <option>User</option>
               <option>Lelang</option>
            </select>
           <select 
             value={teamFilter}
             onChange={(e) => setTeamFilter(e.target.value)}
             className="flex-1 lg:flex-none px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-sm text-slate-600 shadow-sm"
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
      </div>

      {/* Profile Card Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center">
             <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
             <p className="text-xs font-medium text-slate-500 mt-4">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-16 text-center">
             <p className="text-lg font-semibold text-slate-900">No users found</p>
             <p className="text-sm text-slate-500 mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="group bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
               <div className="flex flex-col items-center text-center mb-5 relative z-10">
                  <div className="relative mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold text-lg shadow-sm group-hover:bg-primary transition-colors">
                       {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'} border-2 border-white shadow-sm flex items-center justify-center`}>
                       <Activity className={`w-2 h-2 text-white ${user.status === 'Active' ? 'animate-pulse' : ''}`} />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 leading-tight group-hover:text-primary transition-colors">{user.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">ID: #{user.id}</p>
               </div>

               <div className="space-y-3 relative z-10 mb-5">
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                     <Mail className="w-4 h-4 text-slate-400" />
                     <span className="text-xs font-medium text-slate-600 truncate">{user.email}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                     <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100 text-center">
                        <p className="text-xs text-slate-400 mb-0.5">Team</p>
                        <p className="text-sm font-medium text-slate-900">{user.team}</p>
                     </div>
                     <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100 text-center">
                        <p className="text-xs text-slate-400 mb-0.5">Role</p>
                        <p className="text-sm font-medium text-primary capitalize">{user.role}</p>
                     </div>
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-2 relative z-10">
                  <button 
                    onClick={() => openModal(user)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5"
                  >
                     <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                  <button 
                    onClick={() => toggleStatus(user)}
                    className="w-9 h-9 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                  >
                     <UserX className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => confirmDeleteUser(user.id, user.name)}
                    className="w-9 h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
             <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-sm">
                      {editingUserId ? <Fingerprint className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                   </div>
                    <div>
                       <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{editingUserId ? 'Edit User' : 'New User'}</h2>
                       <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest italic opacity-50">
               Manage user account details
             </p>
                    </div>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-900 transition-colors">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                <div className="space-y-2">
                   <label className="text-xs font-medium text-slate-700">Full Name</label>
                   <input
                     {...register("name")}
                     className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary transition-all shadow-sm"
                     placeholder="Alexander Sterling"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-medium text-slate-700">Email Address</label>
                       <input
                         {...register("email")}
                         className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary transition-all shadow-sm"
                         placeholder="user@company.com"
                       />
                    </div>
                   <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">Password</label>
                      <input
                        {...register("password")}
                        type="password"
                        className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary transition-all shadow-sm"
                        placeholder="••••••••"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-medium text-slate-700">User Role</label>
                       <select 
                         {...register("role")}
                         className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-primary transition-all shadow-sm"
                       >
                          <option value="user">Standard User</option>
                          <option value="Lelang">Lelang</option>
                          <option value="admin">Administrator</option>
                          {currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-medium text-slate-700">Team / Division</label>
                      <select 
                        {...register("team")}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-primary transition-all shadow-sm"
                      >
                         <option>Lelang</option>
                         <option>User</option>
                         <option>IT Division</option>
                         <option>HR</option>
                         <option>CEO</option>
                      </select>
                   </div>
                </div>

                <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-50">
                   <button 
                     type="button" 
                     onClick={closeModal}
                     className="px-4 py-2 font-medium text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     disabled={isSubmitting}
                     className="bg-primary text-white px-5 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-primary/90 transition-all disabled:opacity-30 active:scale-95"
                   >
                      {editingUserId ? 'Save Changes' : 'Create User'}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
               <ShieldAlert className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">Delete User?</h3>
             <p className="text-sm text-slate-500 text-center mb-6">
               Are you sure you want to permanently delete {userToDelete.name}? This action cannot be undone.
             </p>
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setUserToDelete(null)}
                 className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={executeDeleteUser}
                 className="flex-1 px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
               >
                 Delete User
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
