import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "@clerk/clerk-expo";
import { styles } from "@/styles/auth.styles";

export default function index() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => signOut()}>
        <Text style={{color: "white"}}>Signout</Text>
      </TouchableOpacity>
    </View>
  );
}
