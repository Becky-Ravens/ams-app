import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Animated, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import OnboardingItem from '../components/OnboardingItem';
import { COLORS } from '../constants/colors';

const onboardingData = [
    {
        id: '1',
        title: 'Track Attendance Easily',
        description: 'Monitor student attendance in real-time with our intuitive tracking system',
        image: require('../../assets/attendance.png'),
    },
    {
        id: '2',
        title: 'Generate Reports',
        description: 'Create detailed attendance reports with just a few taps',
        image: require('../../assets/report.png'),
    },
    {
        id: '3',
        title: 'Stay Connected',
        description: 'Keep everyone in the loop with instant notifications and updates',
        image: require('../../assets/notification.png'),
    },
];

export default function Onboarding({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);
    const { width } = useWindowDimensions();

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        setCurrentIndex(viewableItems[0]?.index ?? 0);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = () => {
        if (currentIndex < onboardingData.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.replace('GetStarted');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.flatListContainer}>
                <FlatList 
                    data={onboardingData}
                    renderItem={({ item }) => <OnboardingItem item={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>
            
            <View style={styles.footer}>
                <View style={styles.paginationDots}>
                    {onboardingData.map((_, index) => {
                        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                        
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 20, 10],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View 
                                style={[
                                    styles.dot, 
                                    { width: dotWidth, opacity }
                                ]} 
                                key={index.toString()} 
                            />
                        );
                    })}
                </View>
                
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={scrollTo}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flatListContainer: {
        flex: 3,
    },
    footer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    paginationDots: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginHorizontal: 8,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
