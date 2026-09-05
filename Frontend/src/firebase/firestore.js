import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";
import { setDoc } from "firebase/firestore";

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
  const text = queryText.trim().toLowerCase();

  if (!text) return [];

  const usersRef = collection(db, "users");

  const snapshot = await getDocs(usersRef);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((user) => {
      const name = user.name?.toLowerCase() || "";
      const username = user.username?.toLowerCase() || "";

      return (
        name.includes(text) ||
        username.includes(text)
      );
    });
}

/* =========================================================
   FRIEND REQUESTS
   ========================================================= */

/*
  Create:

  friendRequests/{requestId}

  {
    senderId,
    receiverId,
    status: "pending",
    createdAt
  }
*/

export async function sendFriendRequest(
  senderId,
  receiverId
) {
  if (!senderId || !receiverId) {
    throw new Error("Sender and receiver are required");
  }

  if (senderId === receiverId) {
    throw new Error("You cannot send a friend request to yourself");
  }

  /* Check existing pending request */
  const requestsRef = collection(
    db,
    "friendRequests"
  );

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

  /* Create request */
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

  /* Update request */
  const requestRef = doc(
    db,
    "friendRequests",
    requestId
  );

  await updateDoc(requestRef, {
    status: "accepted",
  });

  /* Create friendship */
  const friendsRef = collection(db, "friends");

  const friendshipRef = await addDoc(
    friendsRef,
    {
      user1,
      user2,
      createdAt: serverTimestamp(),
    }
  );

  return {
    friendshipId: friendshipRef.id,
  };
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
   GET FRIENDSHIPS
   ========================================================= */

export async function getFriends(userId) {
  const friendsRef = collection(db, "friends");

  const q1 = query(
    friendsRef,
    where("user1", "==", userId)
  );

  const q2 = query(
    friendsRef,
    where("user2", "==", userId)
  );

  const [snapshot1, snapshot2] =
    await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

  const friendships = [
    ...snapshot1.docs,
    ...snapshot2.docs,
  ];

  return friendships.map((friendship) => {
    const data = friendship.data();

    return {
      friendshipId: friendship.id,
      ...data,
      friendId:
        data.user1 === userId
          ? data.user2
          : data.user1,
    };
  });
}

/* =========================================================
   REMOVE FRIEND
   ========================================================= */

export async function removeFriend(
  friendshipId
) {
  if (!friendshipId) {
    throw new Error("Friendship ID is required");
  }

  const friendshipRef = doc(
    db,
    "friends",
    friendshipId
  );

  await deleteDoc(friendshipRef);

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

export async function unblockUser(
  blockId
) {
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

  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, settings);

  return true;
}

/* =========================================================
   LOCATION SHARING
   ========================================================= */

export async function updateUserLocation(
  userId,
  latitude,
  longitude
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const userRef = doc(db, "users", userId);

  await setDoc(
    userRef,
    {
      latitude,
      longitude,
    },
    { merge: true }
  );

  return true;
}

/* =========================================================
   USER LOCATION
   ========================================================= */

