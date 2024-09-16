import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // Import the icon set

type ImageAsset = ImagePicker.ImagePickerAsset;

export default function App() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(false);

  // Request permissions for camera and gallery access
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== "granted" || galleryStatus !== "granted") {
        Alert.alert(
          "Permissions required",
          "Sorry, we need camera and gallery permissions to make this work!"
        );
      }

      // Load images from local storage on app start
      const storedImages = await AsyncStorage.getItem("images");
      if (storedImages) {
        setImages(JSON.parse(storedImages));
      }
    })();
  }, []);

  // Save images to local storage
  useEffect(() => {
    const saveImages = async () => {
      await AsyncStorage.setItem("images", JSON.stringify(images));
    };
    saveImages();
  }, [images]);

  // Picking multiple images from the gallery
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, ...result.assets]);
    }
  };

  // Capturing multiple images from the camera (one by one)
  const captureImages = async () => {
    let result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, result.assets[0]]);
    }
  };

  // Uploading images to local storage (actually just updating the local storage)
  const uploadImages = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem("images", JSON.stringify([]));
      setImages([]);
      Alert.alert("Upload successful", "Images have been saved locally!");
    } catch (error: any) {
      Alert.alert("Upload error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Removing an image
  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Pick Images from Gallery" onPress={pickImages} />
        <Button title="Capture Images using Camera" onPress={captureImages} />
      </View>

      <View style={styles.imageContainer}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={30} color="white" />
            </TouchableOpacity>
            <Image source={{ uri: image.uri }} style={styles.image} />
          </View>
        ))}
      </View>

      {images.length > 0 && (
        <View style={styles.uploadButtonContainer}>
          <Button title="Upload Images" onPress={uploadImages} />
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
    gap: 8,
  },
  imageContainer: {
    width: "100%",
    marginBottom: 10,
  },
  imageWrapper: {
    width: "100%",
    marginBottom: 10,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    margin: 5,
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 5,
    backgroundColor: "red",
    borderRadius: 15,
    padding: 5,
    zIndex: 1,
  },
  uploadButtonContainer: {
    width: "100%",
  },
});
