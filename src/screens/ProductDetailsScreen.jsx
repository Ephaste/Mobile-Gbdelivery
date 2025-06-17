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
  FlatList,
} from 'react-native';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProductDetailsScreen = () => {
  const navigation = useNavigation();
  const { userId, addToCart } = useContext(CartContext);
  const { product: item, imageUrl: initialImageUrl, allProducts = [] } =
    useRoute().params || {};

  const [quantity, setQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [loadingImage, setLoadingImage] = useState(true);
  const [related, setRelated] = useState([]);

  // reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [item?.id]);

  // 1) Fetch product image
  useEffect(() => {
    const productId = item?.id;
    if (!productId) {
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
          { method: 'POST', body: form }
        );
        const json = await res.json();
        const raw = json[0]?.trim();
        if (raw) {
          setImageUrl(
            raw.startsWith('http')
              ? raw
              : `https://gbdelivering.com/uploads/${raw}`
          );
        } else {
          setImageUrl(null);
        }
      } catch (err) {
        console.error('Failed to load image:', err);
        setImageUrl(null);
      } finally {
        setLoadingImage(false);
      }
    })();
  }, [item]);

  // 2) Filter related products
  useEffect(() => {
    if (allProducts.length && item?.subcategory) {
      setRelated(
        allProducts.filter(
          p => p.subcategory === item.subcategory && p.id !== item.id
        )
      );
    }
  }, [allProducts, item]);

  // 3) Handle add to cart
  const handleAddToCart = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please log in first.', [
        { text: 'OK', onPress: () => navigation.navigate('AccountTab', { screen: 'Login' }) },
      ]);
      return;
    }
    if (!item?.id) {
      Alert.alert('Error', 'Invalid product.');
      return;
    }
    try {
      await addToCart({ id: item.id, price: item.price, quantity });
      Alert.alert('Success', 'Item added to cart!', [
        { text: 'OK', onPress: () => navigation.navigate('CartTab',{screen:'Cart'} ) },
      ]);
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert('Error', err.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    if (!userId) {
      Alert.alert('Error', 'Please log in first.', [
        { text: 'OK', onPress: () => navigation.navigate('AccountTab', { screen: 'Login' }) },
      ]);
      return;
    }
    navigation.navigate('CartTab', {
  screen: 'Newaddress',
  params: {
    amountToPay: item.price * quantity,
    productId: item.id,
    quantity,
    fromDetails: true,
  },
});

  };

  return (
    <LinearGradient colors={['#fff', '#fff']} style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Header />
        </View>

        {loadingImage ? (
          <ActivityIndicator size="large" color="#FF4500" style={styles.coverImage} />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.noImage]}>
            <Text>No Image Available</Text>
          </View>
        )}

        <View style={styles.titlePriceRow}>
          <Text style={styles.titleText}>{item?.name}</Text>
          <Text style={styles.priceText}>
            {item?.price != null ? `${item.price} Rwf` : '—'}
          </Text>
        </View>

        {/* Quantity + Add to Cart + Checkout */}
        <View style={styles.buttonsContainer}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { width: '70%' }]}
              onPress={handleAddToCart}
            >
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => setQuantity(q => Math.max(q - 1, 1))}
                style={styles.qtyButton}
              >
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(q => q + 1)}
                style={styles.qtyButton}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.totalText}>
            Total: {item?.price ? item.price * quantity : 0} Rwf
          </Text>

          {/* Buy Now / Checkout */}
          <TouchableOpacity
            style={[styles.button, { marginTop: 10 }]}
            onPress={handleAddToCart}
          >
            <Text style={styles.buttonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Related Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Products</Text>
          {related.length === 0 ? (
            <Text style={styles.emptyText}>No related products found.</Text>
          ) : (
            <FlatList
              data={related}
              numColumns={3}
              keyExtractor={p => p.id.toString()}
              renderItem={({ item: rel }) => (
                <TouchableOpacity
                  style={styles.productCardWrapper}
                  onPress={() =>
                    navigation.push('ProductDetails', {
                      product: rel,
                      imageUrl: rel.imageUrl,
                      allProducts,
                    })
                  }
                >
                  <ProductCard item={rel} allProducts={allProducts} />
                </TouchableOpacity>
              )}
              nestedScrollEnabled
              contentContainerStyle={{ paddingBottom: 60 }}
            />
          )}
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
  noImage: { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  titleText: { fontSize: 18, fontWeight: '600', flex: 1, color: '#333' },
  priceText: { fontSize: 16, fontWeight: '600', color: '#FF4500', paddingLeft: 8 },
  buttonsContainer: { paddingHorizontal: 14, marginTop: 16 },
  button: {
    backgroundColor: '#FF4500',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
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
  totalText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 8,
    color: '#333',
  },
  section: { paddingHorizontal: 14, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#333' },
  emptyText: { fontSize: 14, color: '#666' },
  productCardWrapper: {
    flex: 1,
    maxWidth: '32%',
    marginHorizontal: 4,
    marginVertical: 6,
  },
});
