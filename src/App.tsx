import { Routes, Route } from 'react-router';
import { CartProvider } from './hooks/useCart';
import Home from './pages/Home';
import ShopPage from './pages/ShopPage';
import BrandsPage from './pages/BrandsPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Admin from './pages/Admin';
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CartProvider>
  );
}
