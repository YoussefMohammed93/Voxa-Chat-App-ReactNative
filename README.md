# Voxa Chat

<div align="center">
  <img src="./assets/images/logo.jpg" alt="Voxa Chat Logo" width="120" />
  <h3>A modern WhatsApp-style messaging application</h3>
</div>

## 📱 Overview

Voxa Chat is a feature-rich mobile messaging application built with React Native and Expo. It provides a seamless and intuitive messaging experience similar to popular apps like WhatsApp and Telegram. With Voxa Chat, users can easily connect with friends and family through text messages, voice messages, and media sharing.

## ✨ Key Features

- **Real-time Messaging**: Send and receive messages instantly
- **Media Sharing**: Share images with captions
- **Voice Messages**: Record and send voice messages
- **Message Interactions**: Reply to messages, delete messages, and view message info
- **User Profiles**: Customize your profile with photos and personal information
- **Theme Support**: Choose between light and dark themes
- **Notifications**: Receive in-app notifications for new messages
- **Secure Authentication**: Phone number verification for account security
- **Intuitive UI**: WhatsApp-inspired user interface with smooth animations

## 🛠️ Technologies Used

- **Frontend**:

  - [React Native](https://reactnative.dev/) - Cross-platform mobile framework
  - [Expo](https://expo.dev/) - React Native development platform
  - [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing for Expo apps
  - [React Navigation](https://reactnavigation.org/) - Navigation library for React Native

- **Backend & Data**:

  - [Convex](https://www.convex.dev/) - Backend-as-a-service with real-time data sync
  - [Firebase Authentication](https://firebase.google.com/docs/auth) - Phone number authentication

- **UI & Interactions**:
  - [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) - Animations library
  - [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) - Touch handling
  - [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/) - Image component with caching
  - [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/) - Audio/video playback and recording

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Convex CLI](https://docs.convex.dev/quickstart) (for backend development)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/voxa-chat.git
cd voxa-chat
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_CONVEX_URL=your_convex_deployment_url
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

4. **Start the development server**

```bash
npm start
# or
yarn start
```

5. **Run on a device or emulator**

```bash
# For iOS
npm run ios
# or
yarn ios

# For Android
npm run android
# or
yarn android
```

## 📁 Project Structure

```
voxa-chat/
├── app/                  # Expo Router app directory (screens)
│   ├── _layout.tsx       # Root layout component
│   ├── index.tsx         # Main app screen with tabs
│   ├── walkthrough.tsx   # Onboarding welcome screen
│   ├── verification.tsx  # Phone verification screen
│   └── profile.tsx       # Profile setup screen
├── assets/               # Static assets (images, fonts)
├── components/           # Reusable UI components
│   ├── screens/          # Screen components
│   └── ...               # Other UI components
├── constants/            # App constants and theme configuration
├── contexts/             # React context providers
├── convex/               # Convex backend code
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User-related functions
│   ├── chats.ts          # Chat-related functions
│   └── messages.ts       # Message-related functions
├── hooks/                # Custom React hooks
├── models/               # Data models and types
├── services/             # Service modules
│   ├── auth-state.ts     # Authentication state management
│   ├── firebase-auth.ts  # Firebase authentication
│   └── ...               # Other services
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🔄 Onboarding Flow

Voxa Chat features a comprehensive onboarding flow:

1. **Welcome Screen**: Introduction to the app with terms and privacy policy
2. **Phone Verification**: Secure authentication using phone number verification
3. **Profile Setup**: User profile creation with name and optional profile photo
4. **Main App**: After completing onboarding, users are taken to the main app

## 💬 Messaging Features

- **Text Messages**: Send and receive text messages in real-time
- **Image Messages**: Share images with optional captions
- **Voice Messages**: Record and send voice messages with a press-and-hold interface
- **Message Actions**: Reply to messages, view message info, and delete messages
- **Swipe to Reply**: Quickly reply to messages by swiping right
- **Context Menu**: Long-press on messages to access additional options

## 🎨 UI/UX Features

- **WhatsApp-style Design**: Familiar and intuitive user interface
- **Dark Mode Support**: Toggle between light and dark themes
- **Haptic Feedback**: Tactile feedback for interactions
- **Smooth Animations**: Fluid transitions and animations
- **Empty States**: User-friendly empty state displays
- **Image Viewer**: Full-screen image viewing with zoom and swipe navigation

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native development platform
- [Convex](https://www.convex.dev/) for the real-time backend services
- [React Navigation](https://reactnavigation.org/) for the navigation system
- All the open-source libraries that made this project possible
