import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [carts, setCarts] = useState([]);

  // Load cart items when the app starts
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const storedCarts = await AsyncStorage.getItem('carts');
        if (storedCarts) {
          setCarts(JSON.parse(storedCarts));
        }
      } catch (error) {
        console.error('Failed to load cart items:', error);
      }
    };

    loadCartItems();
  }, []);

  // Add item to cart and persist
  const addToCart = async (item) => {
    const itemExist = carts.findIndex((cart) => cart.id === item.id);
    if (itemExist === -1) {
      const newCartItems = [...carts, item];
      setCarts(newCartItems);
      await AsyncStorage.setItem('carts', JSON.stringify(newCartItems));
    }
  };

  // Remove item and update AsyncStorage
  const removeFromCart = async (id) => {
    const newCartItems = carts.filter((item) => item.id !== id);
    setCarts(newCartItems);
    await AsyncStorage.setItem('carts', JSON.stringify(newCartItems));
  };

  const value = {
    carts,
    addToCart,
    removeFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
