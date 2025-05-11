// Primary colors (pulled from Figma “Primary / 500” and “Primary / 700” styles)
const primaryColor = "#385FFF";
const primaryColorDark = "#375FFF";

// Accent colors (e.g. “Accent / Light” & “Accent / Dark”)
const accentColorLight = "#FF6B6B";
const accentColorDark = "#E55A5A";

// Text colors (e.g. “Text / Primary” & “Text / Inverse”)
const textColorLight = "#000000";
const textColorDark = "#FFFFFF";

// Background colors (e.g. “Surface / Light Background” & “Surface / Dark Background”)
const backgroundColorLight = "#385FFF";
const backgroundColorDark = "#131313";

// Surface colors (e.g. cards, panels — usually “Surface / Primary”)
const surfaceColorLight = "#FFFFFF";
const surfaceColorDark = "#161616";

export const Colors = {
  light: {
    primary: primaryColor,
    accent: accentColorLight,
    text: textColorLight,
    background: backgroundColorLight,
    surface: surfaceColorLight,

    border: "#E0E0E0",
    icon: "#555555",
    tabIconDefault: "#AAAAAA",
    tabIconSelected: primaryColor,

    success: "#4CAF50",
    warning: "#FFC107",
    error: "#F44336",
    info: "#2196F3",
  },
  dark: {
    primary: primaryColorDark,
    accent: accentColorDark,
    text: textColorDark,
    background: backgroundColorDark,
    surface: surfaceColorDark,

    border: "#222222",
    icon: "#BBBBBB",
    tabIconDefault: "#888888",
    tabIconSelected: primaryColorDark,

    success: "#2CC069",
    warning: "#FDCF41",
    error: "#E94242",
    info: "#7BCBCF",
  },
};
