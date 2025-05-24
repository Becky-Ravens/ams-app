import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Image } from 'react-native';
import { COLORS } from '../constants/colors';

export default function OnboardingItem({ item }) {
    const { width } = useWindowDimensions();

    return (
        <View style={[styles.container, { width }]}>
            <Image 
                source={item.image} 
                style={[styles.image, { width: width * 0.8, resizeMode: 'contain' }]} 
            />
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        flex: 0.7,
        justifyContent: 'center',
    },
    content: {
        flex: 0.3,
        alignItems: 'center',
    },
    title: {
        fontWeight: '800',
        fontSize: 28,
        marginBottom: 10,
        color: COLORS.secondary,
        textAlign: 'center',
    },
    description: {
        fontWeight: '300',
        color: COLORS.textLight,
        textAlign: 'center',
        paddingHorizontal: 64,
        fontSize: 16,
    },
});
