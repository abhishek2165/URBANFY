import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// Common Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import SplashScreen from "./components/common/SplashScreen";

// Pages
import Home from "./pages/Home";
import Perfumes from "./pages/Perfumes";
import Attars from "./pages/Attars";
import BodyMists from "./pages/BodyMists";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";
import About from "./pages/About";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Session madhe check kar - splash aadhi disel ka
    // Fakt pehilyanda website open keli tevhach disel
    const splashShown = sessionStorage.getItem("urbunfy_splash");
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem("urbunfy_splash", "true");
  };

  // Splash Screen - fakt pehilyanda disel
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="App">
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/perfumes" element={<Perfumes />} />
                  <Route path="/attars" element={<Attars />} />
                  <Route path="/bodymists" element={<BodyMists />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
