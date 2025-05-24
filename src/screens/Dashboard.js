import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { COLORS } from '../constants/colors';

const BASE_URL = 'http://192.168.43.253/ams_backend/dashboard_api.php';

const Dashboard = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalInstructors: 0,
    totalParents: 0,
    attendanceRate: 0,
    unreadNotifications: 0,
    recentStudents: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch(`${BASE_URL}?action=stats`);
      const statsData = await statsResponse.json();

      if (statsData.status) {
        setDashboardData({
          totalStudents: statsData.data.totalStudents || 0,
          totalClasses: statsData.data.totalClasses || 0,
          totalInstructors: statsData.data.totalInstructors || 0,
          totalParents: statsData.data.totalParents || 0,
          attendanceRate: statsData.data.attendanceRate || 0,
          unreadNotifications: statsData.data.unreadNotifications || 0,
          recentStudents: statsData.data.recentStudents || []
        });
      } else {
        Alert.alert('Error', statsData.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statTitle}>Total Students</Text>
              <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statTitle}>Classes</Text>
              <Text style={styles.statNumber}>{dashboardData.totalClasses}</Text>
            </Card>
          </View>
          
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statTitle}>Instructors</Text>
              <Text style={styles.statNumber}>{dashboardData.totalInstructors}</Text>
            </Card>

            <Card style={styles.statCard}>
              <Text style={styles.statTitle}>Parents</Text>
              <Text style={styles.statNumber}>{dashboardData.totalParents}</Text>
            </Card>
          </View>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statTitle}>Attendance Rate</Text>
              <Text style={styles.statNumber}>{dashboardData.attendanceRate}%</Text>
            </Card>

            <Card style={styles.statCard}>
              <Text style={styles.statTitle}>Notifications</Text>
              <Text style={styles.statNumber}>{dashboardData.unreadNotifications}</Text>
            </Card>
          </View>
        </View>

        {/* Recent Students */}
        <Card style={styles.studentsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Recent Students</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Students')}>
              <Text style={styles.viewMoreButton}>View More</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.recentStudents.map((student, index) => (
            <View key={index} style={styles.studentItem}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {student.FirstName} {student.LastName}
                </Text>
                <Text style={styles.studentContact}>
                  DOB: {new Date(student.DateOfBirth).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 12,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewMoreButton: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  studentsCard: {
    marginBottom: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  studentContact: {
    fontSize: 14,
    color: COLORS.textLight,
  }
});

export default Dashboard;
