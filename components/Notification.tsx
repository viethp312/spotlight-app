import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/notifications.styles";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Link } from "expo-router";

export default function Notification({ notification }: any) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Link href={`/(tabs)/notifications`} asChild>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={notification.sender.image}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.iconBadge}>
              {notification.type === "like" ? (
                <Ionicons name="heart" size={14} color={COLORS.primary} />
              ) : notification.type === "follow" ? (
                <Ionicons name="person-add" size={14} color="#8B85CF" />
              ) : (
                <Ionicons name="chatbubble" size={14} color="#3B82F6" />
              )}
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.notificationInfo}>
          <Link href={`/(tabs)/notifications`} asChild>
            <TouchableOpacity>
              <Text style={styles.username}>
                {notification.sender.username}
              </Text>
            </TouchableOpacity>
          </Link>

          <Text style={styles.action}>
            {notification.type === "follow"
              ? "started following you"
              : notification.type === "like"
                ? "liked your post"
                : `commented: "${notification.comment}"`}
          </Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(notification._creationTime, {
              addSuffix: true,
            })}
          </Text>
        </View>
      </View>

      {notification.post && (
        <Image
          source={notification.post.imageUrl}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}
    </View>
  );
}
