import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SearchProvider } from './context/SearchContext';
import { ThemeProvider } from './context/ThemeContext';

import { LuxuryLoader } from './components/common/LuxuryLoader';
import { ScrollToTop } from './components/common/ScrollToTop';

import { HomePage } from './pages/HomePage';
import { RouteLoader } from './components/common/RouteLoader';
import { CustomerProtectedRoute, CustomerGuestRoute } from './components/common/CustomerRoute';

// Lazy-loaded Public Storefront Pages
const CollectionPage = React.lazy(() => import('./pages/CollectionPage').then(m => ({ default: m.CollectionPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const BespokePage = React.lazy(() => import('./pages/BespokePage').then(m => ({ default: m.BespokePage })));
const CraftPage = React.lazy(() => import('./pages/CraftPage').then(m => ({ default: m.CraftPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const JournalPage = React.lazy(() => import('./pages/JournalPage').then(m => ({ default: m.JournalPage })));
const JournalArticlePage = React.lazy(() => import('./pages/JournalArticlePage').then(m => ({ default: m.JournalArticlePage })));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderTrackingPage = React.lazy(() => import('./pages/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-loaded Customer Account & Portal Pages
const CustomerLoginPage = React.lazy(() => import('./pages/account/CustomerLoginPage').then(m => ({ default: m.CustomerLoginPage })));
const CustomerRegisterPage = React.lazy(() => import('./pages/account/CustomerRegisterPage').then(m => ({ default: m.CustomerRegisterPage })));
const CustomerForgotPasswordPage = React.lazy(() => import('./pages/account/CustomerForgotPasswordPage').then(m => ({ default: m.CustomerForgotPasswordPage })));
const CustomerResetPasswordPage = React.lazy(() => import('./pages/account/CustomerResetPasswordPage').then(m => ({ default: m.CustomerResetPasswordPage })));
const CustomerDashboardPage = React.lazy(() => import('./pages/account/CustomerDashboardPage').then(m => ({ default: m.CustomerDashboardPage })));
const CustomerOrdersPage = React.lazy(() => import('./pages/account/CustomerOrdersPage').then(m => ({ default: m.CustomerOrdersPage })));
const CustomerOrderDetailPage = React.lazy(() => import('./pages/account/CustomerOrderDetailPage').then(m => ({ default: m.CustomerOrderDetailPage })));
const CustomerBespokePage = React.lazy(() => import('./pages/account/CustomerBespokePage').then(m => ({ default: m.CustomerBespokePage })));
const CustomerBespokeDetailPage = React.lazy(() => import('./pages/account/CustomerBespokeDetailPage').then(m => ({ default: m.CustomerBespokeDetailPage })));
const CustomerSavedItemsPage = React.lazy(() => import('./pages/account/CustomerSavedItemsPage').then(m => ({ default: m.CustomerSavedItemsPage })));
const CustomerAddressesPage = React.lazy(() => import('./pages/account/CustomerAddressesPage').then(m => ({ default: m.CustomerAddressesPage })));
const CustomerProfilePage = React.lazy(() => import('./pages/account/CustomerProfilePage').then(m => ({ default: m.CustomerProfilePage })));
const CustomerSecurityPage = React.lazy(() => import('./pages/account/CustomerSecurityPage').then(m => ({ default: m.CustomerSecurityPage })));

// Lazy-loaded Admin Atelier Pages
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboardOverview = React.lazy(() => import('./pages/admin/AdminDashboardOverview').then(m => ({ default: m.AdminDashboardOverview })));
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminBespokePage = React.lazy(() => import('./pages/admin/AdminBespokePage').then(m => ({ default: m.AdminBespokePage })));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

import { AppLayout } from './components/app/AppLayout';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] selection:bg-[#B89B5E] selection:text-[#0A0A0A]">
        <ScrollToTop />
        <LuxuryLoader />
        <React.Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardOverview />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="bespoke" element={<AdminBespokePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#F5F1E8] selection:bg-[#B89B5E] selection:text-[#0A0A0A]">
      <ScrollToTop />
      <LuxuryLoader />

      <AppLayout>
        <React.Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public Storefront Application Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/bespoke" element={<BespokePage />} />
            <Route path="/craft" element={<CraftPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:slug" element={<JournalArticlePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/track" element={<OrderTrackingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Customer Authentication Routes (Guest Only) */}
            <Route path="/account/login" element={<CustomerGuestRoute><CustomerLoginPage /></CustomerGuestRoute>} />
            <Route path="/account/register" element={<CustomerGuestRoute><CustomerRegisterPage /></CustomerGuestRoute>} />
            <Route path="/account/forgot-password" element={<CustomerGuestRoute><CustomerForgotPasswordPage /></CustomerGuestRoute>} />
            <Route path="/account/reset-password" element={<CustomerGuestRoute><CustomerResetPasswordPage /></CustomerGuestRoute>} />

            {/* Customer Portal Protected Routes */}
            <Route path="/account" element={<CustomerProtectedRoute><CustomerDashboardPage /></CustomerProtectedRoute>} />
            <Route path="/account/orders" element={<CustomerProtectedRoute><CustomerOrdersPage /></CustomerProtectedRoute>} />
            <Route path="/account/orders/:orderId" element={<CustomerProtectedRoute><CustomerOrderDetailPage /></CustomerProtectedRoute>} />
            <Route path="/account/bespoke" element={<CustomerProtectedRoute><CustomerBespokePage /></CustomerProtectedRoute>} />
            <Route path="/account/bespoke/:inquiryId" element={<CustomerProtectedRoute><CustomerBespokeDetailPage /></CustomerProtectedRoute>} />
            <Route path="/account/saved" element={<CustomerProtectedRoute><CustomerSavedItemsPage /></CustomerProtectedRoute>} />
            <Route path="/account/addresses" element={<CustomerProtectedRoute><CustomerAddressesPage /></CustomerProtectedRoute>} />
            <Route path="/account/profile" element={<CustomerProtectedRoute><CustomerProfilePage /></CustomerProtectedRoute>} />
            <Route path="/account/security" element={<CustomerProtectedRoute><CustomerSecurityPage /></CustomerProtectedRoute>} />
            <Route path="/account/*" element={<CustomerProtectedRoute><CustomerDashboardPage /></CustomerProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
      </AppLayout>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ProductProvider>
        <AdminAuthProvider>
          <CustomerAuthProvider>
            <OrderProvider>
              <CartProvider>
                <WishlistProvider>
                  <SearchProvider>
                    <ThemeProvider>
                      <AppContent />
                    </ThemeProvider>
                  </SearchProvider>
                </WishlistProvider>
              </CartProvider>
            </OrderProvider>
          </CustomerAuthProvider>
        </AdminAuthProvider>
      </ProductProvider>
    </BrowserRouter>
  );
}

export default App;
