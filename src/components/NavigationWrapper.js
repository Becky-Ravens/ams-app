import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from '../screens/Dashboard';
import StudentDashboard from '../screens/StudentDashboard';
import Attendance from '../screens/Attendance';
import Students from '../screens/Students';
import Classes from '../screens/Classes';
import Instructors from '../screens/Instructors';
import Parents from '../screens/Parents';
import Relationships from '../screens/Relationships';
import Notifications from '../screens/Notifications';
import { COLORS } from '../constants/colors';
import { Sidebar } from './Sidebar';

const Drawer = createDrawerNavigator();

export const NavigationWrapper = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        drawerStyle: { backgroundColor: COLORS.white },
        headerTitleStyle: { fontSize: 20, fontWeight: 'bold' }
      }}>
      <Drawer.Screen
        name="Home"
        component={Dashboard}
        options={{ 
          title: 'Dashboard',
          drawerItemStyle: { 
            display: 'none' 
          }
        }}
      />
      <Drawer.Screen
        name="StudentDashboard"
        component={StudentDashboard}
        options={{ 
          title: 'Student Dashboard',
          drawerItemStyle: { 
            display: 'none' 
          }
        }}
      />
      <Drawer.Screen name="Attendance" component={Attendance} options={{ title: 'Attendance' }} />
      <Drawer.Screen name="Students" component={Students} options={{ title: 'Students' }} />
      <Drawer.Screen name="Classes" component={Classes} options={{ title: 'Classes' }} />
      <Drawer.Screen name="Instructors" component={Instructors} options={{ title: 'Instructors' }} />
      <Drawer.Screen name="Notifications" component={Notifications} options={{ title: 'Notifications' }} />
      <Drawer.Screen name="Parents" component={Parents} options={{ title: 'Parents' }} />
      <Drawer.Screen name="Relationships" component={Relationships} options={{ title: 'Relations' }} />
    </Drawer.Navigator>
  );
};
