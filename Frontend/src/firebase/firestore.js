import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

/* =========================================================
   USERS
   ========================================================= */

export async function getUser(userId) {
  if (!userId) return null;

  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/* =========================================================
   SEARCH USERS
   ========================================================= */

export async function searchUsers(queryText) {
  const text = queryText?.trim().toLowerCase();

  if (!text) {
    return [];
  }

  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const users = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return users.filter((user) => {
    const name = String(user.name || "").toLowerCase();
    const username = String(user.username || "").toLowerCase();
    const email = String(user.email || "").toLowerCase();

    return (
      name.includes(text) ||
      username.includes(text) ||
      email.includes(text)
    );
  });
}

/* =========================================================
   FRIEND REQUESTS
   ========================================================= */

export async function sendFriendRequest(
  senderId,
  receiverId
) {
  if (!senderId || !receiverId) {
    throw new Error("Sender and receiver are required");
  }

  if (senderId === receiverId) {
    throw new Error(
      "You cannot send a friend request to yourself"
    );
  }

  const requestsRef = collection(
    db,
    "friendRequests"
  );

  // Check existing pending request
  const existingQuery = query(
    requestsRef,
    where("senderId", "==", senderId),
    where("receiverId", "==", receiverId),
    where("status", "==", "pending")
  );

  const existingSnapshot = await getDocs(
    existingQuery
  );

  if (!existingSnapshot.empty) {
    throw new Error("Friend request already sent");
  }

  // Create request
  const requestRef = await addDoc(
    requestsRef,
    {
      senderId,
      receiverId,
      status: "pending",
      createdAt: serverTimestamp(),
    }
  );

  return {
    requestId: requestRef.id,
    status: "pending",
  };
}

/* =========================================================
   GET RECEIVED REQUESTS
   ========================================================= */

export async function getReceivedRequests(userId) {
  if (!userId) return [];

  const requestsRef = collection(
    db,
    "friendRequests"
  );

  const q = query(
    requestsRef,
    where("receiverId", "==", userId),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((request) => ({
    requestId: request.id,
    ...request.data(),
  }));
}

/* =========================================================
   GET SENT REQUESTS
   ========================================================= */

export async function getSentRequests(userId) {
  if (!userId) return [];

  const requestsRef = collection(
    db,
    "friendRequests"
  );

  const q = query(
    requestsRef,
    where("senderId", "==", userId),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((request) => ({
    requestId: request.id,
    ...request.data(),
  }));
}

/* =========================================================
   ACCEPT FRIEND REQUEST
   ========================================================= */

export async function acceptFriendRequest(
  requestId,
  user1,
  user2
) {
  if (!requestId || !user1 || !user2) {
    throw new Error("Invalid friend request data");
  }

  if (user1 === user2) {
    throw new Error(
      "A user cannot be friends with themselves"
    );
  }

  // Update request status
  const requestRef = doc(
    db,
    "friendRequests",
    requestId
  );

  await updateDoc(requestRef, {
    status: "accepted",
  });

  // Add user2 to user1's friends
  await setDoc(
    doc(db, "users", user1, "friends", user2),
    {
      userId: user2,
      createdAt: serverTimestamp(),
    }
  );

  // Add user1 to user2's friends
  await setDoc(
    doc(db, "users", user2, "friends", user1),
    {
      userId: user1,
      createdAt: serverTimestamp(),
    }
  );

  return true;
}

/* =========================================================
   REJECT FRIEND REQUEST
   ========================================================= */

export async function rejectFriendRequest(
  requestId
) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }

  const requestRef = doc(
    db,
    "friendRequests",
    requestId
  );

  await updateDoc(requestRef, {
    status: "rejected",
  });

  return true;
}

/* =========================================================
   CANCEL FRIEND REQUEST
   ========================================================= */

export async function cancelFriendRequest(
  requestId
) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }

  const requestRef = doc(
    db,
    "friendRequests",
    requestId
  );

  await deleteDoc(requestRef);

  return true;
}

/* =========================================================
   GET FRIENDS
   ========================================================= */

export async function getFriends(userId) {
  if (!userId) return [];

  const friendsRef = collection(
    db,
    "users",
    userId,
    "friends"
  );

  const snapshot = await getDocs(friendsRef);

  const friends = await Promise.all(
    snapshot.docs.map(async (friendDoc) => {
      const friendId = friendDoc.id;

      const friend = await getUser(friendId);

      if (!friend) {
        return null;
      }

      return {
        ...friend,
        friendshipId: friendDoc.id,
        friendId,
      };
    })
  );

  return friends.filter(Boolean);
}

/* =========================================================
   REMOVE FRIEND
   ========================================================= */

export async function removeFriend(
  userId,
  friendId
) {
  if (!userId || !friendId) {
    throw new Error(
      "User ID and Friend ID are required"
    );
  }

  // Remove friend from current user's list
  await deleteDoc(
    doc(
      db,
      "users",
      userId,
      "friends",
      friendId
    )
  );

  // Remove current user from friend's list
  await deleteDoc(
    doc(
      db,
      "users",
      friendId,
      "friends",
      userId
    )
  );

  return true;
}

/* =========================================================
   BLOCK USER
   ========================================================= */

export async function blockUser(
  blockerId,
  blockedUserId
) {
  if (!blockerId || !blockedUserId) {
    throw new Error("Invalid block data");
  }

  if (blockerId === blockedUserId) {
    throw new Error(
      "You cannot block yourself"
    );
  }

  const blockedRef = collection(
    db,
    "blockedUsers"
  );

  const blockRef = await addDoc(
    blockedRef,
    {
      blockerId,
      blockedUserId,
      createdAt: serverTimestamp(),
    }
  );

  return {
    blockId: blockRef.id,
  };
}

/* =========================================================
   UNBLOCK USER
   ========================================================= */

export async function unblockUser(blockId) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  const blockRef = doc(
    db,
    "blockedUsers",
    blockId
  );

  await deleteDoc(blockRef);

  return true;
}

/* =========================================================
   WEATHER SHARING
   ========================================================= */

export async function updateWeatherSharing(
  userId,
  settings
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await updateDoc(userRef, settings);

  return true;
}

/* =========================================================
   LOCATION SHARING
   ========================================================= */

export async function updateLocationSharing(
  userId,
  mode
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await updateDoc(userRef, {
    locationSharing: mode,
  });

  return true;
}

/* =========================================================
   USER LOCATION
   ========================================================= */

export async function updateUserLocation(
  userId,
  latitude,
  longitude
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await updateDoc(userRef, {
    latitude,
    longitude,

    // Keep location coordinates together too
    location: {
      lat: latitude,
      lng: longitude,
    },
  });

  return true;
}

/* =========================================================
   UPDATE USER WEATHER
   ========================================================= */

export async function updateUserWeather(
  userId,
  weather
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await updateDoc(userRef, {
    weather: {
      // Supports both temperature and old temp format
      temperature:
        weather?.temperature ??
        weather?.temp ??
        null,

      condition:
        weather?.condition ?? "",

      feelsLike:
        weather?.feelsLike ?? null,

      humidity:
        weather?.humidity ?? null,

      wind:
        weather?.wind ?? null,

      rain:
        weather?.rain ?? 0,

      icon:
        weather?.icon ?? "",

      locationName:
        weather?.locationName ?? "",

      country:
        weather?.country ?? "",
    },

    weatherUpdatedAt:
      serverTimestamp(),
  });

  return true;
}