// src/context/CartContext.js

import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [initializing, setInitializing] = useState(true);

  // Load userId on startup
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem('@userId');
      setUserId(id);
      setInitializing(false);
    })();
  }, []);

  // Whenever userId changes (i.e. login), fetch the cart
  useEffect(() => {
    if (!initializing && userId) {
      fetchCart();
    }
  }, [initializing, userId]);

  // Fetch cart items from backend
  const fetchCart = async () => {
    const form = new FormData();
    form.append('action', 'GET_CART_ITEMS_API');
    form.append('customer_id', userId || '');

    try {
      console.log('Fetching cart for user:', userId);
      const res = await fetch('https://gbdelivering.com/action/select.php', {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      console.log('Raw fetchCart response:', json);

      // Your API returns [ {status}, {items: [...]}, {sub_total} ]
      if (Array.isArray(json) && json[1]?.items) {
        setCartItems(json[1].items);
      } else {
        console.warn('Unexpected cart shape, setting empty', json);
        setCartItems([]);
      }
    } catch (e) {
      console.error('fetchCart failed', e);
      setCartItems([]);
    }
  };

  // Add an item, then immediately refetch cart
  const addToCart = async ({ id, price, quantity }) => {
    if (!userId) {
      throw new Error('User not logged in');
    }

    const form = new FormData();
    form.append('action', 'ADD_TO_CART_API');
    form.append('product_id', id.toString());
    form.append('customer_id', userId.toString());
    form.append('product_quantity', quantity.toString());
    form.append('price', price.toString());

    try {
      console.log('Calling ADD_TO_CART_API with:', { id, price, quantity, userId });
      const res = await fetch('https://gbdelivering.com/action/insert.php', {
        method: 'POST',
        body: form,
      });
      const result = await res.json();
      console.log('ADD_TO_CART_API response:', result);

      const status = result[0]?.status;
      if (status === 'SUCCESS') {
        await fetchCart();
      } else {
        throw new Error(status || 'Add to cart failed');
      }
    } catch (e) {
      console.error('addToCart failed', e);
      throw e;
    }
  };

  // Remove a single item, then refetch
  const removeFromCart = async (item_id) => {
    const form = new FormData();
    form.append('action', 'DELETE_CART_ITEM_API');
    form.append('item_id', item_id.toString());

    try {
      console.log('Calling DELETE_CART_ITEM_API for:', item_id);
      await fetch('https://gbdelivering.com/action/delete.php', {
        method: 'POST',
        body: form,
      });
      await fetchCart();
    } catch (e) {
      console.error('removeFromCart failed', e);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    const form = new FormData();
    form.append('action', 'CLEAR_CART_API');
    form.append('customer_id', userId.toString());

    try {
      console.log('Calling CLEAR_CART_API for user:', userId);
      await fetch('https://gbdelivering.com/action/delete.php', {
        method: 'POST',
        body: form,
      });
      setCartItems([]);
    } catch (e) {
      console.error('clearCart failed', e);
    }
  };

  return (
    <CartContext.Provider
      value={{
        userId,
        cartItems,
        initializing,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
