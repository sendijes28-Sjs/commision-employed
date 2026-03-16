import { useState, useEffect } from "react";
import { Plus, Edit, UserX, Trash2, Search, X, Loader2, Users, ShieldCheck, Mail, Briefcase, ChevronRight, Check, ShieldAlert, Fingerprint, Activity, UserPlus, KeyRound, LayoutGrid } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";

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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [teamFilter, setTeamFilter] = useState("All Teams");

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { role: "user", team: "Lelang", status: "Active" }
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
    } catch (error) { console.error(error); }
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
        const payload = data.password ? data : { ...data, password: undefined };
        await axios.put(`${API_URL}/users/${editingUserId}`, payload);
        toast.success("Personnel records updated");
      } else {
        if (!data.password) return toast.error("Initial security code required");
        await axios.post(`${API_URL}/users`, data);
        toast.success("New personnel onboarded");
      }
      fetchUsers();
      closeModal();
    } catch (error: any) { toast.error(error.response?.data?.error || "Transaction failed"); }
  };

  const deleteUser = async (id: number, name: string) => {
    if (window.confirm(`Permanently remove ${name} from system registry?`)) {
      try {
        await axios.delete(`${API_URL}/users/${id}`);
        fetchUsers();
        toast.success("User purged from system");
      } catch (error) { toast.error("Purge operation failed"); }
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      await axios.put(`${API_URL}/users/${user.id}`, { status: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (error) { toast.error("Status toggle failed"); }
  };

  const filteredUsers = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    const matchRole = roleFilter === "All Roles" || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchTeam = teamFilter === "All Teams" || u.team.toLowerCase() === teamFilter.toLowerCase();
    return matchSearch && matchRole && matchTeam;
  });

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Premium Header Architecture */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
            <span className="bg-slate-900 text-white p-3.5 rounded-[1.75rem] shadow-2xl shadow-slate-200">
              <Users className="w-10 h-10" />
            </span>
            Staff Registry
          </h1>
          <p className="text-muted-foreground mt-3 font-medium text-lg italic leading-relaxed">
            Oversee enterprise access tiers and organizational structure with high-fidelity authorization controls
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-white pl-10 pr-12 py-5 rounded-[2.5rem] hover:scale-[1.03] transition-all shadow-2xl shadow-primary/30 flex items-center gap-4 font-black uppercase tracking-[0.2em] text-xs active:scale-95"
        >
          <UserPlus className="w-6 h-6" />
          Enroll Personnel
        </button>
      </div>

      {/* Advanced Filter Matrix */}
      <div className="bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row gap-8 items-center bg-slate-50/20">
        <div className="flex-1 relative group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by identity label or email endpoint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-4.5 bg-white border border-slate-200 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-sm shadow-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
           <div className="relative flex-1 lg:flex-none">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-8 pr-12 py-4.5 bg-white border border-slate-200 rounded-[2.5rem] outline-none focus:bg-slate-50 transition-all font-black text-xs appearance-none uppercase tracking-widest text-slate-500 shadow-sm"
              >
                 <option>All Roles</option>
                 <option>Super_Admin</option>
                 <option>Admin</option>
                 <option>User</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 pointer-events-none" />
           </div>
           <div className="relative flex-1 lg:flex-none">
              <select 
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full pl-8 pr-12 py-4.5 bg-white border border-slate-200 rounded-[2.5rem] outline-none focus:bg-slate-50 transition-all font-black text-xs appearance-none uppercase tracking-widest text-slate-500 shadow-sm"
              >
                 <option>All Teams</option>
                 <option>Lelang</option>
                 <option>Shopee</option>
                 <option>Offline</option>
                 <option>IT Division</option>
                 <option>HR</option>
                 <option>CEO</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 pointer-events-none" />
           </div>
           <button className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
              <LayoutGrid className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* Profile Card Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {isLoading ? (
          <div className="col-span-full py-40 text-center">
             <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-10 animate-pulse">Syncing Personnel Nodes...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-40 text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Users className="w-10 h-10 opacity-10" />
             </div>
             <p className="text-2xl font-black tracking-tighter text-slate-900">Zero Personnel Matches</p>
             <p className="text-sm font-medium text-slate-400 mt-2 italic leading-relaxed max-w-md mx-auto">No records identified within the current filter constraints.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="group bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000 grayscale group-hover:grayscale-0">
                  <Fingerprint className="w-32 h-32 text-primary" />
               </div>
               
               <div className="flex flex-col items-center text-center mb-10 relative z-10">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-slate-300 group-hover:bg-primary transition-colors duration-500">
                       {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'} border-4 border-white shadow-lg flex items-center justify-center`}>
                       <Activity className={`w-3 h-3 text-white ${user.status === 'Active' ? 'animate-pulse' : ''}`} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{user.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Node ID: #{user.id}</span>
                  </div>
               </div>

               <div className="space-y-6 relative z-10 mb-8">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-primary opacity-60" />
                        <span className="text-xs font-black text-slate-500 truncate max-w-[150px]">{user.email}</span>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Division</p>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{user.team}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Auth Tier</p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-50 flex items-center justify-between gap-4 relative z-10">
                  <button 
                    onClick={() => openModal(user)}
                    className="flex-1 px-4 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                     <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleStatus(user)}
                      className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm group/status"
                      title={user.status === 'Active' ? 'Deactivate Node' : 'Activate Node'}
                    >
                       <UserX className="w-5 h-5 group-hover/status:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id, user.name)}
                      className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm group/trash"
                      title="Purge Personnel"
                    >
                       <Trash2 className="w-5 h-5 group-hover/trash:scale-110 transition-transform" />
                    </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-2xl">
           <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
             <div className="px-14 py-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-slate-300">
                      {editingUserId ? <Fingerprint className="w-8 h-8 text-primary" /> : <UserPlus className="w-8 h-8 text-primary" />}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingUserId ? 'Modify Registry' : 'Corporate Enrollment'}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Personnel credentials and authorization clearance</p>
                   </div>
                </div>
                <button 
                  onClick={closeModal} 
                  className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                >
                   <X className="w-7 h-7" />
                </button>
             </div>
             
             <form onSubmit={handleSubmit(onSubmit)} className="p-14 space-y-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Verified Full Nomenclature</label>
                   <input
                     {...register("name")}
                     className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-sm outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
                     placeholder="e.g. Alexander Sterling"
                   />
                </div>

                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Corporate Email Alias</label>
                      <input
                        {...register("email")}
                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-sm outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
                        placeholder="identity@corporate.hub"
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Secure Access Cipher</label>
                      <div className="relative">
                         <input
                           {...register("password")}
                           type="password"
                           className="w-full pl-12 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-sm outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
                           placeholder="••••••••"
                         />
                         <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Authorization Tier</label>
                      <div className="relative">
                         <select 
                           {...register("role")}
                           className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-xs outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all appearance-none uppercase tracking-widest text-slate-500 shadow-sm"
                         >
                            <option value="user">Standard Agent</option>
                            <option value="admin">Regional Controller</option>
                            <option value="super_admin">System Sovereign</option>
                         </select>
                         <ShieldAlert className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Division Assignment</label>
                      <div className="relative">
                         <select 
                           {...register("team")}
                           className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-xs outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all appearance-none uppercase tracking-widest text-slate-500 shadow-sm"
                         >
                            <option>Lelang</option>
                            <option>Shopee</option>
                            <option>Offline</option>
                            <option>IT Division</option>
                            <option>HR</option>
                            <option>CEO</option>
                         </select>
                         <Briefcase className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      </div>
                   </div>
                </div>

                <div className="pt-12 flex items-center justify-end gap-6 border-t border-slate-50">
                   <button 
                     type="button" 
                     onClick={closeModal}
                     className="px-10 py-5 font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 hover:text-slate-900 transition-colors"
                   >
                     Abort Entry
                   </button>
                   <button 
                     type="submit"
                     disabled={isSubmitting}
                     className="bg-primary text-white px-14 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/30 hover:scale-[1.03] transition-all disabled:opacity-30 flex items-center gap-4 active:scale-95"
                   >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                      {editingUserId ? 'Commit Modification' : 'Enforce Enrollment'}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
