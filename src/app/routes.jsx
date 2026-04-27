import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { InvoiceListPage } from "./pages/InvoiceListPage.jsx";
import { CreateInvoicePage } from "./pages/CreateInvoicePage.jsx";
import { InvoiceDetailPage } from "./pages/InvoiceDetailPage.jsx";
import { InvoiceValidationPage } from "./pages/InvoiceValidationPage.jsx";
import { CommissionReportPage } from "./pages/CommissionReportPage.jsx";
import { ProductPriceListPage } from "./pages/ProductPriceListPage.jsx";
import { UsersManagementPage } from "./pages/UsersManagementPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { PayoutHistoryPage } from "./pages/PayoutHistoryPage.jsx";
import { AuditLogsPage } from "./pages/AuditLogsPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "invoices", Component: InvoiceListPage },
      { path: "invoices/create", Component: CreateInvoicePage },
      { path: "invoices/*", Component: InvoiceDetailPage },
      { path: "invoice-validation", Component: InvoiceValidationPage },
      { path: "commission-reports", Component: CommissionReportPage },
      { path: "payout-history", Component: PayoutHistoryPage },
      { path: "price-list", Component: ProductPriceListPage },
      { path: "users", Component: UsersManagementPage },
      { path: "settings", Component: SettingsPage },
      { path: "audit-logs", Component: AuditLogsPage },
    ],
  },
]);
