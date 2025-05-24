import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { COLORS } from '../constants/colors';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({
    StudentID: '',
    ClassID: '',
    Date: new Date().toISOString().split('T')[0],
    Status: 'present'
  });
  const navigation = useNavigation(); // Get navigation object

  const handleAddRecord = useCallback(() => {
    setCurrentRecord({
      StudentID: '',
      ClassID: '',
      Date: new Date().toISOString().split('T')[0],
      Status: 'present'
    });
    setIsModalVisible(true);
    setIsEditing(false);
  }, []); // Dependencies: state setters are stable

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={handleAddRecord} 
          style={{ 
            marginRight: 15,
            padding: 8,
            backgroundColor: COLORS.primary,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
          <Text style={{ color: COLORS.white, marginLeft: 4, fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleAddRecord]);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch('http://192.168.43.253/ams_backend/api.php?table=attendancerecords&action=read');
      const result = await response.json();
      
      if (result.status) {
        setAttendanceData(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch attendance records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const formData = new FormData();
              formData.append('id', id);

              const response = await fetch(
                'http://192.168.43.253/ams_backend/api.php?table=attendancerecords&action=delete',
                {
                  method: 'POST',
                  body: formData,
                }
              );
              const result = await response.json();

              if (result.status) {
                fetchAttendanceData(); // Refresh the list
                Alert.alert('Success', 'Record deleted successfully');
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete record');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    try {
      if (!currentRecord.StudentID || !currentRecord.ClassID) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const formData = new FormData();
      formData.append('StudentID', currentRecord.StudentID);
      formData.append('ClassID', currentRecord.ClassID);
      formData.append('Date', currentRecord.Date);
      formData.append('Status', currentRecord.Status);

      // Add RecordID for updates
      if (isEditing && currentRecord.RecordID) {
        formData.append('id', currentRecord.RecordID);
      }

      const url = isEditing
        ? 'http://192.168.43.253/ams_backend/api.php?table=attendancerecords&action=update'
        : 'http://192.168.43.253/ams_backend/api.php?table=attendancerecords&action=create';

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status) {
        Alert.alert('Success', isEditing ? 'Record updated successfully' : 'Record added successfully');
        setIsModalVisible(false);
        fetchAttendanceData(); // Refresh the list
      } else {
        Alert.alert('Error', result.message || 'Failed to process record');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process record');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'present':
        return '#4CAF50';
      case 'absent':
        return '#F44336';
      case 'late':
        return '#FFC107';
      case 'excused':
        return '#2196F3';
      default:
        return COLORS.primary;
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {attendanceData.map((record, index) => (
          <View key={record.RecordID || index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.idText}>Record ID: {record.RecordID || 'N/A'}</Text>
                <Text style={styles.idText}>Student ID: {record.StudentID || 'N/A'}</Text>
                <Text style={styles.idText}>Class ID: {record.ClassID || 'N/A'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.Status) }]}>
                <Text style={styles.statusText}>{record.Status}</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.dateText}>
                  {new Date(record.Date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => {
                    setCurrentRecord({
                      ...record,
                      Date: new Date(record.Date).toISOString().split('T')[0]
                    });
                    setIsModalVisible(true);
                    setIsEditing(true);
                  }}
                >
                  <Ionicons name="create-outline" size={16} color={COLORS.white} />
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(record.RecordID)}
                >
                  <Ionicons name="trash" size={16} color={COLORS.white} />
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Attendance Record' : 'Add Attendance Record'}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Student ID</Text>
              <TextInput
                style={styles.input}
                value={currentRecord.StudentID}
                onChangeText={(text) => setCurrentRecord({...currentRecord, StudentID: text})}
                placeholder="Enter Student ID"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Class ID</Text>
              <TextInput
                style={styles.input}
                value={currentRecord.ClassID}
                onChangeText={(text) => setCurrentRecord({...currentRecord, ClassID: text})}
                placeholder="Enter Class ID"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={currentRecord.Date}
                onChangeText={(text) => setCurrentRecord({...currentRecord, Date: text})}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusButtons}>
                {['present', 'absent', 'late', 'excused'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      currentRecord.Status === status && styles.statusOptionSelected,
                      { backgroundColor: currentRecord.Status === status ? getStatusColor(status) : '#f0f0f0' }
                    ]}
                    onPress={() => setCurrentRecord({...currentRecord, Status: status})}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      currentRecord.Status === status && styles.statusOptionTextSelected
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setIsEditing(false);
                  setCurrentRecord({
                    StudentID: '',
                    ClassID: '',
                    Date: new Date().toISOString().split('T')[0],
                    Status: 'present'
                  });
                }}
              >
                <Ionicons name="close-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Ionicons name={isEditing ? "checkmark-circle-outline" : "add-circle-outline"} size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative', // Add this to ensure proper stacking context
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  idText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  className: {
    fontSize: 14,
    color: COLORS.secondary,
    opacity: 0.8,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bsold',
    color: COLORS.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightPink,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  statusOptionSelected: {
    borderWidth: 0,
  },
  statusOptionText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  statusOptionTextSelected: {
    color: COLORS.white,
  },
});

export default Attendance;
