import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

/**
 * Checks if the current user allows adult content
 * Returns true if user allows it, false if they don't or if not logged in
 */
export const getUserAllowsAdultContent = async (): Promise<boolean> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    // Guests don't see adult content by default
    return false;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const data = userDoc.data();
    return Boolean(data?.preferences?.allowAdultContent);
  } catch (error) {
    console.error("Error checking adult content preference:", error);
    // Default to false on error
    return false;
  }
};

/**
 * Filters items based on adult content preference
 * @param items Array of items to filter
 * @param allowAdultContent Whether to show adult content (defaults to checking user preference)
 */
export const filterAdultContent = async <T extends { isAdultContent?: boolean }>(
  items: T[],
  allowAdultContent?: boolean
): Promise<T[]> => {
  const shouldAllow = allowAdultContent !== undefined 
    ? allowAdultContent 
    : await getUserAllowsAdultContent();
  
  if (shouldAllow) {
    // User allows adult content, show all items
    return items;
  }
  
  // Filter out adult content
  return items.filter((item) => !item.isAdultContent);
};

