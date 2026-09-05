import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Screen from "../../components/Screen.jsx";
import { useAppTheme } from "../../context/ThemeContext.jsx";
import { radius } from "../../constants/theme.js";
import { execute } from "../../services/playground.js";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", demo: 'console.log("Hello from JavaScript!");' },
  { id: "python", label: "Python", demo: 'print("Hello from Python!")' },
  { id: "java", label: "Java", demo: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}' },
  { id: "cpp", label: "C++", demo: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello from C++!" << endl;\n  return 0;\n}' },
  { id: "c", label: "C", demo: '#include <stdio.h>\n\nint main(void) {\n  printf("Hello from C!\\n");\n  return 0;\n}' },
];

export default function Playground() {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  const [languageId, setLanguageId] = useState("javascript");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [code, setCode] = useState(LANGUAGES[0].demo);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);
  // True reversible toggle: ON hides the toolbar labels/stdin box so the
  // editor gets nearly the full screen; OFF restores the normal layout —
  // exactly the same state either way you got there from.
  const [fitToScreen, setFitToScreen] = useState(false);

  const language = LANGUAGES.find((item) => item.id === languageId);

  const selectLanguage = (id) => {
    setLanguageId(id);
    setCode(LANGUAGES.find((item) => item.id === id)?.demo || "");
    setOutput([]);
    setPickerOpen(false);
  };

  const run = async () => {
    setRunning(true);
    setOutput([{ type: "info", text: "Running..." }]);
    try {
      const result = await execute({ language: languageId, code, stdin });
      const lines = [result.stdout, result.compileOutput, result.stderr, result.message].filter(Boolean);
      setOutput(
        lines.length
          ? lines.map((text) => ({ type: result.success ? "success" : "error", text }))
          : [{ type: result.success ? "success" : "error", text: result.success ? "Execution completed with no output." : (result.status || "Execution error") }]
      );
    } catch (error) {
      setOutput([{ type: "error", text: error.message }]);
    } finally {
      setRunning(false);
    }
  };

  const clear = () => { setCode(""); setOutput([]); };
  const copy = () => Clipboard.setStringAsync(code);

  return (
    <Screen>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.languageButton} onPress={() => setPickerOpen(true)}>
          <Text style={styles.languageButtonText}>{language?.label}</Text>
        </TouchableOpacity>
        <View style={styles.toolbarActions}>
          {!fitToScreen && (
            <>
              <TouchableOpacity style={styles.iconButton} onPress={copy}><Text style={styles.iconButtonText}>Copy</Text></TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={clear}><Text style={styles.iconButtonText}>Clear</Text></TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.fitButton, fitToScreen && styles.fitButtonActive]}
            onPress={() => setFitToScreen((value) => !value)}
          >
            <Ionicons name={fitToScreen ? "contract-outline" : "expand-outline"} size={15} color={fitToScreen ? colors.accentText : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.runButton} onPress={run} disabled={running}>
            {running ? <ActivityIndicator color={colors.accentText} size="small" /> : <Text style={styles.runButtonText}>Run</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.editorWrap} contentContainerStyle={{ flexGrow: 1 }}>
        <TextInput
          value={code}
          onChangeText={setCode}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.editor}
          placeholder="Write your code here..."
          placeholderTextColor={colors.muted}
        />
      </ScrollView>

      {!fitToScreen && (
        <>
          <TextInput
            value={stdin}
            onChangeText={setStdin}
            placeholder="Optional standard input..."
            placeholderTextColor={colors.muted}
            style={styles.stdin}
          />
          <View style={styles.consolePanel}>
            <Text style={styles.consoleLabel}>Console</Text>
            <ScrollView style={{ maxHeight: 140 }}>
              {output.map((line, index) => (
                <Text key={index} style={[styles.consoleLine, styles[`console_${line.type}`]]}>{line.text}</Text>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalCard}>
            {LANGUAGES.map((item) => (
              <TouchableOpacity key={item.id} style={styles.modalRow} onPress={() => selectLanguage(item.id)}>
                <Text style={styles.modalRowText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    toolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12 },
    languageButton: { backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
    languageButtonText: { color: colors.text, fontWeight: "700", fontSize: 13 },
    toolbarActions: { flexDirection: "row", gap: 8, alignItems: "center" },
    iconButton: { paddingHorizontal: 10, paddingVertical: 8 },
    iconButtonText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
    fitButton: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    fitButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    runButton: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 8, minWidth: 60, alignItems: "center" },
    runButtonText: { color: colors.accentText, fontWeight: "800" },
    editorWrap: { flex: 1, marginHorizontal: 12, backgroundColor: colors.mode === "light" ? "#0f172a" : "#0b1220", borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
    editor: { flex: 1, color: "#e2e8f0", fontFamily: "monospace", fontSize: 13, padding: 14, textAlignVertical: "top" },
    stdin: { margin: 12, marginTop: 8, backgroundColor: colors.mode === "light" ? "#0f172a" : "#0b1220", borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: "#e2e8f0", padding: 12, fontFamily: "monospace", fontSize: 12.5 },
    consolePanel: { margin: 12, marginTop: 0, backgroundColor: colors.mode === "light" ? "#0f172a" : "#050913", borderRadius: radius.md, padding: 12, minHeight: 60 },
    consoleLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", marginBottom: 6 },
    consoleLine: { fontFamily: "monospace", fontSize: 12.5, marginBottom: 2 },
    console_info: { color: colors.muted },
    console_success: { color: colors.success },
    console_error: { color: colors.danger },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 30 },
    modalCard: { backgroundColor: colors.surfaceSolid, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    modalRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalRowText: { color: colors.text, fontWeight: "600" },
  });
