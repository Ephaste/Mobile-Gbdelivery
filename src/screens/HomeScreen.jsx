import React, { useState, useEffect, useRef } from 'react';
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
import { useRoute } from '@react-navigation/native';
import Category from '../components/Category';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

// Debounce utility to limit API calls while typing
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const HomeScreen = ({ navigation }) => {
  const route = useRoute();
  const focusSearch = route.params?.focusSearch;

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const inputRef = useRef(null);

  useEffect(() => {
    if (focusSearch) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [focusSearch]);

  // Fetch all products initially (page 1)
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
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

      // Remove duplicates by product_id or id
      const seen = new Set();
      const unique = data.filter(item => {
        const key = item.product_id || item.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setProducts(unique);

      // Extract unique categories dynamically
      const dynamicCategories = ['All', ...new Set(data.map(p => p.subcategory))];
      setCategories(dynamicCategories);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  // New function: fetch products by search from API
  const fetchSearchProducts = async (search) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('action', 'GET_PRODUCTS_SEARCH_API');
      formData.append('search', search);
      formData.append('pageno', '1');
      formData.append('sortby', '');

      const res = await fetch('https://gbdelivering.com/action/select.php', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const data = await res.json();

      // Remove duplicates (same as before)
      const seen = new Set();
      const unique = data.filter(item => {
        const key = item.product_id || item.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setProducts(unique);

      // Update categories based on search results
      const dynamicCategories = ['All', ...new Set(data.map(p => p.subcategory))];
      setCategories(dynamicCategories);

      // Reset selected category when searching
      setSelectedCategory('All');
    } catch (e) {
      console.error('Failed to load search products', e);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of search to avoid too many requests
  const debouncedSearch = useRef(
    debounce((text) => {
      if (text.trim() === '') {
        fetchProducts(); // if search empty, load all products
      } else {
        fetchSearchProducts(text.trim());
      }
    }, 500)
  ).current;

  // Handler for search input change
  const handleSearchChange = (text) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  // Filter by selected category
  const filtered = products.filter(p => {
    return selectedCategory === 'All' || p.subcategory === selectedCategory;
  });

  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.container}>
      <Header />

      <View style={styles.searchContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearchChange}
          autoFocus={focusSearch}
        />
        <Fontisto name="search" size={20} color="#FF4500" />
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c}
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
      ) : filtered.length > 0 ? (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <ProductCard item={item} allProducts={products} navigation={navigation} />
          )}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products found.</Text>
        </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
});
