import { Entypo, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../components/Header';
import { CartContext } from '../context/CartContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProductDetailsScreen = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { product: item } = params;
  const { addToCart } = useContext(CartContext);

  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const itemWithQuantity = { ...item, quantity };
    addToCart(itemWithQuantity);
    navigation.navigate('CartTab', { screen: 'CART' });
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Header />
        </View>

        <Image source={{ uri: item.image }} style={styles.coverImage} />

        <View style={styles.titlePriceRow}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.priceText}>{item.price} Rwf</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller information</Text>
          <View style={styles.infoRow}>
            <Entypo name="info" size={18} color="#FF4500" />
            <Text style={styles.infoText}>German Butchery Onlineshop</Text>
          </View>
          <View style={styles.infoRow}>
            <Entypo name="info" size={18} color="#FF4500" />
            <Text style={styles.infoText}>gbdelivering1@gmail.com</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated delivery time</Text>
          <View style={styles.infoRow}>
            <FontAwesome name="car" size={18} color="#FF4500" />
            <Text style={styles.infoText}>In Kigali 2025-05-06</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="car" size={18} color="#FF4500" />
            <Text style={styles.infoText}>Outside of Kigali 2025-05-09</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.buttonFull}
            onPress={() => navigation.navigate('CartStack', { screen: 'CHECKOUT' })}
          >
            <Text style={styles.buttonText}>Buy now</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { width: '70%' }]}
              onPress={handleAddToCart}
            >
              <Text style={styles.buttonText}>Add to cart</Text>
            </TouchableOpacity>

            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={decrementQuantity} style={styles.qtyButton}>
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity onPress={incrementQuantity} style={styles.qtyButton}>
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
  coverImage: {
    width: '100%',
    height: 280,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4500',
  },
  section: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#555',
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
    marginRight: 8,
  },
  buttonFull: {
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 45,
  },
  qtyButton: {
    padding: 6,
  },
  qtyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  qtyValue: {
    marginHorizontal: 10,
    fontSize: 16,
  },
});
