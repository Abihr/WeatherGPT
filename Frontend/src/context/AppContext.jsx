
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  blockedUsers as initialBlocked,
  weatherAlerts,
} from "../data/mockData";

import * as fs from "../firebase/firestore";
import { getCurrentWeather } from "../services/weatherService";
import { getCurrentPosition } from "../services/locationService";

const AppContext = createContext(null);

let toastId = 0;

export function AppProvider({ children, firebaseUser }) {
  const [user, setUser] = useState(null);

  const [friendsList, setFriendsList] = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);

  const [blocked, setBlocked] = useState(initialBlocked);

  const [toasts, setToasts] = useState([]);

  const [locating, setLocating] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  /* =====================================================
     FIREBASE AUTH USER
     ===================================================== */

  useEffect(() => {
    if (!firebaseUser) {
      setUser(null);
      setFriendsList([]);
      setReceived([]);
      setSent([]);
      return;
    }

    const loadUser = async () => {
      try {
        // Get actual user document from Firestore
        const firebaseData = await fs.getUser(
          firebaseUser.uid
        );

        setUser({
          ...(firebaseData || {}),

          // Always use Firebase Auth UID
          id: firebaseUser.uid,

          // Prefer Firebase Auth name
          name:
            firebaseUser.displayName ||
            firebaseData?.name ||
            "User",

          // Prefer Firebase Auth email
          email:
            firebaseUser.email ||
            firebaseData?.email ||
            "",

          // Prefer Firebase Auth photo
          photoURL:
            firebaseUser.photoURL ||
            firebaseData?.photoURL ||
            "",
        });
      } catch (error) {
        console.error(
          "Failed to load Firebase user:",
          error
        );

        // Fallback if Firestore user document doesn't exist
        setUser({
          id: firebaseUser.uid,
          name:
            firebaseUser.displayName ||
            "User",
          email:
            firebaseUser.email ||
            "",
          photoURL:
            firebaseUser.photoURL ||
            "",
        });
      }
    };

    loadUser();
  }, [firebaseUser]);

  /* =====================================================
     TOASTS
     ===================================================== */

  const pushToast = useCallback(
    (message, tone = "success") => {
      const id = ++toastId;

      setToasts((current) => [
        ...current,
        {
          id,
          message,
          tone,
        },
      ]);

      setTimeout(() => {
        setToasts((current) =>
          current.filter(
            (toast) => toast.id !== id
          )
        );
      }, 3200);
    },
    []
  );

  const dismissToast = useCallback((id) => {
    setToasts((current) =>
      current.filter(
        (toast) => toast.id !== id
      )
    );
  }, []);

  /* =====================================================
     LOCATION + WEATHER
     ===================================================== */

  const detectLocation = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLocating(true);

    try {
      /*
       * 1. Get real GPS location
       */

      const {
        latitude,
        longitude,
      } = await getCurrentPosition();

      console.log(
        "📍 EXACT LATITUDE:",
        latitude
      );

      console.log(
        "📍 EXACT LONGITUDE:",
        longitude
      );

      console.log(
        "📍 EXACT COORDINATES:",
        {
          latitude,
          longitude,
        }
      );

      /*
       * 2. Save location to Firestore
       */

      await fs.updateUserLocation(
        user.id,
        latitude,
        longitude
      );

      /*
       * 3. Get weather from weather API/backend
       */

      const weather =
        await getCurrentWeather(
          latitude,
          longitude
        );

      console.log(
        "🌤️ CURRENT WEATHER:",
        weather
      );

      console.log(
        "🌡️ Temperature:",
        weather?.temperature ??
          weather?.temp
      );

      console.log(
        "☁️ Condition:",
        weather?.condition
      );

      console.log(
        "💧 Humidity:",
        weather?.humidity
      );

      console.log(
        "💨 Wind:",
        weather?.wind
      );

      console.log(
        "🌧️ Rain:",
        weather?.rain
      );

      /*
       * 4. Save weather to THIS user's Firestore document
       *
       * users/{user.uid}/weather
       */

      await fs.updateUserWeather(
        user.id,
        weather
      );

      /*
       * 5. Build location text
       */

      const locationText =
        weather?.locationName
          ? `${weather.locationName}${
              weather.country
                ? `, ${weather.country}`
                : ""
            }`
          : "";

      /*
       * 6. Update local user
       */

      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        return {
          ...currentUser,

          id: user.id,

          latitude,
          longitude,

          location: {
            city:
              weather?.locationName ||
              currentUser?.location?.city ||
              "",
            lat: latitude,
            lng: longitude,
          },

          weather: {
            ...weather,

            temperature:
              weather?.temperature ??
              weather?.temp ??
              null,
          },

          locationText,
        };
      });

      /*
       * 7. Refresh friends
       *
       * This is useful when another user's
       * weather has recently changed.
       */

      try {
        const friends =
          await fs.getFriends(user.id);

        setFriendsList(friends);

        console.log(
          "👥 UPDATED FIREBASE FRIENDS:",
          friends
        );
      } catch (friendError) {
        console.error(
          "Failed to refresh friends:",
          friendError
        );
      }

      pushToast("Location & weather updated");
    } catch (error) {
      console.error(
        "Location/weather error:",
        error
      );

      pushToast(
        error?.message ||
          "Couldn't access your location",
        "error"
      );
    } finally {
      setLocating(false);
    }
  }, [user?.id, pushToast]);

  /* =====================================================
     AUTOMATIC LOCATION DETECTION
     ===================================================== */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    detectLocation();
  }, [user?.id, detectLocation]);

  /* =====================================================
     LOAD FIREBASE DATA
     ===================================================== */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const loadFirebaseData = async () => {
      try {
        const [
          friends,
          receivedRequests,
          sentRequests,
        ] = await Promise.all([
          fs.getFriends(user.id),

          fs.getReceivedRequests(
            user.id
          ),

          fs.getSentRequests(
            user.id
          ),
        ]);

        /*
         * Remove duplicate friends
         */

        const uniqueFriends =
          Array.from(
            new Map(
              friends.map((friend) => [
                friend.id,
                friend,
              ])
            ).values()
          );

        setFriendsList(
          uniqueFriends
        );

        setReceived(
          receivedRequests
        );

        setSent(
          sentRequests
        );

        console.log(
          "👥 FIREBASE FRIENDS:",
          uniqueFriends
        );

        console.log(
          "📥 RECEIVED REQUESTS:",
          receivedRequests
        );

        console.log(
          "📤 SENT REQUESTS:",
          sentRequests
        );
      } catch (error) {
        console.error(
          "Failed to load Firebase data:",
          error
        );
      }
    };

    loadFirebaseData();
  }, [user?.id]);

  /* =====================================================
     SEND FRIEND REQUEST
     ===================================================== */

  const sendRequest = useCallback(
    async (person) => {
      if (
        !user?.id ||
        !person?.id
      ) {
        return;
      }

      try {
        const result =
          await fs.sendFriendRequest(
            user.id,
            person.id
          );

        const newRequest = {
          requestId:
            result.requestId,

          senderId:
            user.id,

          receiverId:
            person.id,

          name:
            person.name,

          username:
            person.username,

          location:
            person.location,

          photoURL:
            person.photoURL,

          status:
            "pending",
        };

        setSent((current) => [
          ...current,
          newRequest,
        ]);

        pushToast(
          "Friend request sent"
        );
      } catch (error) {
        console.error(
          "Send friend request error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to send request",
          "error"
        );
      }
    },
    [user?.id, pushToast]
  );

  /* =====================================================
     CANCEL FRIEND REQUEST
     ===================================================== */

  const cancelRequest = useCallback(
    async (requestId) => {
      if (!requestId) {
        return;
      }

      try {
        await fs.cancelFriendRequest(
          requestId
        );

        setSent((current) =>
          current.filter(
            (request) =>
              request.requestId !==
              requestId
          )
        );

        pushToast(
          "Request cancelled"
        );
      } catch (error) {
        console.error(
          "Cancel request error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to cancel request",
          "error"
        );
      }
    },
    [pushToast]
  );

  /* =====================================================
     ACCEPT FRIEND REQUEST
     ===================================================== */

  const acceptRequest = useCallback(
    async (request) => {
      if (
        !user?.id ||
        !request?.senderId ||
        !request?.requestId
      ) {
        return;
      }

      try {
        /*
         * Create friendship in Firebase
         */

        await fs.acceptFriendRequest(
          request.requestId,
          user.id,
          request.senderId
        );

        /*
         * Get complete friend document
         *
         * This includes:
         * name
         * username
         * location
         * weather
         */

        const friend =
          await fs.getUser(
            request.senderId
          );

        if (friend) {
          setFriendsList((current) => {
            const alreadyExists =
              current.some(
                (existingFriend) =>
                  existingFriend.id ===
                  friend.id
              );

            if (alreadyExists) {
              return current;
            }

            return [
              ...current,
              friend,
            ];
          });

          console.log(
            "👤 NEW FRIEND:",
            friend
          );

          console.log(
            "🌤️ FRIEND WEATHER:",
            friend.weather
          );
        }

        /*
         * Remove accepted request
         */

        setReceived((current) =>
          current.filter(
            (receivedRequest) =>
              receivedRequest.requestId !==
              request.requestId
          )
        );

        pushToast(
          "Friend request accepted"
        );
      } catch (error) {
        console.error(
          "Accept friend request error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to accept request",
          "error"
        );
      }
    },
    [user?.id, pushToast]
  );

  /* =====================================================
     REJECT FRIEND REQUEST
     ===================================================== */

  const rejectRequest = useCallback(
    async (requestId) => {
      if (!requestId) {
        return;
      }

      try {
        await fs.rejectFriendRequest(
          requestId
        );

        setReceived((current) =>
          current.filter(
            (request) =>
              request.requestId !==
              requestId
          )
        );

        pushToast(
          "Request rejected"
        );
      } catch (error) {
        console.error(
          "Reject request error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to reject request",
          "error"
        );
      }
    },
    [pushToast]
  );

  /* =====================================================
     REMOVE FRIEND
     ===================================================== */

  const removeFriend = useCallback(
    async (friendId) => {
      if (
        !user?.id ||
        !friendId
      ) {
        return;
      }

      try {
        await fs.removeFriend(
          user.id,
          friendId
        );

        setFriendsList((current) =>
          current.filter(
            (friend) =>
              friend.id !== friendId
          )
        );

        pushToast(
          "Friend removed"
        );
      } catch (error) {
        console.error(
          "Remove friend error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to remove friend",
          "error"
        );
      }
    },
    [user?.id, pushToast]
  );

  /* =====================================================
     BLOCK USER
     ===================================================== */

  const blockUserById = useCallback(
    async (person) => {
      if (
        !user?.id ||
        !person?.id
      ) {
        return;
      }

      try {
        const result =
          await fs.blockUser(
            user.id,
            person.id
          );

        setFriendsList((current) =>
          current.filter(
            (friend) =>
              friend.id !==
              person.id
          )
        );

        setReceived((current) =>
          current.filter(
            (request) =>
              request.senderId !==
              person.id
          )
        );

        setSent((current) =>
          current.filter(
            (request) =>
              request.receiverId !==
              person.id
          )
        );

        setBlocked((current) => [
          ...current,
          {
            id: person.id,
            name: person.name,
            username:
              person.username,
            location:
              person.location,
            photoURL:
              person.photoURL,
            blockId:
              result?.blockId,
          },
        ]);

        pushToast(
          "User blocked"
        );
      } catch (error) {
        console.error(
          "Block user error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to block user",
          "error"
        );
      }
    },
    [user?.id, pushToast]
  );

  /* =====================================================
     UNBLOCK USER
     ===================================================== */

  const unblockUserById =
    useCallback(
      async (person) => {
        if (!person) {
          return;
        }

        /*
         * If person is a block document ID,
         * use blockId.
         *
         * Otherwise use the supplied ID.
         */

        const blockId =
          person?.blockId ||
          person?.id;

        try {
          await fs.unblockUser(
            blockId
          );

          setBlocked((current) =>
            current.filter(
              (blockedUser) =>
                blockedUser.id !==
                person.id
            )
          );

          pushToast(
            "User unblocked"
          );
        } catch (error) {
          console.error(
            "Unblock user error:",
            error
          );

          pushToast(
            error?.message ||
              "Failed to unblock user",
            "error"
          );
        }
      },
      [pushToast]
    );

  /* =====================================================
     WEATHER SHARING
     ===================================================== */

  const updateWeatherSharing =
    useCallback(
      async (enabled) => {
        if (!user?.id) {
          return;
        }

        try {
          await fs.updateWeatherSharing(
            user.id,
            {
              weatherSharing:
                enabled,
            }
          );

          setUser((current) => ({
            ...current,
            weatherSharing:
              enabled,
          }));

          pushToast(
            "Weather sharing updated"
          );
        } catch (error) {
          console.error(
            "Weather sharing error:",
            error
          );

          pushToast(
            error?.message ||
              "Failed to update weather sharing",
            "error"
          );
        }
      },
      [user?.id, pushToast]
    );

  /* =====================================================
     LOCATION SHARING
     ===================================================== */

  const updateLocationSharing =
    useCallback(
      async (mode) => {
        if (!user?.id) {
          return;
        }

        try {
          await fs.updateLocationSharing(
            user.id,
            mode
          );

          setUser((current) => ({
            ...current,
            locationSharing:
              mode,
          }));

          pushToast(
            "Location sharing updated"
          );
        } catch (error) {
          console.error(
            "Location sharing error:",
            error
          );

          pushToast(
            error?.message ||
              "Failed to update location sharing",
            "error"
          );
        }
      },
      [user?.id, pushToast]
    );

  /* =====================================================
     SEARCH USERS
     ===================================================== */

  const searchUsers = useCallback(
    async (term) => {
      const text =
        term?.trim().toLowerCase();

      if (!text) {
        return [];
      }

      try {
        const users =
          await fs.searchUsers(
            text
          );

        const friendIds =
          new Set(
            friendsList.map(
              (friend) =>
                friend.id
            )
          );

        const blockedIds =
          new Set(
            blocked.map(
              (person) =>
                person.id
            )
          );

        const pendingIds =
          new Set(
            sent.map(
              (request) =>
                request.receiverId
            )
          );

        return users
          .filter(
            (person) =>
              person.id !==
                user?.id &&
              !blockedIds.has(
                person.id
              )
          )
          .map((person) => ({
            ...person,

            isFriend:
              friendIds.has(
                person.id
              ),

            isPending:
              pendingIds.has(
                person.id
              ),
          }));
      } catch (error) {
        console.error(
          "Search users error:",
          error
        );

        return [];
      }
    },
    [
      friendsList,
      blocked,
      sent,
      user?.id,
    ]
  );

  /* =====================================================
     DARK MODE
     ===================================================== */

  const toggleDarkMode =
    useCallback(() => {
      setDarkMode(
        (previous) =>
          !previous
      );
    }, []);

  /* =====================================================
     CONTEXT VALUE
     ===================================================== */

  const value = {
    user,

    friendsList,

    received,

    sent,

    blocked,

    toasts,

    locating,

    alerts: weatherAlerts,

    darkMode,

    toggleDarkMode,

    pushToast,

    dismissToast,

    detectLocation,

    sendRequest,

    cancelRequest,

    acceptRequest,

    rejectRequest,

    removeFriend,

    blockUserById,

    unblockUserById,

    updateWeatherSharing,

    updateLocationSharing,

    searchUsers,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/* =========================================================
   USE APP
   ========================================================= */

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used within AppProvider"
    );
  }

  return context;
}
