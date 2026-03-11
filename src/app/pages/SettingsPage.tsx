import { Save, Upload, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SettingsPage() {
  const { user } = useAuth();
  const isUserRole = user?.role === "user";

  return (
    <div className="space-y-6">
      <div>
        <h1>{isUserRole ? "Account Settings" : "Settings"}</h1>
        <p className="text-muted-foreground mt-1">
          {isUserRole ? "Manage your personal account" : "Configure system preferences and rules"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings - shown for all */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h2 className="mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="profileName" className="block mb-2 text-sm">
                Full Name
              </label>
              <input
                id="profileName"
                type="text"
                defaultValue={user?.name || ""}
                className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="profileEmail" className="block mb-2 text-sm">
                Email Address
              </label>
              <input
                id="profileEmail"
                type="email"
                defaultValue={user?.email || ""}
                className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="profileTeam" className="block mb-2 text-sm">
                Team
              </label>
              <input
                id="profileTeam"
                type="text"
                value={user?.team || ""}
                readOnly
                className="w-full px-4 py-2 bg-secondary border border-input rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="profileRole" className="block mb-2 text-sm">
                Role
              </label>
              <input
                id="profileRole"
                type="text"
                value={user?.role || ""}
                readOnly
                className="w-full px-4 py-2 bg-secondary border border-input rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="currentPassword" className="block mb-2 text-sm">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block mb-2 text-sm">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings - shown for all */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h2 className="mb-6">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm">Email notifications for new invoices</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receive email when new invoice is submitted
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-switch-background peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm">Email notifications for approvals</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receive email when invoice is approved or rejected
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-switch-background peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm">Email notifications for commission reports</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receive weekly commission summary reports
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-switch-background peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Commission Rules - admin/super_admin ONLY */}
        {!isUserRole && (
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h2 className="mb-6">Commission Rules</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="lelangCommission" className="block mb-2 text-sm">
                  Lelang Team Commission (%)
                </label>
                <input
                  id="lelangCommission"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue="5.0"
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="userCommission" className="block mb-2 text-sm">
                  User Team Commission (%)
                </label>
                <input
                  id="userCommission"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue="4.5"
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="offlineCommission" className="block mb-2 text-sm">
                  Offline Team Commission (%)
                </label>
                <input
                  id="offlineCommission"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue="4.0"
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="defaultCommission" className="block mb-2 text-sm">
                  Default Commission (%)
                </label>
                <input
                  id="defaultCommission"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue="3.0"
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        )}

        {/* System Preferences - admin/super_admin ONLY */}
        {!isUserRole && (
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h2 className="mb-6">System Preferences</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="currency" className="block mb-2 text-sm">
                  Currency
                </label>
                <select
                  id="currency"
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>IDR (Rp)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div>
                <label htmlFor="timezone" className="block mb-2 text-sm">
                  Timezone
                </label>
                <select
                  id="timezone"
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Asia/Jakarta (GMT+7)</option>
                  <option>Asia/Singapore (GMT+8)</option>
                  <option>UTC (GMT+0)</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm">Require approval for below bottom price</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invoices with prices below bottom price need admin approval
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-switch-background peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
