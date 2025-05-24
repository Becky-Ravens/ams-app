import React, { useState, useEffect } from 'react';
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
import { COLORS } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    FirstName: '',
    LastName: '',
    DateOfBirth: '',
    ContactInformation: '',
    ParentID: ''
  });
  const navigation = useNavigation();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={handleAddStudent} 
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
  }, [navigation, handleAddStudent]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://192.168.43.253/ams_backend/api.php?table=students&action=read');
      const result = await response.json();
      
      if (result.status) {
        setStudents(result.data || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch student records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setCurrentStudent({
      FirstName: '',
      LastName: '',
      DateOfBirth: '',
      ContactInformation: '',
      ParentID: ''
    });
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      if (!currentStudent.FirstName || !currentStudent.LastName) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const formData = new FormData();
      formData.append('firstName', currentStudent.FirstName);
      formData.append('lastName', currentStudent.LastName);
      formData.append('dob', currentStudent.DateOfBirth);
      formData.append('contactInfo', currentStudent.ContactInformation);
      formData.append('parentName', currentStudent.ParentID);

      // Add StudentID for updates
      if (isEditing && currentStudent.StudentID) {
        formData.append('id', currentStudent.StudentID);
      }

      const url = isEditing
        ? 'http://192.168.43.253/ams_backend/api.php?table=students&action=update'
        : 'http://192.168.43.253/ams_backend/api.php?table=students&action=create';

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status) {
        Alert.alert('Success', isEditing ? 'Student updated successfully' : 'Student added successfully');
        setIsModalVisible(false);
        fetchStudents(); // Refresh the list
      } else {
        Alert.alert('Error', result.message || 'Failed to process record');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process record');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this student?',
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
                'http://192.168.43.253/ams_backend/api.php?table=students&action=delete',
                {
                  method: 'POST',
                  body: formData,
                }
              );
              const result = await response.json();

              if (result.status) {
                fetchStudents();
                Alert.alert('Success', 'Student deleted successfully');
              } else {
                Alert.alert('Error', result.message || 'Failed to delete student');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete student');
              console.error(error);
            }
          },
        },
      ]
    );
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
        {students.map((student, index) => (
          <View key={student.StudentID || index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.idText}>Student ID: {student.StudentID || 'N/A'}</Text>
                <Text style={styles.studentName}>{student.FirstName} {student.LastName}</Text>
                <Text style={styles.infoText}>DOB: {new Date(student.DateOfBirth).toLocaleDateString()}</Text>
                <Text style={styles.infoText}>Contact: {student.ContactInformation}</Text>
                <Text style={styles.infoText}>Parent ID: {student.ParentID || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  setCurrentStudent({...student});
                  setIsEditing(true);
                  setIsModalVisible(true);
                }}
              >
                <Ionicons name="create-outline" size={16} color={COLORS.white} />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(student.StudentID)}
              >
                <Ionicons name="trash" size={16} color={COLORS.white} />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
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
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Student' : 'Add Student'}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={currentStudent.FirstName}
                onChangeText={(text) => setCurrentStudent({...currentStudent, FirstName: text})}
                placeholder="Enter First Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={currentStudent.LastName}
                onChangeText={(text) => setCurrentStudent({...currentStudent, LastName: text})}
                placeholder="Enter Last Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={currentStudent.DateOfBirth}
                onChangeText={(text) => setCurrentStudent({...currentStudent, DateOfBirth: text})}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contact Information</Text>
              <TextInput
                style={styles.input}
                value={currentStudent.ContactInformation}
                onChangeText={(text) => setCurrentStudent({...currentStudent, ContactInformation: text})}
                placeholder="Enter Contact Information"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Parent ID</Text>
              <TextInput
                style={styles.input}
                value={currentStudent.ParentID}
                onChangeText={(text) => setCurrentStudent({...currentStudent, ParentID: text})}
                placeholder="Enter Parent ID"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setIsEditing(false);
                  setCurrentStudent({
                    FirstName: '',
                    LastName: '',
                    DateOfBirth: '',
                    ContactInformation: '',
                    ParentID: ''
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
    padding: 16,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  idText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: COLORS.white,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
});

export default Students;
