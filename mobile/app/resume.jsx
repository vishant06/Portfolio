import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EmptyState, ErrorState, LoadingState } from "../components/RequestStates.jsx";
import Screen from "../components/Screen.jsx";
import { useAppTheme } from "../context/ThemeContext.jsx";
import { absoluteAsset } from "../services/api.js";
import { getLatestResume } from "../services/resume.js";
import { radius } from "../constants/theme.js";

export default function Resume() {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
  const [resume, setResume] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setResume(await getLatestResume());
      setStatus("idle");
    } catch (error) {
      setStatus(error.status === 404 ? "empty" : "error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (status === "loading") return <Screen><LoadingState label="Loading resume..." /></Screen>;
  if (status === "error") return <Screen><ErrorState onRetry={load} /></Screen>;
  if (status === "empty" || !resume?.fileUrl) return <Screen><EmptyState title="No resume uploaded yet" /></Screen>;

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="document-text" size={34} color={colors.accent} />
        </View>
        <Text style={styles.title}>Resume</Text>
        <Text style={styles.muted}>View or download the latest resume.</Text>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(absoluteAsset(resume.fileUrl))}>
          <Ionicons name="open-outline" size={16} color={colors.accentText} />
          <Text style={styles.buttonText}>Open resume</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
    iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surfaceSolid, alignItems: "center", justifyContent: "center", marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    title: { color: colors.text, fontSize: 20, fontWeight: "800" },
    muted: { color: colors.muted, fontSize: 13, marginBottom: 8 },
    button: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 20, paddingVertical: 12 },
    buttonText: { color: colors.accentText, fontWeight: "800" },
  });
