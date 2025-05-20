// src/screens/ProductDetailsScreen.js

import { Entypo, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Header from '../components/Header';
import { CartContext } from '../context/CartContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProductDetailsScreen = () => {
  const navigation = useNavigation();
  const { userId, addToCart } = useContext(CartContext);
  const { product: item, imageUrl: initialImageUrl } = useRoute().params || {};

  const [quantity, setQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const productId = item?.id;
    console.log('Loading images for product:', productId);

    if (!productId) {
      console.warn('⚠️ No product.id provided, cannot fetch images');
      setLoadingImage(false);
      return;
    }

    (async () => {
      const form = new FormData();
      form.append('action', 'GET_PRODUCT_IMAGES_API');
      form.append('product_id', productId);

      try {
        const res = await fetch(
          'https://gbdelivering.com/action/select.php',
          {
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            body: form,
          }
        );
        const json = await res.json();
        console.log('Image fetch response for product', productId, json);

        // json[0] may already be a full URL or just a filename
        const raw = json[0]?.trim();
        if (raw) {
          const full =
            raw.startsWith('http')
              ? raw
              : `https://gbdelivering.com/uploads/${raw}`;
          setImageUrl(full);
        } else {
          console.log('No image returned for product:', productId);
          setImageUrl(null);
        }
      } catch (err) {
        console.error('Failed to load image for product:', productId, err);
        setImageUrl(null);
      } finally {
        setLoadingImage(false);
      }
    })();
  }, [item]);

  const handleAddToCart = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please log in first.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('AccountTab', { screen: 'Login' }),
        },
      ]);
      return;
    }

    const productId = item?.id;
    console.log('Adding product to cart:', productId, 'quantity:', quantity);

    if (!productId) {
      Alert.alert('Error', 'Invalid product. Cannot add to cart.');
      return;
    }

    try {
      await addToCart({
        id: productId,
        price: item.price,
        quantity,
      });

      Alert.alert('Success', 'Item added to cart!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('CartTab', { screen: 'Cart' }),
        },
      ]);
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert('Error', err.message || 'Failed to add to cart');
    }
  };

  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Header />
        </View>

        {loadingImage ? (
          <ActivityIndicator
            size="large"
            color="#FF4500"
            style={styles.coverImage}
          />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.coverImage} />
        ) : (
          <View
            style={[
              styles.coverImage,
              {
                backgroundColor: '#eee',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Text>No Image Available</Text>
          </View>
        )}

        <View style={styles.titlePriceRow}>
          <Text style={styles.titleText}>{item?.name}</Text>
          <Text style={styles.priceText}>
            {item?.price != null ? `${item.price} Rwf` : '—'}
          </Text>
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
            onPress={() =>
              navigation.navigate('CartStack', { screen: 'CHECKOUT' })
            }
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
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(q - 1, 1))}
                style={styles.qtyButton}
              >
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.qtyButton}
              >
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
  container: { flex: 1 },
  headerContainer: { padding: 12, backgroundColor: '#fff' },
  coverImage: { width: '100%', height: 280 },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  titleText: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1 },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4500',
    paddingLeft: 8,
  },
  section: { paddingHorizontal: 14, paddingVertical: 8 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  infoText: { marginLeft: 8, fontSize: 15, color: '#555' },
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
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 45,
  },
  qtyButton: { padding: 6 },
  qtyText: { fontSize: 20, fontWeight: 'bold' },
  qtyValue: { marginHorizontal: 10, fontSize: 16 },
});
