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

const Instructors = ({ navigation }) => {
  const [instructorsData, setInstructorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);  const [newInstructor, setNewInstructor] = useState({
    InstructorID: '',
    FirstName: '',
    LastName: '',
    ContactInformation: '',
  });

  useEffect(() => {
    fetchInstructorsData();
  }, []);

  const fetchInstructorsData = async () => {
    try {
      const response = await fetch('http://192.168.43.253/ams_backend/api.php?table=instructors&action=read');
      const result = await response.json();
      
      if (result.status) {
        setInstructorsData(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch instructors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this instructor?',
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
                'http://192.168.43.253/ams_backend/api.php?table=instructors&action=delete',
                {
                  method: 'POST',
                  body: formData,
                }
              );
              const result = await response.json();

              if (result.status) {
                fetchInstructorsData(); // Refresh the list
                Alert.alert('Success', 'Instructor deleted successfully');
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete instructor');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleOpenModal = (instructor) => {
    setNewInstructor({
      FirstName: instructor.FirstName,
      LastName: instructor.LastName,
      ContactInformation: instructor.ContactInformation,
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSaveChanges = async () => {
    // Add your update logic here
    setModalVisible(false);
  };

  const handleAddInstructor = async () => {    if (!newInstructor.InstructorID || !newInstructor.FirstName || !newInstructor.LastName || !newInstructor.ContactInformation) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }    try {
      const formData = new FormData();
      formData.append('InstructorID', newInstructor.InstructorID);
      formData.append('FirstName', newInstructor.FirstName);
      formData.append('LastName', newInstructor.LastName);
      formData.append('ContactInformation', newInstructor.ContactInformation);

      const response = await fetch('http://192.168.43.253/ams_backend/api.php?table=instructors&action=create', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.status === 'success') {        Alert.alert('Success', 'Instructor added successfully');
        setModalVisible(false);
        setNewInstructor({ InstructorID: '', FirstName: '', LastName: '', ContactInformation: '' });
        fetchInstructorsData(); // Refresh the list
      } else {
        Alert.alert('Error', result.message || 'Failed to add instructor');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add instructor');
      console.error(error);
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>            <Text style={styles.modalTitle}>Add New Instructor</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Instructor ID"
              value={newInstructor.InstructorID}
              onChangeText={(text) => setNewInstructor({...newInstructor, InstructorID: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={newInstructor.FirstName}
              onChangeText={(text) => setNewInstructor({...newInstructor, FirstName: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={newInstructor.LastName}
              onChangeText={(text) => setNewInstructor({...newInstructor, LastName: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Contact Information"
              value={newInstructor.ContactInformation}
              onChangeText={(text) => setNewInstructor({...newInstructor, ContactInformation: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddInstructor}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView}>
        {instructorsData.map((instructor, index) => (
          <View key={instructor.InstructorID || index} style={styles.card}>            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.idText}>ID: {instructor.InstructorID}</Text>
                <Text style={styles.name}>
                  {instructor.FirstName} {instructor.LastName}
                </Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>
                  First Name: {instructor.FirstName}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>
                  Last Name: {instructor.LastName}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>
                  Contact: {instructor.ContactInformation || 'No contact information'}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleOpenModal(instructor)}
              >
                <Ionicons name="pencil" size={16} color={COLORS.white} />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(instructor.InstructorID)}
              >
                <Ionicons name="trash" size={16} color={COLORS.white} />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
  },  headerLeft: {
    flex: 1,
  },
  idText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  classesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 8,
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
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  addButton: {
    backgroundColor: '#4ecdc4',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Instructors;
