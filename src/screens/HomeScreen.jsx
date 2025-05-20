import React, { useState, useEffect } from 'react';
import { Fontisto } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import Category from '../components/Category';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const formData = new FormData();
        formData.append('action', 'GET_PRODUCTS_PAGES_API');
        formData.append('pageno', '1');

        const res = await fetch('https://gbdelivering.com/action/select.php', {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },
          body: formData,
        });

        const data = await res.json();
        setProducts(data);

        // Dynamically extract unique categories from the products
        const dynamicCategories = ['All', ...new Set(data.map(p => p.subcategory))];
        setCategories(dynamicCategories);
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered = selectedCategory === 'All'
    ? products
    : products.filter(p => p.subcategory === selectedCategory);

  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.container}>
      <Header />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search"
        />
        <Fontisto name="search" size={20} color="#FF4500" />
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c}
          renderItem={({ item }) => (
            <Category
              title={item}
              isSelected={item === selectedCategory}
              onSelect={() => setSelectedCategory(item)}
            />
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF4500" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => <ProductCard item={item} />}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </LinearGradient>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#FF4500',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    alignItems: 'center',
    marginTop: 20,
  },
  categoryContainer: {
    marginTop: 20,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
