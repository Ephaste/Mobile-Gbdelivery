// src/screens/DPO.js

import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Spinner from 'react-native-loading-spinner-overlay';

export default function DPO({ route }) {
  const { userId, phone, orderDesc } = route.params;
  const mounted = useRef(true);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ensure we don’t call setState after unmount
  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  // Create the order and grab the payment token
  useEffect(() => {
    async function createOrder() {
      try {
        const form = new FormData();
        form.append('action', 'ORDER_CHECKOUT_DPO_API');
        form.append('customer_id', userId);
        form.append('order_description', orderDesc);
        form.append('pay_phone_no', phone);

        const resp = await fetch(
          'https://gbdelivering.com/action/insert.php',
          {
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            body: form,
          }
        );
        const json = await resp.json();
        if (mounted.current) {
          const sess = Array.isArray(json) && json[0]?.token
            ? json[0].token
            : null;
          setToken(sess);
          setLoading(false);
        }
      } catch {
        if (mounted.current) {
          setLoading(false);
          setToken(null);
        }
      }
    }

    createOrder();
  }, [userId, phone, orderDesc]);

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={loading} />
      {!loading && token && (
        <WebView
          source={{ uri: `https://secure.3gdirectpay.com/pay.asp?ID=${token}` }}
          style={styles.webview}
        />
      )}
      {!loading && !token && (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Failed to initiate payment.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#c00',
    fontSize: 16,
    fontWeight: '600',
  },
});
