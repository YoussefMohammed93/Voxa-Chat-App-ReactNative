import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "convex/react";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Key for storing the user ID in AsyncStorage
const USER_ID_KEY = "user_id";

// Define the user context shape
interface UserContextType {
  userId: Id<"users"> | null;
  setUserId: (id: Id<"users"> | null) => void;
  findUserByPhone: (phoneNumber: string) => Promise<Id<"users"> | null>;
  userDetails: any | null; // Using any for now, will be properly typed later
  isLoading: boolean;
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  userId: null,
  setUserId: () => {},
  findUserByPhone: async () => null,
  userDetails: null,
  isLoading: true,
});

// Provider component
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userId, setUserIdState] = useState<Id<"users"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user details from Convex if we have a userId
  const userDetails = useQuery(
    api.users.getById,
    userId ? { id: userId } : "skip"
  );

  // Get the syncUserByPhoneNumber mutation
  const syncUserByPhoneMutation = useMutation(api.users.syncUserByPhoneNumber);

  // Load saved user ID on mount
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const savedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (savedUserId) {
          setUserIdState(savedUserId as Id<"users">);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load user ID:", error);
        setIsLoading(false);
      }
    };

    loadUserId();
  }, []);

  // Function to update user ID and save to storage
  const setUserId = async (id: Id<"users"> | null) => {
    setUserIdState(id);
    try {
      if (id) {
        await AsyncStorage.setItem(USER_ID_KEY, id);
      } else {
        await AsyncStorage.removeItem(USER_ID_KEY);
      }
    } catch (error) {
      console.error("Failed to save user ID:", error);
    }
  };

  // Function to find a user by phone number and set the user ID
  const findUserByPhone = async (
    phoneNumber: string
  ): Promise<Id<"users"> | null> => {
    try {
      console.log("Finding user by phone number:", phoneNumber);

      // Use the syncUserByPhoneNumber mutation to find the user
      const userId = await syncUserByPhoneMutation({ phoneNumber });

      if (userId) {
        console.log("Found user by phone number, ID:", userId);
        // Set the user ID in state and storage
        await setUserId(userId);
        return userId;
      } else {
        console.log("No user found with phone number:", phoneNumber);
        return null;
      }
    } catch (error) {
      console.error("Error finding user by phone number:", error);
      return null;
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        findUserByPhone,
        userDetails,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
