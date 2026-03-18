import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../services/userService";
import { hydrateSession } from "../../redux/thunks/authThunk";

const avatarPlaceholder = require("../../../assets/home/3.png");

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    contactNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  const userId = user?._id || user?.userId;

  useEffect(() => {
    setForm({
      name: user?.name || "",
      contactNumber: user?.contactNumber || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      country: user?.country || "",
    });
    setAvatarPreview(user?.avatar?.url || null);
    setAvatarFile(null);
  }, [user]);

  const pointsLabel = useMemo(() => {
    const points = Number(user?.loyaltyPoints || 0);
    return `${points} pts`;
  }, [user?.loyaltyPoints]);

  const handleFieldChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleImagePicked = (asset) => {
    if (!asset?.uri) return;

    setAvatarPreview(asset.uri);
    setAvatarFile({
      uri: asset.uri,
      name: asset.fileName || `avatar-${Date.now()}.jpg`,
      type: asset.mimeType || "image/jpeg",
    });
  };

  const pickImageFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImagePicked(result.assets?.[0]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImagePicked(result.assets?.[0]);
    }
  };

  const showAvatarOptions = () => {
    Alert.alert("Update photo", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: pickImageFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const submitProfile = async () => {
    if (!userId) {
      Alert.alert("Unable to update", "Missing user session.");
      return;
    }

    if (!form.name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile(userId, {
        name: form.name.trim(),
        contactNumber: form.contactNumber.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        avatar: avatarFile,
      });

      await dispatch(hydrateSession()).unwrap();
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      Alert.alert(
        "Update failed",
        error?.error || error?.message || "Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.avatarSection}>
          <Image
            source={avatarPreview ? { uri: avatarPreview } : avatarPlaceholder}
            style={styles.avatar}
            resizeMode={avatarPreview ? "cover" : "contain"}
          />

          <TouchableOpacity
            style={styles.photoButton}
            onPress={showAvatarOptions}
            activeOpacity={0.85}
          >
            <Text style={styles.photoButtonText}>Upload / Take Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pointsChip}>
          <Text style={styles.pointsText}>Loyalty: {pointsLabel}</Text>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(text) => handleFieldChange("name", text)}
          placeholder="Your name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.readonlyInput]}
          value={user?.email || ""}
          editable={false}
          placeholder="Email"
        />

        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          value={form.contactNumber}
          onChangeText={(text) => handleFieldChange("contactNumber", text)}
          placeholder="Contact number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={form.address}
          onChangeText={(text) => handleFieldChange("address", text)}
          placeholder="Street / address"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={form.city}
          onChangeText={(text) => handleFieldChange("city", text)}
          placeholder="City"
        />

        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          value={form.state}
          onChangeText={(text) => handleFieldChange("state", text)}
          placeholder="State"
        />

        <Text style={styles.label}>Country</Text>
        <TextInput
          style={styles.input}
          value={form.country}
          onChangeText={(text) => handleFieldChange("country", text)}
          placeholder="Country"
        />

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={submitProfile}
          disabled={isSaving}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 18,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
  },
  photoButton: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  photoButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  pointsChip: {
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    marginTop: 2,
  },
  pointsText: {
    fontSize: 12,
    color: "#444",
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    color: "#444",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
    backgroundColor: "#fff",
  },
  readonlyInput: {
    backgroundColor: "#f7f7f7",
    color: "#666",
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: "#111",
    borderRadius: 10,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
