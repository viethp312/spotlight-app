import { ScrollView } from "react-native";

import { STORIES } from "@/constants/mock-data";
import { styles } from "@/styles/feed.styles";
import Story from "./Story";

export default function Stories() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={true}
      style={styles.storiesContainer}
    >
      {STORIES.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </ScrollView>
  );
}
