// Firestore data-access layer.
//
// Each function documents the Firestore collections it would read/write,
// matching the structure in the project spec:
//
//   users/{userId}            -> name, username, email, photoURL, latitude,
//                                 longitude, locationSharing, weatherSharing
//   friendRequests/{requestId}-> senderId, receiverId, status, createdAt
//   friends/{friendshipId}    -> user1, user2, createdAt
//   blockedUsers/{blockId}    -> blockerId, blockedUserId, createdAt
//
// USE_FIREBASE is false by default (see firebase.js), so these are stubs
// that a real integration would replace with `getDocs`, `addDoc`,
// `updateDoc`, `deleteDoc`, `onSnapshot`, etc. from the `firebase/firestore`
// SDK. The UI in this project talks to `AppContext`, which uses these
// functions as the seam where real persistence would plug in.

import { db, USE_FIREBASE } from "./firebase";
// import {
//   collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
//   query, where, serverTimestamp,
// } from "firebase/firestore";

/** Search users by name/username. Firestore has no native full-text search;
 *  a real implementation would use a prefix query on `username` or an
 *  external index (Algolia/Typesense). */
export async function searchUsers(queryText) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] searchUsers:", queryText);
    return [];
  }
  // const q = query(collection(db, "users"), where("username", ">=", queryText));
  // const snap = await getDocs(q);
  // return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Create a friendRequests/{requestId} doc with status "pending". */
export async function sendFriendRequest(senderId, receiverId) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] sendFriendRequest:", senderId, "->", receiverId);
    return { requestId: `mock_${Date.now()}`, status: "pending" };
  }
  // return addDoc(collection(db, "friendRequests"), {
  //   senderId, receiverId, status: "pending", createdAt: serverTimestamp(),
  // });
}

/** Update a friendRequests doc to "accepted" and create a friends doc. */
export async function acceptFriendRequest(requestId, user1, user2) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] acceptFriendRequest:", requestId);
    return { friendshipId: `mock_${Date.now()}` };
  }
  // await updateDoc(doc(db, "friendRequests", requestId), { status: "accepted" });
  // return addDoc(collection(db, "friends"), { user1, user2, createdAt: serverTimestamp() });
}

/** Update a friendRequests doc to "rejected". */
export async function rejectFriendRequest(requestId) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] rejectFriendRequest:", requestId);
    return true;
  }
  // return updateDoc(doc(db, "friendRequests", requestId), { status: "rejected" });
}

/** Delete a pending friendRequests doc sent by the current user. */
export async function cancelFriendRequest(requestId) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] cancelFriendRequest:", requestId);
    return true;
  }
  // return deleteDoc(doc(db, "friendRequests", requestId));
}

/** Delete a friends/{friendshipId} doc. */
export async function removeFriend(friendshipId) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] removeFriend:", friendshipId);
    return true;
  }
  // return deleteDoc(doc(db, "friends", friendshipId));
}

/** Create a blockedUsers doc and remove any existing friendship/requests. */
export async function blockUser(blockerId, blockedUserId) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] blockUser:", blockerId, "blocks", blockedUserId);
    return { blockId: `mock_${Date.now()}` };
  }
  // return addDoc(collection(db, "blockedUsers"), {
  //   blockerId, blockedUserId, createdAt: serverTimestamp(),
  // });
}

/** Delete a blockedUsers doc. Per spec, this does NOT restore friendship. */
export async function unblockUser(blockId) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] unblockUser:", blockId);
    return true;
  }
  // return deleteDoc(doc(db, "blockedUsers", blockId));
}

/** Update users/{userId} weatherSharing + which fields are shared. */
export async function updateWeatherSharing(userId, settings) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] updateWeatherSharing:", userId, settings);
    return true;
  }
  // return updateDoc(doc(db, "users", userId), settings);
}

/** Update users/{userId} locationSharing ("off" | "approximate" | "exact"). */
export async function updateLocationSharing(userId, mode) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] updateLocationSharing:", userId, mode);
    return true;
  }
  // return updateDoc(doc(db, "users", userId), { locationSharing: mode });
}

/** Update users/{userId} latitude/longitude. */
export async function updateUserLocation(userId, latitude, longitude) {
  if (!USE_FIREBASE) {
    console.info("[firestore stub] updateUserLocation:", userId, latitude, longitude);
    return true;
  }
  // return updateDoc(doc(db, "users", userId), { latitude, longitude });
}
