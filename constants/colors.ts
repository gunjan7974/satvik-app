// constants/Colors.ts
const Colors = {
    // === Backgrounds ====
    bgMain: "#FFF4EA", // या "#FF4EA" अगर सही color code है
    bgWhite: "#FFFFFF",
    
    // === Borders ====
    borderLight: "#EDEDED",
    
    // === Brand / Primary ====
    primary: "#FF8A00",
    
    // === Text ====
    textDark: "#1A1A1A",
    textBody: "#7A7A7A",
    
    // === Status ====
    success: "#2FCC71", // green (veg dot)

  /* ================= BACKGROUNDS ================= */
  background: {
    primary: "#FFFFFF",
    secondary: "#F9FAFB",
  },

  card: {
    primary: "#FFF7ED",
  },

  input: {
    background: "#F3F4F6",
  },

  /* ================= TEXT ================= */
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    light: "#9CA3AF",
    white: "#FFFFFF",
  },

  /* ================= ORANGE THEME ================= */
  orange: {
    primary: "#FF8A00",
    dark: "#EA580C",
  },

  peach: {
    light: "#FFE5D0",
  },

  /* ================= STATUS COLORS ================= */
  status: {
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
  },

  /* ================= BORDERS ================= */
  border: {
    light: "#E5E7EB",
  },

  /* ================= SHADOWS ================= */
  shadow: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 6,
    },
  },

  /* ================= UTIL ================= */
  withOpacity: (color: string, opacity: number) => {
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },
};

export default Colors;