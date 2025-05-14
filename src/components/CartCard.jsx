import { StyleSheet, Text, Image, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';

const CartCard = ({ product: item }) => {
  const { removeFromCart } = useContext(CartContext);

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.coverImage} />
      <View style={styles.CardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>
          {item.price} Rwf × {item.quantity} = {(item.price * item.quantity).toFixed(2)} Rwf
        </Text>
      </View>

      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
        <FontAwesome6 name="trash" color="#F68CB5" size={25} />
      </TouchableOpacity>
    </View>
  );
};

export default CartCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    flexDirection: 'row',
    paddingRight: 15,
    paddingLeft: 10,
  },
  coverImage: {
    height: 125,
    width: '30%',
  },
  CardContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    color: '#444444',
    fontSize: 18,
    fontWeight: '500',
  },
  price: {
    color: '#797979',
    marginVertical: 10,
    fontSize: 16,
  },
});
