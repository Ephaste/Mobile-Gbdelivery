// src/screens/Login.js
import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import { CartContext } from '../../context/CartContext';

GoogleSignin.configure({
  webClientId: '390137378059-no9uicvcnlu04li5tcjhn00aos4r3o35.apps.googleusercontent.com',
  offlineAccess: false,
  scopes: ['profile', 'email'],
});

const Login = () => {
  const navigation = useNavigation();
  const { updateUserId } = useContext(CartContext); // Use CartContext
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const user = userInfo?.data?.user;
      if (!user || !user.email || !user.id) {
        throw new Error('User info is missing or incomplete');
      }

      console.log('Google user info:', user);

      // Build the exact structure your backend expects
      const userData = {
        id: user.id,
        givenName: user.givenName || '',
        familyName: user.familyName || '',
        email: user.email || '',
        gender: '',
        locale: '',
        photo: user.photo || '',
        link: '',
      };

      const form = new FormData();
      form.append('oauth_provider', 'google');
      form.append('userData', JSON.stringify(userData));

      console.log('Sending to backend:', {
        oauth_provider: 'google',
        userData: userData,
      });

      const response = await fetch('https://gbdelivering.com/action/login_google.php', {
        method: 'POST',
        body: form,
      });

      const rawText = await response.text();
      console.log('Google backend response:', rawText);

      let result;
      try {
        result = JSON.parse(rawText);
      } catch (err) {
        console.error('JSON Parse Error:', err);
        throw new Error('Invalid JSON returned from server: ' + rawText);
      }

      console.log('Parsed result:', result);

      if (result.status === 'success' && result.data) {
        const userData = result.data;

        console.log('Storing user data:', userData);

        // Save user info locally
        await AsyncStorage.multiSet([
          ['@token', userData.token || ''],
          ['@userId', userData.userid || ''],
          ['@firstName', userData.first_name || ''],
          ['@lastName', userData.last_name || ''],
          ['@email', userData.email || ''],
          ['@phone', userData.phone || ''],
          ['@picture', userData.picture || ''],
          ['@isLoggedIn', 'true'],
        ]);

        // Update CartContext with userId
        await updateUserId(userData.userid, 'google');

        // Verify data was stored
        const storedUserId = await AsyncStorage.getItem('@userId');
        console.log('Verification - Stored userId:', storedUserId);

        Alert.alert('Success', 'Google login successful', [
          {
            text: 'OK',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomeTab', params: { screen: 'Home' } }],
              }),
          },
        ]);
      } else {
        throw new Error(result.message || 'Google login failed - no data returned');
      }
    } catch (err) {
      console.error('❌ Google Sign-In Error:', err);
      Alert.alert('Error', 'Google login failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

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

      const rawResponse = await res.text();
      console.log('Raw backend response (username/password):', rawResponse);

      let users;
      try {
        users = JSON.parse(rawResponse);
      } catch (jsonError) {
        console.error('❌ JSON Parse Error:', jsonError.message);
        throw new Error('Invalid response from server');
      }

      console.log('✅ Backend login result:', users);

      if (Array.isArray(users) && users.length > 0 && users[0].status === 200) {
        const user = users[0];

        // Save user info locally
        await AsyncStorage.multiSet([
          ['@token', user.token || ''],
          ['@userId', user.userid.toString()],
          ['@firstName', user.first_name || ''],
          ['@lastName', user.last_name || ''],
          ['@email', user.email || ''],
          ['@phone', user.phone || ''],
          ['@picture', user.picture || ''],
          ['@isLoggedIn', 'true'],
        ]);

        // Update CartContext with userId
        await updateUserId(user.userid.toString(), 'email');

        Alert.alert('Success', 'Login successful', [
          {
            text: 'OK',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomeTab', params: { screen: 'Home' } }],
              }),
          },
        ]);
      } else {
        throw new Error(users[0]?.message || 'Invalid credentials or not approved');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.wrapper}>
      <Spinner visible={loading} textContent={'Logging in...'} overlayColor="rgba(0,0,0,0.1)" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.subtitle}>If you have an account with us, please login</Text>

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
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor="#777"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#777" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { marginTop: 10, backgroundColor: '#DB4437', borderWidth: 0 }]}
            onPress={handleGoogleSignIn}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>LOGIN WITH GOOGLE</Text>
          </TouchableOpacity>

          <View style={styles.newCustomerSection}>
            <Text style={styles.newCustomerTitle}>I'M A NEW CUSTOMER/SELLER</Text>
            <Text style={styles.newCustomerText}>
              By creating an account with our store, you will be able to move through the checkout process faster,
              store shipping addresses, view and track your orders in your account, and more.
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
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
});