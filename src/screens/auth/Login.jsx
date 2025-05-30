// src/screens/Login.js

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';

const Login = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }
    setLoading(true);

    try {
      const form = new FormData();
      form.append('username', username.trim());
      form.append('password', password);

      const res = await fetch('https://gbdelivering.com/action/login_api.php', {
        method: 'POST',
        body: form,
      });

      const users = await res.json();

      console.log('✅ Login API raw response:', users);

      if (Array.isArray(users) && users.length > 0 && users[0].status === 200) {
        const user = users[0];

        if (user.token) {
          console.log('✅ Token received:', user.token);
          await AsyncStorage.setItem('@token', user.token);
        } else {
          console.warn('⚠️ No token found in response');
        }

        // Store user info for later use
        await AsyncStorage.setItem('@userId', user.userid.toString());
        await AsyncStorage.setItem('@firstName', user.first_name || '');
        await AsyncStorage.setItem('@lastName', user.last_name || '');
        await AsyncStorage.setItem('@email', user.email || '');
        await AsyncStorage.setItem('@phone', user.phone || '');

        Alert.alert('Success', 'Login successful', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('HomeTab', { screen: 'Home' }),
          },
        ]);
      } else {
        Alert.alert('Error', 'Invalid credentials or not approved');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.wrapper}>
      <Spinner
        visible={loading}
        textContent={'Logging in...'}
        overlayColor="rgba(0, 0, 0, 0.1)"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.subtitle}>
            If you have an account with us, please login
          </Text>

          <Text style={styles.label}>USERNAME OR E-MAIL *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username/Email"
            placeholderTextColor="#777"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="username"
          />

          <Text style={styles.label}>PASSWORD *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor="#777"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoComplete="password"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>

          <View style={styles.newCustomerSection}>
            <Text style={styles.newCustomerTitle}>
              I'M A NEW CUSTOMER/SELLER
            </Text>
            <Text style={styles.newCustomerText}>
              By creating an account with our store, you will be able to move
              through the checkout process faster, store shipping addresses,
              view and track your orders in your account, and more.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.buttonText}>CREATE AN ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Login;

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 25,
    padding: 14,
    backgroundColor: 'white',
    borderColor: 'orangered',
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'orangered',
    fontWeight: 'bold',
    fontSize: 16,
  },
  newCustomerSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  newCustomerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  newCustomerText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
});
