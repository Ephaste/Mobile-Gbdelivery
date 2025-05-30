// src/screens/DPO.js

import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DPO = ({ route, navigation }) => {
  const mounted = useRef(true);
  const [token, setToken] = useState(null);
  const [displayText, setDisplayText] = useState('Initializing payment…');
  const [loading, setLoading] = useState(true);

  const { userId, orderDesc, amount, email } = route.params;

  const loadUserData = async () => {
    const firstName = (await AsyncStorage.getItem('@firstName')) || '';
    const lastName = (await AsyncStorage.getItem('@lastName')) || '';
    const phoneNo = (await AsyncStorage.getItem('@phone')) || '';
    const province = (await AsyncStorage.getItem('@province')) || '';
    const district = (await AsyncStorage.getItem('@district')) || '';
    const sector = (await AsyncStorage.getItem('@sector')) || '';
    const cell = (await AsyncStorage.getItem('@cell')) || '';
    const village = (await AsyncStorage.getItem('@village')) || '';
    const street = (await AsyncStorage.getItem('@street')) || '';
    const describedAddress = (await AsyncStorage.getItem('@describedAddress')) || '';

    return {
      firstName,
      lastName,
      phoneNo,
      province,
      district,
      sector,
      cell,
      village,
      street,
      describedAddress,
    };
  };

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await loadUserData();
        setDisplayText('Creating payment order…');
        const form = new FormData();
        form.append('action', 'ORDER_CHECKOUT_CARD_DPO');
        form.append('customer_id', userId);
        form.append('first_name', userData.firstName);
        form.append('last_name', userData.lastName);
        form.append('email', email);
        form.append('phone_no', userData.phoneNo);
        form.append('province', userData.province);
        form.append('district', userData.district);
        form.append('sector', userData.sector);
        form.append('cell', userData.cell);
        form.append('village', userData.village);
        form.append('street', userData.street);
        form.append('described_address', userData.describedAddress);
        form.append('order_description', orderDesc);
        form.append('amount', amount.toString());

        const res = await fetch('https://gbdelivering.com/action/insert.php', {
          method: 'POST',
          body: form,
        });

        const text = await res.text();
        console.log('Raw response from backend:', text);

        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error(text);
        }

        if (!json.token) {
          throw new Error(json.error || 'No token returned');
        }

        // --- FIX: extract token string if token is an object ---
        let tokenStr;
        if (typeof json.token === 'object' && json.token !== null) {
          if ('0' in json.token) {
            tokenStr = json.token['0'];
          } else {
            // fallback, stringify object to avoid breaking
            tokenStr = JSON.stringify(json.token);
          }
        } else {
          tokenStr = json.token; // already string or other type
        }

        if (mounted.current) {
          setToken(tokenStr);
          setDisplayText('Opening payment page…');
        }
      } catch (err) {
        Alert.alert('Error', err.message || 'Could not init payment');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId, orderDesc, amount, email, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>{displayText}</Text>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.text}>Failed to initialize payment.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <WebView
        source={{ uri: `https://secure.3gdirectpay.com/pay.asp?ID=${token}` }}
        onLoadStart={() => setDisplayText('Loading payment page…')}
        onLoadEnd={() => setDisplayText('Waiting for payment…')}
        style={styles.webview}
      />
      <View style={styles.footer}>
        <Text style={styles.text}>{displayText}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, textAlign: 'center', margin: 10 },
  webview: { flex: 1 },
  footer: { padding: 10, backgroundColor: '#f2f2f2' },
});

export default DPO;
