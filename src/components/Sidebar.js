import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Menu items for admin/staff users
const adminMenuItems = [
  { 
    icon: 'home-outline',
    label: 'Dashboard',
    route: 'Home'
  },
  {
    icon: 'calendar-outline',
    label: 'Attendance',
    route: 'Attendance'
  },
  {
    icon: 'people-outline',
    label: 'Students',
    route: 'Students'
  },
  {
    icon: 'school-outline',
    label: 'Classes',
    route: 'Classes'
  },
  {
    icon: 'person-outline',
    label: 'Instructors',
    route: 'Instructors'
  },
  {
    icon: 'notifications-outline',
    label: 'Notifications',
    route: 'Notifications'
  },
  {
    icon: 'people-circle-outline',
    label: 'Parents',
    route: 'Parents'
  },
  {
    icon: 'git-branch-outline',
    label: 'Relations',
    route: 'Relationships'
  },
];

// Menu items for student users
const studentMenuItems = [
  {
    icon: 'home-outline',
    label: 'Dashboard',
    route: 'StudentDashboard'
  },
  {
    icon: 'calendar-outline',
    label: 'My Attendance',
    route: 'Attendance'
  },
  {
    icon: 'school-outline',
    label: 'My Classes',
    route: 'Classes'
  },
  {
    icon: 'notifications-outline',
    label: 'Notifications',
    route: 'Notifications'
  },
];

export function Sidebar(props) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData ? getInitials(userData.full_name) : '??'}
          </Text>
        </View>
        <Text style={styles.userName}>{userData?.full_name || 'Loading...'}</Text>
        <Text style={styles.userType}>{userData?.user_type || ''}</Text>
      </View>      <ScrollView style={styles.menuContainer}>
        {(userData?.user_type?.toLowerCase() === 'student' ? studentMenuItems : adminMenuItems).map((item, index) => (
          <DrawerItem
            key={index}
            icon={({ color, size }) => (
              <Ionicons name={item.icon} size={size} color={color} />
            )}
            label={({ focused, color }) => (
              <Text style={{ color }}>{item.label}</Text>
            )}
            onPress={() => props.navigation.navigate(item.route)}
            activeBackgroundColor={COLORS.lightPink}
            activeTintColor={COLORS.primary}
            inactiveTintColor={COLORS.secondary}
            style={styles.menuItem}
          />
        ))}
      </ScrollView>

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons name="log-out-outline" size={size} color={color} />
        )}
        label={({ color }) => (
          <Text style={{ color }}>Logout</Text>
        )}        onPress={async () => {
          try {
            await AsyncStorage.clear();
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'GetStarted' }],
            });
          } catch (error) {
            console.error('Error logging out:', error);
          }
        }}
        inactiveTintColor={COLORS.secondary}
        style={styles.logoutButton}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 10,
    textAlign: 'center',
  },
  userType: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    textTransform: 'capitalize',
    textAlign: 'center',
  },avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightPink,
    marginTop: 20,
  },
});
