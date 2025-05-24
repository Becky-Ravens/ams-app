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

const Classes = ({ navigation }) => {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [newClass, setNewClass] = useState({
    ClassName: '',
    CourseName: '',
    InstructorID: '',
  });

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.43.253/ams_backend/api.php?table=classes&action=read');
      const result = await response.json();

      if (result.status && result.data) {
        setClassesData(Array.isArray(result.data) ? result.data : []);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch classes data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorsData = async () => {
    try {
      const response = await fetch('http://192.168.43.253/ams_backend/api.php?table=instructors&action=read');
      const result = await response.json();
      
      if (result.status && result.data) {
        const instructorMap = {};
        result.data.forEach(instructor => {
          instructorMap[instructor.InstructorID.toString()] = `${instructor.FirstName} ${instructor.LastName}`;
        });
        setInstructors(instructorMap);
      } else {
        console.error('Failed to fetch instructors:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    fetchInstructorsData();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
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
  }, [navigation]);

  const handleAddClass = async () => {
    if (!newClass.ClassName || !newClass.CourseName || !newClass.InstructorID) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('ClassName', newClass.ClassName);
      formData.append('CourseName', newClass.CourseName);
      formData.append('InstructorID', newClass.InstructorID);

      const response = await fetch(
        'http://192.168.43.253/ams_backend/api.php?table=classes&action=create',
        {
          method: 'POST',
          body: formData,
        }
      );
      const result = await response.json();

      if (result.status) {
        fetchData();
        setModalVisible(false);
        setNewClass({ ClassName: '', CourseName: '', InstructorID: '' });
        Alert.alert('Success', 'Class added successfully');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add class');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this class?',
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
                'http://192.168.43.253/ams_backend/api.php?table=classes&action=delete',
                {
                  method: 'POST',
                  body: formData,
                }
              );
              const result = await response.json();

              if (result.status) {
                fetchData();
                Alert.alert('Success', 'Class deleted successfully');
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete class');
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
        {classesData.map((classItem, index) => (
          <View key={classItem.ClassID || index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.idText}>ID: {classItem.ClassID || 'N/A'}</Text>
                <Text style={styles.className}>{classItem.ClassName || 'N/A'}</Text>
                <Text style={styles.courseName}>{classItem.CourseName || 'N/A'}</Text>
              </View>
              <View style={styles.badgeContainer}>
                <View style={styles.countBadge}>
                  <Ionicons name="people" size={16} color={COLORS.white} />
                  <Text style={styles.countText}>
                    {classItem.StudentCount || '0'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.instructorText}>
                  Instructor: {instructors[classItem.InstructorID.toString()] || 'Not assigned'}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => Alert.alert('Edit functionality is not implemented')}
              >
                <Ionicons name="pencil" size={16} color={COLORS.white} />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(classItem.ClassID)}
              >
                <Ionicons name="trash" size={16} color={COLORS.white} />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Class</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Class Name"
              value={newClass.ClassName}
              onChangeText={(text) => setNewClass({ ...newClass, ClassName: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Course Name"
              value={newClass.CourseName}
              onChangeText={(text) => setNewClass({ ...newClass, CourseName: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Instructor ID"
              value={newClass.InstructorID}
              onChangeText={(text) => setNewClass({ ...newClass, InstructorID: text })}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewClass({ ClassName: '', CourseName: '', InstructorID: '' });
                }}
              >
                <Ionicons name="close-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddClass}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Add Class</Text>
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
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: COLORS.secondary,
    opacity: 0.8,
  },
  badgeContainer: {
    marginLeft: 16,
  },
  countBadge: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  countText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructorText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 0,
    gap: 12,
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
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: '#F44336',
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
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightPink,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
});

export default Classes;
