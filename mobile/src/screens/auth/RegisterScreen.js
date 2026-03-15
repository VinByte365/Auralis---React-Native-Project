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

export default function RegisterScreen() {
  const {
    registerForm,
    loading,
    error,
    handleRegisterInput,
    registerSubmit,
    navigation,
  } = AuthHooks();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Create an Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleRegisterInput("name", value)}
            value={registerForm.name}
            placeholder="John Doe"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleRegisterInput("email", value)}
            value={registerForm.email}
            placeholder="you@company.com"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleRegisterInput("password", value)}
            value={registerForm.password}
            secureTextEntry={true}
            placeholder="Enter your password"
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={registerSubmit}>
          <Text style={styles.loginText}>
            {loading ? "Creating Account..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.signInText}>
          Already have an account?{" "}
          <Text
            style={{
              fontWeight: 600,
            }}
            onPress={() => {
              navigation.navigate("auth", {
                screen: "Login",
              });
            }}
          >
            Sign in
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

  error: {
    marginTop: 10,
    color: "red",
    fontSize: 13,
  },

  signInText: {
    marginTop: 15,
    color: "#000",
    font: 13,
    textAlign: "center",
  },
});
