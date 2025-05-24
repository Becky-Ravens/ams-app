import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';

const AddInstructor = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    ContactInformation: '',
  });

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.FirstName || !formData.LastName || !formData.ContactInformation) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.43.253/ams_backend/api.php?table=instructors&action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.status) {
        Alert.alert('Success', 'Instructor added successfully');
        navigation.goBack(); // Return to instructors list
      } else {
        Alert.alert('Error', result.message || 'Failed to add instructor');
      }
    } catch (error) {
      console.error('Error adding instructor:', error);
      Alert.alert('Error', 'Failed to add instructor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={formData.FirstName}
            onChangeText={(text) => setFormData({ ...formData, FirstName: text })}
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formData.LastName}
            onChangeText={(text) => setFormData({ ...formData, LastName: text })}
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Information</Text>
          <TextInput
            style={styles.input}
            value={formData.ContactInformation}
            onChangeText={(text) => setFormData({ ...formData, ContactInformation: text })}
            placeholder="Enter email or phone"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Add Instructor</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddInstructor;
