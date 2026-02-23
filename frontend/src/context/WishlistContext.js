import React, { createContext, useState, useEffect, useContext } from 'react';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('urbunfy_wishlist');
    if (saved) {
      try {
        setWishlistItems(JSON.parse(saved));
      } catch {
        setWishlistItems([]);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('urbunfy_wishlist', JSON.stringify(wishlistItems));
    setWishlistCount(wishlistItems.length);
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleWishlist = (product) => {
    const exists = wishlistItems.find((item) => item.id === product.id);
    if (exists) {
      removeFromWishlist(product.id);
      return false; // removed
    } else {
      addToWishlist(product);
      return true; // added
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('urbunfy_wishlist');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export default WishlistContext;