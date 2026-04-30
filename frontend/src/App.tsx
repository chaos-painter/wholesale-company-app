import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminPage from "./pages/AdminPage";

const routes = [
  { path: "/", element: <HomePage />, protected: false },
  { path: "/login", element: <LoginPage />, protected: false },
  { path: "/register", element: <RegisterPage />, protected: false },
  { path: "/catalog", element: <CatalogPage />, protected: false },
  { path: "/product/:id", element: <ProductPage />, protected: false },
  { path: "/cart", element: <CartPage />, protected: true },
  { path: "/orders", element: <OrdersPage />, protected: true },
  { path: "/orders/:id", element: <OrderDetailPage />, protected: true },
  {
    path: "/admin",
    element: <AdminPage />,
    protected: true,
    requireManager: true,
  },
];

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {routes.map(
              ({ path, element, protected: isProtected, requireManager }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    isProtected ? (
                      <ProtectedRoute requireManager={requireManager}>
                        {element}
                      </ProtectedRoute>
                    ) : (
                      element
                    )
                  }
                />
              ),
            )}
            <Route path="*" element={<Navigate to="/catalog" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
