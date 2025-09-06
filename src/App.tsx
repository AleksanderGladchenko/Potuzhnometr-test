import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Pressable, StatusBar } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolateColor } from 'react-native-reanimated';

const METER_SEGMENTS = 20; // Количество сегментов в шкале

function App(): React.JSX.Element {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');

    const powerLevel = useSharedValue(0); // от 0 до 1
    const explosionOpacity = useSharedValue(0);

    // Функция для симуляции
    const detectColor = (color: 'blue' | 'yellow' | 'both' | 'none') => {
        explosionOpacity.value = withTiming(0);
        if (color === 'blue' || color === 'yellow') {
            powerLevel.value = withTiming(0.5, { duration: 300, easing: Easing.ease });
        } else if (color === 'both') {
            powerLevel.value = withTiming(1, { duration: 300, easing: Easing.ease });
            setTimeout(() => { explosionOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }, () => {
                explosionOpacity.value = withTiming(0, { duration: 1000 });
            }); }, 300);
        } else {
            powerLevel.value = withTiming(0, { duration: 300, easing: Easing.ease });
        }
    };

    useEffect(() => {
        if (!hasPermission) { requestPermission(); }
    }, [hasPermission, requestPermission]);

    if (device == null || !hasPermission) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>{!hasPermission ? "Waiting for camera permission..." : "Loading camera..."}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />

            <View style={styles.uiContainer}>
                <Text style={styles.title}>🇺🇦 ПОТУЖНОМЕТР</Text>

                <View style={styles.meterContainer}>
                    {Array.from({ length: METER_SEGMENTS }).map((_, index) => {
                        const segmentPower = (index + 1) / METER_SEGMENTS;
                        const animatedSegmentStyle = useAnimatedStyle(() => {
                            const isActive = powerLevel.value >= segmentPower;
                            const color = interpolateColor(
                                powerLevel.value,
                                [0, 0.5, 1],
                                ['rgba(0, 255, 0, 0.3)', 'rgba(255, 255, 0, 0.8)', 'rgba(255, 0, 0, 1)']
                            );
                            return {
                                backgroundColor: isActive ? color : 'rgba(255, 255, 255, 0.2)',
                            };
                        });
                        return <Animated.View key={index} style={[styles.meterSegment, animatedSegmentStyle]} />;
                    })}
                </View>

                <Animated.Text style={[styles.explosionText, { opacity: explosionOpacity }]}>
                    💥 ПОТУЖНО! 💥
                </Animated.Text>

                <View style={styles.buttonContainer}>
                    <Pressable style={styles.button} onPress={() => detectColor('blue')}><Text style={styles.buttonText}>Синій</Text></Pressable>
                    <Pressable style={styles.button} onPress={() => detectColor('yellow')}><Text style={styles.buttonText}>Жовтий</Text></Pressable>
                    <Pressable style={styles.button} onPress={() => detectColor('both')}><Text style={styles.buttonText}>Обидва</Text></Pressable>
                    <Pressable style={styles.button} onPress={() => detectColor('none')}><Text style={styles.buttonText}>Скинути</Text></Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    loadingContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'white', fontSize: 16, marginTop: 10 },
    uiContainer: { position: 'absolute', bottom: 50, left: 20, right: 20 },
    title: { color: 'white', fontSize: 28, fontWeight: '900', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5, marginBottom: 20 },
    meterContainer: { flexDirection: 'row', width: '100%', height: 30, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 15, borderWidth: 2, borderColor: 'white', overflow: 'hidden' },
    meterSegment: { flex: 1, height: '100%', marginHorizontal: 1, borderRadius: 5 },
    explosionText: { position: 'absolute', alignSelf: 'center', top: -200, fontSize: 60, fontWeight: 'bold', color: 'yellow', textShadowColor: 'red', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
    buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 30 },
    button: { backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, margin: 5 },
    buttonText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});

export default App;