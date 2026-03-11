import { Save, Upload } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-1">Configure system preferences and rules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <label htmlFor="shopeeCommission" className="block mb-2 text-sm">
                Shopee Team Commission (%)
              </label>
              <input
                id="shopeeCommission"
                type="number"
                step="0.1"
                min="0"
                max="100"
                defaultValue="4.5"
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

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h2 className="mb-6">Price List Upload</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Upload Excel file with product prices</p>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                Select File
              </button>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• File format: .xlsx or .xls</p>
              <p>• Required columns: SKU, Product Name, Bottom Price</p>
              <p>• Maximum file size: 5MB</p>
            </div>
          </div>
        </div>

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
                <option>USD ($)</option>
                <option>IDR (Rp)</option>
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
