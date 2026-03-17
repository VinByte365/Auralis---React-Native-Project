import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CategorySelector({
  categories = [],
  selectedCategory,
  onSelectCategory,
}) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category._id;

          return (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryCard,
                isActive && styles.categoryCardActive,
              ]}
              onPress={() => onSelectCategory(category._id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}
              >
                {category.categoryName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryCard: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  categoryCardActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
  },
});
