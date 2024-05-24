import { View, Text, Button, SafeAreaView, StyleSheet } from 'react-native';
import React from 'react';
import 'react-native-reanimated'; // おまじない
import Calendar from '../Calendar';

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Calendar/>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  calendar: {
    flex: 1,
  },
});
