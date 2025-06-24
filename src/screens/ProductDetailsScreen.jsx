// src/screens/ProductDetailsScreen.js

import { Entypo, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
} from 'react-native';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProductDetailsScreen = () => {
  const navigation = useNavigation();
  const { userId, addToCart } = useContext(CartContext);
  const { product: item, imageUrl: initialImageUrl, allProducts = [] } = useRoute().params || {};

  const [quantity, setQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [loadingImage, setLoadingImage] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setQuantity(1);
  }, [item?.id]);

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
        const res = await fetch('https://gbdelivering.com/action/select.php', {
          method: 'POST',
          body: form,
        });
        const json = await res.json();
        const raw = json[0]?.trim();
        if (raw) {
          setImageUrl(
            raw.startsWith('http') ? raw : `https://gbdelivering.com/uploads/${raw}`
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

  useEffect(() => {
    if (allProducts.length && item?.subcategory) {
      setRelated(allProducts.filter(p => p.subcategory === item.subcategory && p.id !== item.id));
    }
  }, [allProducts, item]);

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
      await addToCart({ id: item.id, price: item.price, quantity: parseFloat(quantity) });
      Alert.alert('Success', 'Item added to cart!', [
        { text: 'OK', onPress: () => navigation.navigate('CartTab', { screen: 'Cart' }) },
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
        amountToPay: item.price * parseFloat(quantity),
        productId: item.id,
        quantity: parseFloat(quantity),
        fromDetails: true,
      },
    });
  };

  const HeaderContent = () => (
    <LinearGradient colors={['#fff', '#fff']} style={styles.headerBackground}>
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

      <View style={styles.buttonsContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, { width: '70%' }]} onPress={handleAddToCart}>
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => setQuantity(q => Math.max(parseFloat(q) - 1, 0.1))} style={styles.qtyButton}>
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.qtyInput}
              value={quantity.toString()}
              onChangeText={text => {
                const valid = text.replace(/[^0-9.]/g, '');
                setQuantity(valid);
              }}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity onPress={() => setQuantity(q => (parseFloat(q) + 1).toString())} style={styles.qtyButton}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.totalText}>
          Total: {item?.price ? (item.price * parseFloat(quantity)).toFixed(2) : '0.00'} Rwf
        </Text>

        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={handleBuyNow}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Related Products</Text>
      </View>
    </LinearGradient>
  );

  return (
    <FlatList
      ListHeaderComponent={HeaderContent}
      data={related}
      numColumns={2}
      columnWrapperStyle={styles.relatedRow}
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
      contentContainerStyle={{ paddingBottom: 60 }}
      ListEmptyComponent={<Text style={styles.emptyText}>No related products found.</Text>}
    />
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackground: { backgroundColor: '#fff' },
  headerContainer: { padding: 12 },
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
  qtyInput: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  totalText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 8,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  emptyText: { fontSize: 14, color: '#666', padding: 14 },
  productCardWrapper: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 14,
  },
  relatedRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
});
