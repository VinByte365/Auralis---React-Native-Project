import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHooks from "../../hooks/AuthHooks";

export default function LoginScreen() {
  const {
    credentials,
    isLoggedIn,
    loading,
    formError,
    navigation,
    handleLoginInput,
    loginSubmit,
    googleSignInHandler,
  } = AuthHooks();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Welcome to Auralis</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleLoginInput("email", value)}
            value={credentials.email}
            placeholder="you@company.com"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {formError?.email && (
            <Text style={styles.formError}>{formError.email}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleLoginInput("password", value)}
            value={credentials.password}
            secureTextEntry
            placeholder="Enter your password"
            placeholderTextColor="#888"
          />
          {formError?.password && (
            <Text style={styles.formError}>{formError.password}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={loginSubmit}>
          <Text style={styles.primaryText}>
            {loading ? "Signing In..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={googleSignInHandler}
          disabled={loading}
        >
          <Text style={styles.secondaryText}>
            {loading ? "Signing In..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        {formError?.general && (
          <Text style={styles.formError}>{formError.general}</Text>
        )}

        <Text style={styles.registerText}>
          Don't have an account?{" "}
          <Text
            style={styles.registerLink}
            onPress={() =>
              navigation.navigate("auth", {
                screen: "Register",
              })
            }
          >
            Sign up
          </Text>
        </Text>
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
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#000",
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    marginBottom: 28,
  },

  inputGroup: {
    marginBottom: 16,
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

  primaryButton: {
    marginTop: 10,
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },

  primaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },

  secondaryText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },

  formError: {
    marginBottom: 8,
    color: "red",
    fontSize: 12,
  },

  registerText: {
    marginTop: 20,
    fontSize: 13,
    textAlign: "center",
    color: "#444",
  },

  registerLink: {
    fontWeight: "600",
    color: "#000",
  },
});
