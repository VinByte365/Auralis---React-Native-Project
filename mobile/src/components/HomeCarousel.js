import React, { useState } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

export default function HomeCarousel({ data }) {
  const [index, setIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Carousel
        width={width - 40}
        height={180}
        data={data}
        autoPlay
        autoPlayInterval={3000}
        loop
        onSnapToItem={(i) => setIndex(i)}
        renderItem={({ item }) => (
          <Image source={item.image} style={styles.image} />
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {data.map((_, i) => (
          <View key={i} style={[styles.dot, index === i && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },

  pagination: {
    flexDirection: "row",
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#000",
    width: 18,
  },
});
