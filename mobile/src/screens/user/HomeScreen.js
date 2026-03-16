import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import HomeCarousel from "../../components/HomeCarousel";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const banners = [
    { id: 6, image: require("../../../assets/home/6.png") },
    { id: 2, image: require("../../../assets/home/2.png") },
    { id: 3, image: require("../../../assets/home/3.png") },
  ];

  const categories = [
    { id: 1, name: "Phones" },
    { id: 2, name: "Shoes" },
    { id: 3, name: "Gaming" },
    { id: 4, name: "Fashion" },
    { id: 5, name: "Accessories" },
  ];

  const products = [
    { id: 1, name: "AirPods Pro", price: "$199" },
    { id: 2, name: "Gaming Mouse", price: "$79" },
    { id: 3, name: "Nike Sneakers", price: "$120" },
    { id: 4, name: "Mechanical Keyboard", price: "$150" },
  ];

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
    </View>
  );

  return (
    <SafeAreaView>
      <FlatList
        data={products}
        renderItem={renderProduct}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.logo}>Auralis</Text>
              <TouchableOpacity>
                <Text style={styles.cart}>🛒</Text>
              </TouchableOpacity>
            </View>

            <HomeCarousel data={banners} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <View key={cat.id} style={styles.categoryCard}>
                    <Text style={styles.categoryText}>{cat.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
            </View>
          </>
        }
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },

  logo: {
    fontSize: 24,
    fontWeight: "700",
  },

  cart: {
    fontSize: 22,
  },

  section: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  categoryCard: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },

  categoryText: {
    fontSize: 14,
  },

  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
  },

  productImage: {
    height: 120,
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
    marginBottom: 10,
  },

  productName: {
    fontSize: 14,
    fontWeight: "500",
  },

  productPrice: {
    marginTop: 4,
    fontWeight: "600",
  },
});
