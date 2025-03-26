import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import Stories from "@/components/Stories";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useState } from "react";

export default function Index() {
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const posts = useQuery(api.posts.getFeedPosts);

  if (posts === undefined) return <Loader />;

  if (posts.length === 0) return <NoPostsFound />;

  // Mock refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Replace with actual refresh
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>spotlight</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* POSTS */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 60,
        }}
        ListHeaderComponent={<Stories />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const NoPostsFound = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={{ fontSize: 20, color: COLORS.primary }}>No posts yet</Text>
  </View>
);
