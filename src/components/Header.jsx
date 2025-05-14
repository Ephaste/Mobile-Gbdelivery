import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ isCart, title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.appIconContainer}
      >
        {isCart || title ? (
          <Ionicons name="chevron-back" color="#E96E65" size={24} style={styles.backIcon} />
        ) : (
          <Image source={require("../assets/icon.png")} style={styles.appIcon} />
        )}
      </TouchableOpacity>

      {(isCart || title) && (
        <Text style={styles.titleText}>
          {title || 'My Cart'}
        </Text>
      )}
<TouchableOpacity onPress={() => navigation.navigate('AccountTab', { screen: 'Account' })}>
  <Image source={require("../assets/user.jpeg")} style={styles.user} />
</TouchableOpacity>

    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  appIconContainer: {
    backgroundColor: "#ffffff",
    height: 35,
    width: 35,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF4500",
  },
  appIcon: {
    height: 28,
    width: 28,
  },
  user: {
    height: 35,
    width: 35,
    borderRadius: 50,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4500',
  },
});
