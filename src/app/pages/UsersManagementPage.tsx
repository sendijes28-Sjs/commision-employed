import { Plus, Edit, UserX, Trash2, Search } from "lucide-react";

const users = [
  { name: "John Doe", email: "john.doe@company.com", role: "Super Admin", team: "Lelang", status: "Active" },
  { name: "Jane Smith", email: "jane.smith@company.com", role: "Admin", team: "Shopee", status: "Active" },
  { name: "Mike Johnson", email: "mike.johnson@company.com", role: "User", team: "Lelang", status: "Active" },
  { name: "Sarah Williams", email: "sarah.williams@company.com", role: "User", team: "Shopee", status: "Active" },
  { name: "David Brown", email: "david.brown@company.com", role: "Admin", team: "Lelang", status: "Inactive" },
  { name: "Lisa Anderson", email: "lisa.anderson@company.com", role: "User", team: "Shopee", status: "Active" },
];

export function UsersManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Users Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
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
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select className="px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Roles</option>
            <option>Super Admin</option>
            <option>Admin</option>
            <option>User</option>
          </select>
          <select className="px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Teams</option>
            <option>Lelang</option>
            <option>Shopee</option>
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
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-sm ${
                        user.role === "Super Admin"
                          ? "bg-primary/10 text-primary"
                          : user.role === "Admin"
                          ? "bg-success/10 text-success"
                          : "bg-secondary"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded bg-secondary text-sm">{user.team}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-sm ${
                        user.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-secondary rounded transition-colors">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-secondary rounded transition-colors">
                        <UserX className="w-4 h-4 text-warning" />
                      </button>
                      <button className="p-1 hover:bg-secondary rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
