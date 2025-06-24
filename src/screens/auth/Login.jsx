import React, { useState, useEffect } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';

WebBrowser.maybeCompleteAuthSession();

// ✅ Correct Web Client ID for your project
const CLIENT_ID = '390137378059-sgnh5ntccld040v9c5jl92cbl7e1n3ho.apps.googleusercontent.com';

const Login = () => {

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
console.log("🔗 Redirect URI:", redirectUri);

  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Google OAuth discovery config
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

  //const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['profile', 'email'],
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { accessToken } = response.authentication;
      fetchUserData(accessToken);
    }
  }, [response]);

  const fetchUserData = async (token) => {
    try {
      setLoading(true);
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await res.json();

      // Send user info to backend
      const data = new FormData();
      data.append('oauth_provider', 'google');
      data.append('userData', JSON.stringify(userInfo));

      const backendRes = await fetch('https://gbdelivering.com/action/login_google.php', {
        method: 'POST',
        body: data,
      });

      const backendResult = await backendRes.text();
      console.log('✅ Backend login result:', backendResult);

      // Store user info locally
      await AsyncStorage.setItem('@firstName', userInfo.given_name || '');
      await AsyncStorage.setItem('@lastName', userInfo.family_name || '');
      await AsyncStorage.setItem('@email', userInfo.email || '');
      await AsyncStorage.setItem('@picture', userInfo.picture || '');

      Alert.alert('Success', 'Login with Google successful', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('HomeTab', { screen: 'Home' }),
        },
      ]);
    } catch (error) {
      console.error('❌ Google Login Error:', error);
      Alert.alert('Error', 'Failed to login with Google');
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

      const users = await res.json();

      if (Array.isArray(users) && users.length > 0 && users[0].status === 200) {
        const user = users[0];

        if (user.token) {
          await AsyncStorage.setItem('@token', user.token);
        }

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
            onPress={() => promptAsync({ useProxy: true })}
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

// your styles remain unchanged

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
