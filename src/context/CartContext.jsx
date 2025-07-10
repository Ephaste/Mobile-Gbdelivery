import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [initializing, setInitializing] = useState(true);

  // Load userId from AsyncStorage on startup
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('@userId');
        setUserId(id);
      } catch (e) {
        console.error('Failed to load userId from AsyncStorage', e);
      } finally {
        setInitializing(false);
      }
    };
    loadUserId();
  }, []);

  // Fetch cart when userId changes or on initial load (if userId exists)
  useEffect(() => {
    if (!initializing && userId) {
      fetchCart();
    } else if (!initializing && !userId) {
      setCartItems([]); // Clear cart if no user is logged in
    }
  }, [initializing, userId]);

  // Fetch cart items from backend
  const fetchCart = async () => {
    if (!userId) {
      console.warn('No userId, skipping cart fetch');
      setCartItems([]);
      return;
    }

    const form = new FormData();
    form.append('action', 'GET_CART_ITEMS_API');
    form.append('customer_id', userId);

    try {
      console.log('Fetching cart for user:', userId);
      const res = await fetch('https://gbdelivering.com/action/select.php', {
        method: 'POST',
        body: form,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const json = await res.json();
      console.log('Raw fetchCart response:', json);

      if (Array.isArray(json) && json[1]?.items) {
        setCartItems(json[1].items);
      } else {
        console.warn('Unexpected cart response shape:', json);
        setCartItems([]);
      }
    } catch (e) {
      console.error('fetchCart failed:', e.message);
      setCartItems([]);
    }
  };

  // Add item to cart and refetch
  const addToCart = async ({ id, price, quantity }) => {
    if (!userId) {
     // throw new Error('User not logged in. Please log in to add items to cart.');
     alert("Login first");
    }

    const form = new FormData();
    form.append('action', 'ADD_TO_CART_API');
    form.append('product_id', id.toString());
    form.append('customer_id', userId);
    form.append('product_quantity', quantity.toString());
    form.append('price', price.toString());

    try {
      console.log('Calling ADD_TO_CART_API with:', { id, price, quantity, userId });
      const res = await fetch('https://gbdelivering.com/action/insert.php', {
        method: 'POST',
        body: form,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const result = await res.json();
      console.log('ADD_TO_CART_API response:', result);

      const status = result[0]?.status;
      if (status === 'SUCCESS') {
        await fetchCart();
      } else {
        throw new Error(status || 'Failed to add item to cart');
      }
    } catch (e) {
      console.error('addToCart failed:', e.message);
      throw e;
    }
  };

  // Remove item from cart and refetch
  const removeFromCart = async (item_id) => {
    if (!userId) {
      console.warn('No userId, skipping removeFromCart');
      return;
    }

    const form = new FormData();
    form.append('action', 'DELETE_CART_ITEM_API');
    form.append('item_id', item_id.toString());
    form.append('customer_id', userId);

    try {
      console.log('Calling DELETE_CART_ITEM_API for:', { item_id, userId });
      const res = await fetch('https://gbdelivering.com/action/delete.php', {
        method: 'POST',
        body: form,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      await fetchCart();
    } catch (e) {
      console.error('removeFromCart failed:', e.message);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!userId) {
      console.warn('No userId, skipping clearCart');
      setCartItems([]);
      return;
    }

    const form = new FormData();
    form.append('action', 'CLEAR_CART_API');
    form.append('customer_id', userId);

    try {
      console.log('Calling CLEAR_CART_API for user:', userId);
      const res = await fetch('https://gbdelivering.com/action/delete.php', {
        method: 'POST',
        body: form,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      setCartItems([]);
    } catch (e) {
      console.error('clearCart failed:', e.message);
    }
  };

  // Update userId for login/logout (supports both email and Google Sign-In)
  const updateUserId = async (newUserId, authMethod = 'unknown') => {
    try {
      if (newUserId) {
        console.log(`Updating userId from ${authMethod}:`, newUserId);
        await AsyncStorage.setItem('@userId', newUserId);
        setUserId(newUserId);
      } else {
        console.log(`Clearing userId (logout from ${authMethod})`);
        await AsyncStorage.removeItem('@userId');
        setUserId(null);
        setCartItems([]);
      }
    } catch (e) {
      console.error(`Failed to update userId from ${authMethod} in AsyncStorage`, e);
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
        updateUserId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};