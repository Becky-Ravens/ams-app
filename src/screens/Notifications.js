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

const Notifications = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);  const [newNotification, setNewNotification] = useState({
    NotificationID: '',
    StudentID: '',
    ClassID: '',
    Date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').join('-'),
    NotificationType: '',
    NotificationText: '',
  });

  useEffect(() => {
    fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://192.168.43.253/ams_backend/api.php?table=notifications&action=read');
      const result = await response.json();
      
      if (result.status) {
        setNotifications(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch notifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('status', 'read');

      const response = await fetch(
        'http://192.168.43.253/ams_backend/api.php?table=notifications&action=update',
        {
          method: 'POST',
          body: formData,
        }
      );
      const result = await response.json();

      if (result.status) {
        fetchNotifications(); // Refresh the list
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification');
      console.error(error);
    }
  };

  const deleteNotification = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this notification?',
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
                'http://192.168.43.135/ams_backend/api.php?table=notifications&action=delete',
                {
                  method: 'POST',
                  body: formData,
                }
              );
              const result = await response.json();

              if (result.status) {
                fetchNotifications(); // Refresh the list
                Alert.alert('Success', 'Notification deleted successfully');
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notification');
              console.error(error);
            }
          },
        },
      ]
    );
  };
  const handleAddNotification = async () => {
    if (!newNotification.StudentID || !newNotification.ClassID || !newNotification.NotificationType || !newNotification.NotificationText) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {      const formData = new FormData();
      formData.append('StudentID', newNotification.StudentID);
      formData.append('ClassID', newNotification.ClassID);
      
      // Format date as MM-DD-YYYY
      const formattedDate = new Date(newNotification.Date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('/').join('-');
      formData.append('Date', formattedDate);
      
      formData.append('NotificationType', newNotification.NotificationType);
      formData.append('NotificationText', newNotification.NotificationText);

      const response = await fetch(
        'http://192.168.43.253/ams_backend/api.php?table=notifications&action=create',
        {
          method: 'POST',
          body: formData,
        }
      );
      const result = await response.json();      if (result.status) {
        fetchNotifications();
        setModalVisible(false);
        setNewNotification({
          NotificationID: '',
          StudentID: '',
          ClassID: '',
          Date: new Date().toISOString().split('T')[0],
          NotificationType: '',
          NotificationText: ''
        });
        Alert.alert('Success', 'Notification added successfully');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add notification');
      console.error(error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'attendance':
        return 'calendar';
      case 'grade':
        return 'school';
      case 'event':
        return 'megaphone';
      case 'alert':
        return 'warning';
      default:
        return 'notifications';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.NotificationID || index}
              style={[
                styles.card,
                { opacity: notification.status === 'read' ? 0.7 : 1 }
              ]}
              onPress={() => markAsRead(notification.NotificationID)}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={getNotificationIcon(notification.type)}
                    size={24}
                    color={COLORS.primary}
                  />
                </View>                <View style={styles.textContainer}>
                  <Text style={styles.idText}>ID: {notification.NotificationID}</Text>
                  <Text style={styles.idText}>Student ID: {notification.StudentID}</Text>
                  <Text style={styles.idText}>Class ID: {notification.ClassID}</Text>
                  <Text style={styles.type}>Type: {notification.NotificationType}</Text>
                  <Text style={styles.message}>{notification.NotificationText}</Text>
                  <Text style={styles.timestamp}>
                    {formatDate(notification.Date)}
                  </Text>
                </View>
                {notification.status === 'unread' && (
                  <View style={styles.unreadDot} />
                )}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteNotification(notification.NotificationID)}
              >
                <Ionicons name="trash" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>            <Text style={styles.modalTitle}>Add New Notification</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Student ID"
              value={newNotification.StudentID}
              onChangeText={(text) => setNewNotification({ ...newNotification, StudentID: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Class ID"
              value={newNotification.ClassID}
              onChangeText={(text) => setNewNotification({ ...newNotification, ClassID: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Date"
              value={newNotification.Date}
              onChangeText={(text) => setNewNotification({ ...newNotification, Date: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Notification Type"
              value={newNotification.NotificationType}
              onChangeText={(text) => setNewNotification({ ...newNotification, NotificationType: text })}
            />
            
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Notification Text"
              value={newNotification.NotificationText}
              onChangeText={(text) => setNewNotification({ ...newNotification, NotificationText: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {                  setModalVisible(false);
                  setNewNotification({
                    NotificationID: '',
                    StudentID: '',
                    ClassID: '',
                    Date: new Date().toISOString().split('T')[0],
                    NotificationType: '',
                    NotificationText: ''
                  });
                }}
              >
                <Ionicons name="close-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddNotification}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Add Notification</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: COLORS.background,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    marginBottom: 12,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },  idText: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
    fontWeight: '500',
  },
  type: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
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
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
});

export { Notifications as default };
