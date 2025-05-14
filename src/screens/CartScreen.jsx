import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Header from '../components/Header';
import CartCard from '../components/CartCard';
import { LinearGradient } from 'expo-linear-gradient';
import { CartContext } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
  const { carts } = useContext(CartContext);
  const navigation = useNavigation();

  const totalPrice = carts.reduce(
    (total, item) => total + parseFloat(item.price) * item.quantity,
    0
  );

  if (carts.length === 0) {
    return (
      <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.container}>
        <Header isCart={true} />
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty!</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.container}>
      <Header isCart={true} />

      <FlatList
        data={carts}
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <CartCard product={item} />}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={
          <>
            <View style={styles.priceContainer}>
              <View style={styles.divider}></View>
              <View style={styles.priceAndTitle}>
                <Text style={styles.text}>Total:</Text>
                <Text style={[styles.text, { color: 'black', fontWeight: '700' }]}>
                  {totalPrice.toFixed(2)} Rwf
                </Text>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('CartTab', { screen: 'CHECKOUT' })}
              >
                <Text style={styles.buttonText}>Check Out</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 30,
  },
  priceContainer: {
    marginTop: 40,
  },
  priceAndTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  text: {
    color: '#757575',
    fontSize: 16,
  },
  buttonsContainer: {
    paddingHorizontal: 14,
    marginTop: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF4500',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    borderWidth: 1,
    borderColor: '#C0C0C0',
    marginVertical: 10,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#757575',
  },
});
