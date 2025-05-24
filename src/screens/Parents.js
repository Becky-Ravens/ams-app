import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Define AddParentModalComponent OUTSIDE the Parents component
const AddParentModalComponent = ({
  visible,
  isEditing,
  parentData,
  originalParentDataForEdit, // For accurate "unsaved changes" check in edit mode
  onParentDataChange,
  onCloseRequest,
  onSaveRequest,
}) => {
  const validateForm = () => {
    const requiredFields = {
      FirstName: 'First Name',
      LastName: 'Last Name',
      RelationshipToStudent: 'Relationship to Student',
      ContactInformation: 'Contact Information',
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!parentData[field]?.trim()) {
        Alert.alert('Required Field', `${label} is required`);
        return false;
      }
    }
    return true;
  };

  const internalHandleClose = () => {
    let hasUnsavedChanges = false;
    const currentFormFields = {
        FirstName: parentData.FirstName || '',
        LastName: parentData.LastName || '',
        RelationshipToStudent: parentData.RelationshipToStudent || '',
        ContactInformation: parentData.ContactInformation || '',
    };

    if (isEditing && originalParentDataForEdit) {
        const originalFields = {
            FirstName: originalParentDataForEdit.FirstName || '',
            LastName: originalParentDataForEdit.LastName || '',
            RelationshipToStudent: originalParentDataForEdit.RelationshipToStudent || '',
            ContactInformation: originalParentDataForEdit.ContactInformation || '',
        };
        hasUnsavedChanges = Object.keys(currentFormFields).some(
            key => currentFormFields[key].trim() !== originalFields[key].trim()
        );
    } else if (!isEditing) { // Adding new
        hasUnsavedChanges = Object.values(currentFormFields).some(value => value.trim() !== '');
    }

    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', style: 'destructive', onPress: onCloseRequest },
        ]
      );
    } else {
      onCloseRequest();
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSaveRequest();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={internalHandleClose}
    >
      <TouchableWithoutFeedback onPress={e => {
        if (e.target === e.currentTarget) {
          internalHandleClose();
        }
      }}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{isEditing ? 'Edit Parent' : 'Add New Parent'}</Text>
                <TouchableOpacity onPress={internalHandleClose}>
                  <Ionicons name="close" size={24} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalForm}>
                {/* Input fields remain the same, using parentData and onParentDataChange */}
                {/* FirstName */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>First Name <Text style={{ color: 'red' }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={parentData.FirstName}
                    onChangeText={(text) => onParentDataChange({ ...parentData, FirstName: text })}
                    placeholder="Enter first name"
                    returnKeyType="next"
                  />
                </View>
                {/* LastName */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Last Name <Text style={{ color: 'red' }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={parentData.LastName}
                    onChangeText={(text) => onParentDataChange({ ...parentData, LastName: text })}
                    placeholder="Enter last name"
                    returnKeyType="next"
                  />
                </View>
                {/* ContactInformation */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Contact Information <Text style={{ color: 'red' }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={parentData.ContactInformation}
                    onChangeText={(text) => onParentDataChange({ ...parentData, ContactInformation: text })}
                    placeholder="Enter email or phone number"
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>
                {/* RelationshipToStudent */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Relationship to Student <Text style={{ color: 'red' }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={parentData.RelationshipToStudent}
                    onChangeText={(text) => onParentDataChange({ ...parentData, RelationshipToStudent: text })}
                    placeholder="Enter relationship (e.g., Father, Mother)"
                    returnKeyType="done"
                  />
                </View>
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={internalHandleClose}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const Parents = ({ navigation }) => {
  const [parentsData, setParentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newParent, setNewParent] = useState({
    ParentID: '',
    FirstName: '',
    LastName: '',
    RelationshipToStudent: '',
    ContactInformation: '',
  });
  const [originalParentForEdit, setOriginalParentForEdit] = useState(null);

  useEffect(() => {
    fetchParentsData();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setIsEditing(false);
            setNewParent({ // Clear form for new add
              ParentID: '',
              FirstName: '',
              LastName: '',
              RelationshipToStudent: '',
              ContactInformation: '',
            });
            setModalVisible(true);
          }}
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
  }, [navigation]); // React guarantees setState functions are stable
  const fetchParentsData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.43.253/ams_backend/parentsapi.php?action=read');
      const result = await response.json();
      console.log('API Response:', result); // Add logging to debug

      if (result.data) {
        setParentsData(result.data);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch parent data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch parent contacts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this parent contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Corrected: Use DELETE method and pass ID in URL
              const response = await fetch(
                `http://192.168.43.253/ams_backend/parentsapi.php/${id}`,
                {
                  method: 'DELETE',
                }
              );
              const result = await response.json();

              if (result.status) {
                fetchParentsData(); // Refresh the list
                Alert.alert('Success', 'Parent contact deleted successfully');
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete parent contact');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleAddParent = async () => {
    try {
      // Corrected: Send data as JSON
      const response = await fetch(
        'http://192.168.43.253/ams_backend/parentsapi.php', // Removed action=create, POST implies create
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newParent),
        }
      );
      const result = await response.json();

      if (result.status) {
        Alert.alert('Success', 'Parent added successfully');
        resetForm();
        fetchParentsData();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add parent');
      console.error(error);
    }
  };
  const handleEdit = (parent) => {
    setNewParent({
      ParentID: parent.ParentID,
      FirstName: parent.FirstName || '',
      LastName: parent.LastName || '',
      RelationshipToStudent: parent.RelationshipToStudent || '',
      ContactInformation: parent.ContactInformation || '',
    });
    setOriginalParentForEdit(parent); // Store original data for comparison
    setIsEditing(true);
    setModalVisible(true);
  };

  const resetForm = () => {
    setNewParent({
      ParentID: '',
      FirstName: '',
      LastName: '',
      RelationshipToStudent: '',
      ContactInformation: '',
    });
    setOriginalParentForEdit(null);
    setIsEditing(false);
    setModalVisible(false);
  };
  const handleUpdate = async () => {
    try {
      // Corrected: Send data as JSON, use PUT method, and ID in URL
      const response = await fetch(
        `http://192.168.43.253/ams_backend/parentsapi.php/${newParent.ParentID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newParent),
        }
      );
      const result = await response.json();

      if (result.status) {
        Alert.alert('Success', 'Parent updated successfully');
        resetForm();
        fetchParentsData();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update parent');
      console.error(error);
    }
  };

  const handleModalSave = () => {
    if (isEditing) {
      handleUpdate();
    } else {
      handleAddParent();
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {parentsData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No parent contacts found</Text>
            </View>
          ) : (
            parentsData.map((parent, index) => (
              <View key={parent.ParentID || index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.parentId}>Parent ID: {parent.ParentID}</Text>
                    <Text style={styles.name}>{parent.FirstName} {parent.LastName}</Text>
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={16} color={COLORS.secondary} />
                    <Text style={styles.infoText}>Relationship: {parent.RelationshipToStudent}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={16} color={COLORS.secondary} />
                    <Text style={styles.infoText}>Contact: {parent.ContactInformation}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(parent)}
                  >
                    <Ionicons name="pencil" size={16} color={COLORS.white} />
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(parent.ParentID)}
                  >
                    <Ionicons name="trash" size={16} color={COLORS.white} />
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      <AddParentModalComponent
        visible={modalVisible}
        isEditing={isEditing}
        parentData={newParent}
        originalParentDataForEdit={originalParentForEdit}
        onParentDataChange={setNewParent}
        onCloseRequest={resetForm}
        onSaveRequest={handleModalSave}
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
  parentId: {
    fontSize: 12,
    color: COLORS.secondary,
    opacity: 0.7,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
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
  },
  infoText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  modalForm: {
    padding: 16,
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightPink,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  studentsRow: {
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightPink,
  },
  iconContainer: {
    marginTop: 4,
  },
  studentsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  relationshipLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    opacity: 0.7,
    marginBottom: 4,
  }
});

export default Parents;
