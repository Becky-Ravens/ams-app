import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Card } from '../components/Card';

// Define AddRelationshipModalComponent OUTSIDE the Relationships component
const AddRelationshipModalComponent = ({
  visible,
  relationshipData,
  onRelationshipDataChange,
  onCloseRequest,
  onSaveRequest,
}) => {
  const validateForm = () => {
    if (!relationshipData.StudentID?.trim() || !relationshipData.ParentID?.trim()) {
      Alert.alert('Required Fields', 'Both Student ID and Parent ID are required.');
      return false;
    }
    // Optional: Add numeric validation if IDs must be numbers
    if (isNaN(Number(relationshipData.StudentID)) || isNaN(Number(relationshipData.ParentID))) {
        Alert.alert('Invalid Input', 'Student ID and Parent ID must be numbers.');
        return false;
    }
    return true;
  };

  const handleInternalSave = () => {
    if (validateForm()) {
      onSaveRequest();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCloseRequest} // Handles back button press on Android
    >
      <TouchableWithoutFeedback onPress={onCloseRequest}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{relationshipData.RelationshipID ? 'Edit Relationship' : 'Add New Relationship'}</Text>
                <TouchableOpacity onPress={onCloseRequest}>
                  <Ionicons name="close" size={24} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Student ID <Text style={{ color: 'red' }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={relationshipData.StudentID}
                    onChangeText={(text) => onRelationshipDataChange({ ...relationshipData, StudentID: text })}
                    placeholder="Enter Student ID"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Parent ID <Text style={{ color: 'red' }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={relationshipData.ParentID}
                    onChangeText={(text) => onRelationshipDataChange({ ...relationshipData, ParentID: text })}
                    placeholder="Enter Parent ID"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCloseRequest}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleInternalSave}>
                  <Text style={styles.buttonText}>{relationshipData.RelationshipID ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const Relationships = ({ navigation }) => {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRelationshipData, setCurrentRelationshipData] = useState({
    StudentID: '',
    ParentID: '',
    RelationshipID: '',
  });

  useEffect(() => {
    fetchRelationships();
  }, []);

  const fetchRelationships = async () => {
    try {
      const response = await fetch('http://192.168.43.253/ams_backend/api.php?table=studentparentrelationship&action=read');
      const result = await response.json();
      
      if (result.status) {
        setRelationships(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch relationships');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this relationship?',
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
                'http://192.168.43.253/ams_backend/api.php?table=studentparentrelationship&action=delete',
                {
                  method: 'POST',
                  body: formData,
                }
              );
              const result = await response.json();

              if (result.status) {
                fetchRelationships();
                Alert.alert('Success', 'Relationship deleted successfully');
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete relationship');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleAddRelationship = async () => {
    if (!currentRelationshipData.StudentID.trim() || !currentRelationshipData.ParentID.trim()) {
      Alert.alert('Error', 'Both Student ID and Parent ID are required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('StudentID', currentRelationshipData.StudentID);
      formData.append('ParentID', currentRelationshipData.ParentID);

      const response = await fetch(
        'http://192.168.43.253/ams_backend/api.php?table=studentparentrelationship&action=create',
        {
          method: 'POST',
          body: formData,
        }
      );
      const result = await response.json();

      if (result.status) {
        Alert.alert('Success', 'Relationship added successfully');
        closeModalAndResetForm();
        fetchRelationships();
      } else {
        Alert.alert('Error', result.message || 'Failed to add relationship');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add relationship');
      console.error(error);
    }
  };

  const handleEdit = (relation) => {
    setCurrentRelationshipData({
      StudentID: relation.StudentID.toString(),
      ParentID: relation.ParentID.toString(),
      RelationshipID: relation.RelationshipID.toString(),
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!currentRelationshipData.StudentID.trim() || !currentRelationshipData.ParentID.trim()) {
      Alert.alert('Error', 'Both Student ID and Parent ID are required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('id', currentRelationshipData.RelationshipID);
      formData.append('StudentID', currentRelationshipData.StudentID);
      formData.append('ParentID', currentRelationshipData.ParentID);

      const response = await fetch(
        'http://192.168.43.253/ams_backend/api.php?table=studentparentrelationship&action=update',
        {
          method: 'POST',
          body: formData,
        }
      );
      const result = await response.json();

      if (result.status) {
        Alert.alert('Success', 'Relationship updated successfully');
        closeModalAndResetForm();
        fetchRelationships();
      } else {
        Alert.alert('Error', result.message || 'Failed to update relationship');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update relationship');
      console.error(error);
    }
  };

  const openAddModal = () => {
    setCurrentRelationshipData({ StudentID: '', ParentID: '' }); // Reset form for new entry
    setModalVisible(true);
  };

  const closeModalAndResetForm = () => {
    setModalVisible(false);
    setIsEditing(false);
    setCurrentRelationshipData({ StudentID: '', ParentID: '', RelationshipID: '' });
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
        {relationships.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No relationships found</Text>
          </View>
        ) : (
          relationships.map((relation, index) => (            <Card key={relation.RelationshipID || index} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Ionicons name="key-outline" size={20} color={COLORS.secondary} />
                  <Text style={styles.infoText}>
                    Relationship ID: {relation.RelationshipID}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color={COLORS.secondary} />
                  <Text style={styles.infoText}>
                    Student ID: {relation.StudentID}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={20} color={COLORS.secondary} />
                  <Text style={styles.infoText}>
                    Parent ID: {relation.ParentID}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(relation)}
                >
                  <Ionicons name="pencil" size={16} color={COLORS.white} />
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(relation.RelationshipID)}
                >
                  <Ionicons name="trash" size={16} color={COLORS.white} />
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <AddRelationshipModalComponent
        visible={modalVisible}
        relationshipData={currentRelationshipData}
        onRelationshipDataChange={setCurrentRelationshipData}
        onCloseRequest={closeModalAndResetForm}
        onSaveRequest={isEditing ? handleUpdate : handleAddRelationship}
      />
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
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
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.secondary,
    flex: 1,
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
    gap: 6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  modalForm: {
    marginBottom: 16,
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
    height: 40,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.secondary,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
});

export default Relationships;
