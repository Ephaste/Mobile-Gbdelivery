import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, SafeAreaView } from 'react-native';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AccountScreen = () => {
  const navigation = useNavigation();

  const firstName = 'John';
  const lastName = 'Doe';
  const email = 'johndoe@example.com';
  const phone = '+250788123456';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed NavBar at Top */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={[styles.navText, styles.selectedNavText]}>My Account</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content below the fixed navbar */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.greetingText}>Hello</Text>
          <Text style={styles.nameText}>{firstName} {lastName}</Text>
          <TouchableOpacity style={styles.option}><Text>Manage my Account</Text></TouchableOpacity>
          <TouchableOpacity style={styles.option}><Text>Manage my Address</Text></TouchableOpacity>
          <TouchableOpacity style={styles.option}><Text>My Profile</Text></TouchableOpacity>
          <TouchableOpacity style={styles.option}><Text>Track Orders</Text></TouchableOpacity>
          <TouchableOpacity style={styles.option}><Text>My Orders</Text></TouchableOpacity>
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
              <Text style={styles.statLabel}>Cancelled Orders</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome name="heart" size={30} color="#FF4500" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Wish List</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeading}>Manage My Account</Text>
          <View style={styles.profileCard}>
            <Text>{firstName} {lastName}</Text>
            <Text>{email}</Text>
            <Text>{phone}</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#D6CFC7",
  },
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
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
  navItem: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: 'skyblue',
  },
  navText: {
    fontSize: 16,
  },
  selectedNavText: {
    fontWeight: 'bold',
    color: 'skyblue',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderColor: '#FF4500',
    borderBottomWidth: 2,
  },
  greetingText: {
    color: 'gray',
    fontSize: 16,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  option: {
    marginVertical: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: 'gray',
    marginTop: 2,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  profileCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#dcdcdc',
    padding: 10,
    borderRadius: 5,
  },
  orderText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default AccountScreen;
