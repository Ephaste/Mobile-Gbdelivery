import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';
import CartCard from '../components/CartCard';
import { LinearGradient } from 'expo-linear-gradient';
import { CartContext } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
  const { cartItems, initializing, removeFromCart, clearCart } =
    useContext(CartContext);
  const navigation = useNavigation();

  if (initializing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <LinearGradient colors={['#f2f2f2', '#ffffff']} style={styles.container}>
        <Header isCart />
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty!</Text>
        </View>
      </LinearGradient>
    );
  }

  const total = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.cart_item_price || 0) *
        (item.cart_item_product_quantity || 0),
    0
  );

  return (
    <LinearGradient colors={['#f2f2f2', '#ffffff']} style={styles.container}>
      <Header isCart />

      <FlatList
        data={cartItems}
        keyExtractor={i => i.item_id.toString()}
        renderItem={({ item }) => (
          <CartCard
            product={{
              id: item.item_id,
              name: item.name,
              price: item.cart_item_price,
              quantity: item.cart_item_product_quantity,
              image: `https://gbdelivering.com/uploads/${item.photo}`,
            }}
            onRemove={() => removeFromCart(item.item_id)}
          />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.total}>
              Total: {total.toFixed(2)} Rwf
            </Text>

            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={() =>
                Alert.alert(
                  'Clear Cart',
                  'Are you sure you want to clear your cart?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes', onPress: () => clearCart() },
                  ]
                )
              }
            >
              <Text style={styles.buttonText}>Clear Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate('Newaddress')
              }
            >
              <Text style={styles.buttonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </LinearGradient>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 20 },
  total: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#FF4500',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 6,
  },
  clearButton: { backgroundColor: '#888' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: { fontSize: 18, color: '#757575' },
});
