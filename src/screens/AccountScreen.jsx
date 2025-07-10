import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';

if (Platform.OS === 'android') {
  if (!ActivityIndicator.defaultProps) ActivityIndicator.defaultProps = {};
  ActivityIndicator.defaultProps.color = 'gray';
}

const AccountScreen = () => {
  const navigation = useNavigation();
  const isMounted = useRef(true);

  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('account');

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('@userId');
        if (isMounted.current) {
          setUserId(id);
          if (!id) setLoading(false);
        }
      } catch (e) {
        console.error('Error reading userId:', e);
        if (isMounted.current) setLoading(false);
      }
    };
    loadUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const form = new FormData();
        form.append('action', 'GET_USER_DATA_API');
        form.append('user_id', userId);

        const res = await fetch('https://gbdelivering.com/action/select.php', {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },
          body: form,
        });
        const json = await res.json();
        const profile = json.length > 0 ? json[0] : null;

        if (isMounted.current) setUserData(profile);
      } catch (e) {
        console.error('Failed to load user data:', e);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const logout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (err) {
            console.error('Logout failed:', err);
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const profile = userData || {};

  const renderSelectedContent = () => {
    switch (selectedView) {
      case 'account':
        return (
          <View style={styles.profileCard}>
            <Text>Name: {profile.first_name} {profile.last_name}</Text>
            <Text>Email: {profile.email}</Text>
            <Text>Phone: {profile.phone_no}</Text>
          </View>
        );
      case 'address':
        return <View style={styles.profileCard}><Text>Your address management section will be here.</Text></View>;
      case 'profile':
        return <View style={styles.profileCard}><Text>View or edit your profile here.</Text></View>;
      case 'trackOrders':
        return <View style={styles.profileCard}><Text>You can track your orders here.</Text></View>;
      case 'myOrders':
        return <View style={styles.profileCard}><Text>Your order history will appear here.</Text></View>;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Spinner
        visible={loading}
        overlayColor="rgba(0,0,0,0.1)"
        customIndicator={
          <ActivityIndicator size="large" color="#FF4500" style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }} />
        }
      />

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeTab')}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={[styles.navText, styles.selectedNavText]}>My Account</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.greetingText}>
            Hello{profile.first_name ? `, ${profile.first_name}` : ''} 👋
          </Text>
          <Text style={styles.nameText}>
            {profile.first_name || ''} {profile.last_name || ''}
          </Text>

          {[{ key: 'account', label: 'Manage my Account' },
            { key: 'address', label: 'Manage my Address' },
            { key: 'profile', label: 'My Profile' },
            { key: 'trackOrders', label: 'Track Orders' },
            { key: 'myOrders', label: 'My Orders' },
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={styles.option}
              onPress={() => setSelectedView(item.key)}
            >
              <Text>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeading}>Manage My Account</Text>
          {renderSelectedContent()}
        </View>

        <View style={styles.section}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="shopping-cart" size={30} color="#FF4500" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Orders Placed</Text>
            </View>
            <View style={styles.statCard}>
              <Entypo name="circle-with-cross" size={30} color="#FF4500" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome name="heart" size={30} color="#FF4500" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Wish List</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeading}>RECENT ORDERS</Text>
          <View style={styles.ordersHeader}>
            <Text style={styles.orderText}>Order</Text>
            <Text style={styles.orderText}>Placed On</Text>
            <Text style={styles.orderText}>Total</Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={{ backgroundColor: '#FF4500', padding: 12, borderRadius: 8, alignItems: 'center' }}
            onPress={logout}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#D6CFC7' },
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: '#FF4500',
    borderWidth: 2,
    margin: 16,
    marginTop: 50,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'space-around',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  navItem: { paddingHorizontal: 10, paddingVertical: 5 },
  activeNavItem: { borderBottomWidth: 2, borderBottomColor: 'skyblue' },
  navText: { fontSize: 16 },
  selectedNavText: { fontWeight: 'bold', color: 'skyblue' },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderColor: '#FF4500',
    borderBottomWidth: 2,
  },
  greetingText: { color: 'gray', fontSize: 16 },
  nameText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  option: { marginVertical: 4 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  statCard: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  statLabel: { fontSize: 14, color: 'gray', marginTop: 2, textAlign: 'center' },
  subHeading: { fontSize: 16, color: 'gray', marginBottom: 10 },
  profileCard: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8 },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#dcdcdc',
    padding: 10,
    borderRadius: 5,
  },
  orderText: { fontWeight: 'bold', fontSize: 14 },
});
