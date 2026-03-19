import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

export default function ProfileScreen() {
  const user = useSelector((state) => state.auth.user);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.label}>Name: {user?.name || "-"}</Text>
        <Text style={styles.label}>Email: {user?.email || "-"}</Text>
        <Text style={styles.label}>Role: {user?.role || "user"}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
  },
});
