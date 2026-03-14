import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHooks from "../../hooks/AuthHooks";

export default function LoginScreen() {
  const {
    credentials,
    registerForm,
    isLoggedIn,
    loading,
    error,
    handleLoginInput,
    handleRegisterInput,
    loginSubmit,
  } = AuthHooks();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Welcome to Auralis</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username or Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleLoginInput("email", value)}
            value={credentials.email}
            placeholder="you@company.com"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{"Password"}</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleLoginInput("password", value)}
            value={credentials.password}
            secureTextEntry={true}
            placeholder="Enter your password"
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={loginSubmit}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },

  formCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    padding: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 28,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#111",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#000",
    backgroundColor: "#fafafa",
  },

  loginButton: {
    marginTop: 12,
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  loginText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  googleButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  googleText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
});
