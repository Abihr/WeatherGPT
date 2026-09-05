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

  try {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      console.warn("User document not found:", userId);
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("getUser error:", error);
    return null;
  }
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

export async function sendFriendRequest(senderId, receiverId) {
  if (!senderId || !receiverId) {
    throw new Error("Sender and receiver are required");
  }

  if (senderId === receiverId) {
    throw new Error("You cannot send a friend request to yourself");
  }

  const requestsRef = collection(db, "friendRequests");

  const existingQuery = query(
    requestsRef,
    where("senderId", "==", senderId),
    where("receiverId", "==", receiverId),
    where("status", "==", "pending")
  );

  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    throw new Error("Friend request already sent");
  }

  const requestRef = await addDoc(requestsRef, {
    senderId,
    receiverId,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return {
    requestId: requestRef.id,
    senderId,
    receiverId,
    status: "pending",
  };
}

/* =========================================================
   GET RECEIVED REQUESTS
========================================================= */

export async function getReceivedRequests(userId) {
  if (!userId) return [];

  const requestsRef = collection(db, "friendRequests");

  const q = query(
    requestsRef,
    where("receiverId", "==", userId),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  const requests = await Promise.all(
    snapshot.docs.map(async (requestDoc) => {
      const data = requestDoc.data();

      // Get actual sender profile
      const sender = await getUser(data.senderId);

      return {
        requestId: requestDoc.id,

        senderId: data.senderId,
        receiverId: data.receiverId,
        status: data.status,
        createdAt: data.createdAt,

        // Actual sender information
        name: sender?.name || "User",
        username: sender?.username || "",
        email: sender?.email || "",
        photoURL: sender?.photoURL || "",

        // Sender's location
        location: sender?.location || null,
        locationText: sender?.locationText || "",

        // Sender's weather
        weather: sender?.weather || null,

        // Sharing settings
        weatherSharing: sender?.weatherSharing ?? false,
        locationSharing: sender?.locationSharing || "none",
      };
    })
  );

  return requests;
}

/* =========================================================
   GET SENT REQUESTS
========================================================= */

export async function getSentRequests(userId) {
  if (!userId) return [];

  const requestsRef = collection(db, "friendRequests");

  const q = query(
    requestsRef,
    where("senderId", "==", userId),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  const requests = await Promise.all(
    snapshot.docs.map(async (requestDoc) => {
      const data = requestDoc.data();

      // Get actual receiver profile
      const receiver = await getUser(data.receiverId);

      return {
        requestId: requestDoc.id,

        senderId: data.senderId,
        receiverId: data.receiverId,
        status: data.status,
        createdAt: data.createdAt,

        // Receiver information
        name: receiver?.name || "User",
        username: receiver?.username || "",
        email: receiver?.email || "",
        photoURL: receiver?.photoURL || "",

        location: receiver?.location || null,
        locationText: receiver?.locationText || "",
        weather: receiver?.weather || null,

        weatherSharing: receiver?.weatherSharing ?? false,
        locationSharing: receiver?.locationSharing || "none",
      };
    })
  );

  return requests;
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

  /*
    user1 = current user
    user2 = friend
  */

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
    doc(
      db,
      "users",
      user1,
      "friends",
      user2
    ),
    {
      userId: user2,
      createdAt: serverTimestamp(),
    }
  );

  // Add user1 to user2's friends
  await setDoc(
    doc(
      db,
      "users",
      user2,
      "friends",
      user1
    ),
    {
      userId: user1,
      createdAt: serverTimestamp(),
    }
  );

  // Fetch the friend's COMPLETE profile
  const friend = await getUser(user2);

  console.log(
    "FRIEND ACCEPTED:",
    friend
  );

  return {
    success: true,
    friend,
  };
}

/* =========================================================
   REJECT FRIEND REQUEST
========================================================= */

export async function rejectFriendRequest(requestId) {
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

export async function cancelFriendRequest(requestId) {
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

  try {
    const friendsRef = collection(
      db,
      "users",
      userId,
      "friends"
    );

    const snapshot = await getDocs(friendsRef);

    console.log(
      "Friend documents found:",
      snapshot.docs.length
    );

    if (snapshot.empty) {
      console.log(
        "No accepted friends found for:",
        userId
      );

      return [];
    }

    const friends = await Promise.all(
      snapshot.docs.map(async (friendDoc) => {
        /*
          IMPORTANT:

          friendDoc.id is the friend's Firebase UID.

          Example:

          users
            currentUser
              friends
                UyTPmhTX7fX9w4V2oEg0zeoAhrB3

          Therefore:
          friendDoc.id =
          UyTPmhTX7fX9w4V2oEg0zeoAhrB3
        */

        const friendId = friendDoc.id;

        console.log(
          "Loading friend:",
          friendId
        );

        // Fetch actual user document
        const friend = await getUser(friendId);

        if (!friend) {
          console.warn(
            "Friend user document missing:",
            friendId
          );

          return null;
        }

        /*
          Return COMPLETE friend profile.

          This includes:

          name
          username
          photoURL
          location
          weather
          weatherSharing
          locationSharing
        */

        return {
          id: friend.id,
          friendId,

          name: friend.name || "User",
          username: friend.username || "",
          email: friend.email || "",
          photoURL: friend.photoURL || "",

          location: friend.location || null,
          locationText: friend.locationText || "",

          latitude: friend.latitude ?? null,
          longitude: friend.longitude ?? null,

          weather: friend.weather || null,
          weatherSharing:
            friend.weatherSharing ?? false,

          locationSharing:
            friend.locationSharing || "none",

          weatherUpdatedAt:
            friend.weatherUpdatedAt || null,

          friendshipId: friendDoc.id,
          friendshipCreatedAt:
            friendDoc.data()?.createdAt || null,
        };
      })
    );

    const validFriends = friends.filter(Boolean);

    console.log(
      "COMPLETE FIREBASE FRIENDS:",
      validFriends
    );

    return validFriends;
  } catch (error) {
    console.error(
      "getFriends error:",
      error
    );

    return [];
  }
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
    throw new Error(
      "Block ID is required"
    );
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
    throw new Error(
      "User ID is required"
    );
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await updateDoc(
    userRef,
    settings
  );

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
    throw new Error(
      "User ID is required"
    );
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await updateDoc(
    userRef,
    {
      locationSharing: mode,
    }
  );

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
    throw new Error(
      "User ID is required"
    );
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await updateDoc(
    userRef,
    {
      latitude,
      longitude,

      location: {
        lat: latitude,
        lng: longitude,
      },
    }
  );

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
    throw new Error(
      "User ID is required"
    );
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await updateDoc(
    userRef,
    {
      weather: {
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
    }
  );

  return true;
}