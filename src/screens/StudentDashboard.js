import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

const StudentDashboard = ({ navigation }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        // Fetch student-specific data using the student's ID
        const response = await fetch(
          `http://192.168.43.253/ams_backend/dashboard_api.php?student_id=${userData.reference_id}`,
          {
            headers: {
              'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
            }
          }
        );
        const data = await response.json();
        if (data.status === 'success') {
          setStudentData(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {studentData?.name || 'Student'}
        </Text>
        <Text style={styles.subtitle}>Here's your academic overview</Text>
      </View>

      {/* Parent Information Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Parent/Guardian</Text>
        <View style={styles.parentInfo}>
          <Ionicons name="people-circle-outline" size={24} color={COLORS.primary} />
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>{studentData?.parent_name || 'Not Available'}</Text>
            <Text style={styles.infoSubtitle}>{studentData?.relationship || 'Guardian'}</Text>
          </View>
        </View>
      </Card>

      {/* Classes Summary Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>My Classes</Text>
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate('Classes')}
          >
            <Text style={styles.viewMoreText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {studentData?.classes?.slice(0, 3).map((classItem, index) => (
          <View key={index} style={styles.classItem}>
            <Ionicons name="school-outline" size={24} color={COLORS.primary} />
            <View style={styles.classInfo}>
              <Text style={styles.className}>{classItem.name}</Text>
              <Text style={styles.classTime}>{classItem.schedule}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Attendance Summary Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Attendance Overview</Text>
        <View style={styles.attendanceStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{studentData?.attendance?.present || 0}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{studentData?.attendance?.absent || 0}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{studentData?.attendance?.late || 0}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  card: {
    margin: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 16,
  },
  viewMoreButton: {
    padding: 8,
  },
  viewMoreText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  parentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  infoSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
  },
  classInfo: {
    marginLeft: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  classTime: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
});

export default StudentDashboard;
