import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InvoiceListPage } from "./pages/InvoiceListPage";
import { CreateInvoicePage } from "./pages/CreateInvoicePage";
import { InvoiceDetailPage } from "./pages/InvoiceDetailPage";
import { InvoiceValidationPage } from "./pages/InvoiceValidationPage";
import { CommissionReportPage } from "./pages/CommissionReportPage";
import { ProductPriceListPage } from "./pages/ProductPriceListPage";
import { UsersManagementPage } from "./pages/UsersManagementPage";
import { SettingsPage } from "./pages/SettingsPage";

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
      { path: "invoices/:id", Component: InvoiceDetailPage },
      { path: "invoice-validation", Component: InvoiceValidationPage },
      { path: "commission-reports", Component: CommissionReportPage },
      { path: "price-list", Component: ProductPriceListPage },
      { path: "users", Component: UsersManagementPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);