import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { COLORS } from '../constants/colors';

export default function GetStarted({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Image 
                    source={require('../../assets/attendance.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>Attendance Monitoring</Text>
                <Text style={styles.subtitle}>Track attendance efficiently</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.button, styles.loginButton]}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={[styles.buttonText, styles.loginButtonText]}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.registerButton]}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={[styles.buttonText, styles.registerButtonText]}>Register</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.lightPink,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.secondary,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    footer: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        marginVertical: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: COLORS.primary,
    },
    loginButtonText: {
        color: COLORS.white,
    },
    registerButton: {
        backgroundColor: COLORS.mediumPink,
    },
    registerButtonText: {
        color: COLORS.secondary,
    },
});
