import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const data = [
  { id: 1, title: "テスト1", disp: 1 },
  { id: 2, title: "テスト1", disp: 1 },
  { id: 3, title: "テスト1", disp: 3 },
  { id: 4, title: "テスト1", disp: 4 },
  { id: 5, title: "テスト1", disp: 4 },
];

export default function Test() {
  const renderItemsForLane = (laneNumber: any) => {
    return data
      .filter(item => item.disp === laneNumber)
      .map(item => (
        <Text key={item.id}>{item.title}</Text>
      ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.lane}>
        <Text>レーン1</Text>
        {renderItemsForLane(1)}
      </View>
      <View style={styles.lane}>
        <Text>レーン2</Text>
        {renderItemsForLane(2)}
      </View>
      <View style={styles.lane}>
        <Text>レーン3</Text>
        {renderItemsForLane(3)}
      </View>
      <View style={styles.lane}>
        <Text>レーン4</Text>
        {renderItemsForLane(4)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  lane: {
    marginBottom: 20,
  },
});
