
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

/* =========================================================
   REVERSE GEOCODING

   Converts:

   latitude + longitude

   into:

   Kolkata
   Kalyani
   Rāmchandrapur
   etc.
========================================================= */

async function getPlaceName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Reverse geocoding failed"
      );
    }

    const data = await response.json();

    const address = data?.address || {};

    /*
      Prefer city/town/village/municipality.

      Example result:

      city: Kolkata

      OR

      town: Kalyani

      OR

      village: Rāmchandrapur
    */

    const placeName =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.suburb ||
      address.county ||
      "";

    const country =
      address.country_code
        ?.toUpperCase() || "";

    console.log(
      "📍 REVERSE GEOCODE RESULT:",
      {
        placeName,
        country,
        address,
      }
    );

    return {
      placeName,
      country,
    };
  } catch (error) {
    console.error(
      "Reverse geocoding error:",
      error
    );

    return {
      placeName: "",
      country: "",
    };
  }
}

export function AppProvider({
  children,
  firebaseUser,
}) {
  const [user, setUser] = useState(null);

  const [friendsList, setFriendsList] =
    useState([]);

  const [received, setReceived] =
    useState([]);

  const [sent, setSent] =
    useState([]);

  const [blocked, setBlocked] =
    useState(initialBlocked);

  const [toasts, setToasts] =
    useState([]);

  const [locating, setLocating] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(false);

  /* =======================================================
     FIREBASE AUTH USER
  ======================================================= */

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
        const firebaseData =
          await fs.getUser(
            firebaseUser.uid
          );

        setUser({
          ...(firebaseData || {}),

          id: firebaseUser.uid,

          name:
            firebaseUser.displayName ||
            firebaseData?.name ||
            "User",

          email:
            firebaseUser.email ||
            firebaseData?.email ||
            "",

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

        setUser({
          id: firebaseUser.uid,

          name:
            firebaseUser.displayName ||
            "User",

          email:
            firebaseUser.email || "",

          photoURL:
            firebaseUser.photoURL || "",
        });
      }
    };

    loadUser();
  }, [firebaseUser]);

  /* =======================================================
     TOASTS
  ======================================================= */

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

  const dismissToast = useCallback(
    (id) => {
      setToasts((current) =>
        current.filter(
          (toast) => toast.id !== id
        )
      );
    },
    []
  );

  /* =======================================================
     LOAD FRIENDS
  ======================================================= */

  const refreshFriends = useCallback(
    async () => {
      if (!user?.id) {
        return [];
      }

      try {
        console.log(
          "🔄 Refreshing friends..."
        );

        const friends =
          await fs.getFriends(user.id);

        const uniqueFriends =
          Array.from(
            new Map(
              friends.map((friend) => [
                friend.id,
                friend,
              ])
            ).values()
          );

        setFriendsList(uniqueFriends);

        console.log(
          "✅ FRIENDS REFRESHED:",
          uniqueFriends
        );

        return uniqueFriends;
      } catch (error) {
        console.error(
          "❌ Failed to refresh friends:",
          error
        );

        pushToast(
          "Failed to refresh friends",
          "error"
        );

        return [];
      }
    },
    [user?.id, pushToast]
  );

  /* =======================================================
     LOCATION + WEATHER
  ======================================================= */

  const detectLocation = useCallback(
    async () => {
      if (!user?.id) {
        return;
      }

      setLocating(true);

      try {
        /* ---------------------------------------------------
           1. GET GPS
        --------------------------------------------------- */

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

        /* ---------------------------------------------------
           2. GET PLACE NAME
        --------------------------------------------------- */

        const place =
          await getPlaceName(
            latitude,
            longitude
          );

        console.log(
          "📍 PLACE NAME:",
          place.placeName
        );

        console.log(
          "🌍 COUNTRY:",
          place.country
        );

        /* ---------------------------------------------------
           3. GET WEATHER
        --------------------------------------------------- */

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

        /* ---------------------------------------------------
           4. DETERMINE FINAL LOCATION NAME

           Priority:

           1. Weather API locationName
           2. Reverse geocoding placeName
           3. Existing user location name
        --------------------------------------------------- */

        const finalLocationName =
          weather?.locationName ||
          place.placeName ||
          user?.location?.city ||
          "";

        const finalCountry =
          weather?.country ||
          place.country ||
          "";

        console.log(
          "📍 FINAL LOCATION NAME:",
          finalLocationName
        );

        /* ---------------------------------------------------
           5. SAVE LOCATION TO FIREBASE
        --------------------------------------------------- */

        await fs.updateUserLocation(
          user.id,
          latitude,
          longitude,
          finalLocationName,
          finalCountry
        );

        /* ---------------------------------------------------
           6. SAVE WEATHER TO FIREBASE

           Make sure weather contains locationName.
        --------------------------------------------------- */

        const weatherToSave = {
          ...weather,

          temperature:
            weather?.temperature ??
            weather?.temp ??
            null,

          locationName:
            finalLocationName,

          country:
            finalCountry,
        };

        await fs.updateUserWeather(
          user.id,
          weatherToSave
        );

        /* ---------------------------------------------------
           7. LOCATION TEXT

           Example:

           Kolkata, IN

           Rāmchandrapur, IN
        --------------------------------------------------- */

        const locationText =
          finalLocationName
            ? `${finalLocationName}${
                finalCountry
                  ? `, ${finalCountry}`
                  : ""
              }`
            : "";

        /* ---------------------------------------------------
           8. UPDATE LOCAL USER
        --------------------------------------------------- */

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
              city: finalLocationName,

              name: finalLocationName,

              lat: latitude,
              lng: longitude,
            },

            locationText,

            weather: weatherToSave,

            weatherSharing:
              currentUser.weatherSharing ??
              false,

            locationSharing:
              currentUser.locationSharing ??
              "off",
          };
        });

        /* ---------------------------------------------------
           9. REFRESH FRIENDS

           This makes sure friend's latest Firebase
           weatherSharing/location/weather is loaded.
        --------------------------------------------------- */

        await refreshFriends();

        pushToast(
          finalLocationName
            ? `Location updated: ${finalLocationName}`
            : "Location & weather updated"
        );
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
    },
    [
      user?.id,
      user?.location?.city,
      pushToast,
      refreshFriends,
    ]
  );

  /* =======================================================
     AUTOMATIC LOCATION DETECTION
  ======================================================= */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    detectLocation();
  }, [user?.id]);

  /* =======================================================
     LOAD FIREBASE DATA
  ======================================================= */

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

        const uniqueFriends =
          Array.from(
            new Map(
              friends.map((friend) => [
                friend.id,
                friend,
              ])
            ).values()
          );

        setFriendsList(uniqueFriends);

        setReceived(
          receivedRequests
        );

        setSent(sentRequests);

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

  /* =======================================================
     SEND FRIEND REQUEST
  ======================================================= */

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

          senderId: user.id,

          receiverId: person.id,

          name:
            person.name || "User",

          username:
            person.username || "",

          location:
            person.location || null,

          photoURL:
            person.photoURL || "",

          status: "pending",
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

  /* =======================================================
     CANCEL FRIEND REQUEST
  ======================================================= */

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

  /* =======================================================
     ACCEPT FRIEND REQUEST
  ======================================================= */

  const acceptRequest = useCallback(
    async (request) => {
      if (
        !user?.id ||
        !request?.senderId ||
        !request?.requestId
      ) {
        console.error(
          "Invalid request:",
          request
        );

        return;
      }

      try {
        console.log(
          "🤝 ACCEPTING FRIEND:",
          request
        );

        const result =
          await fs.acceptFriendRequest(
            request.requestId,
            user.id,
            request.senderId
          );

        console.log(
          "✅ FRIENDSHIP CREATED:",
          result
        );

        let friend =
          result?.friend;

        if (!friend) {
          friend =
            await fs.getUser(
              request.senderId
            );
        }

        if (!friend) {
          throw new Error(
            "Friend user profile could not be found"
          );
        }

        const completeFriend = {
          id: friend.id,

          friendId: friend.id,

          name:
            friend.name ||
            request.name ||
            "User",

          username:
            friend.username ||
            request.username ||
            "",

          email:
            friend.email || "",

          photoURL:
            friend.photoURL ||
            request.photoURL ||
            "",

          location:
            friend.location ||
            request.location ||
            null,

          locationText:
            friend.locationText || "",

          latitude:
            friend.latitude ??
            friend.location?.lat ??
            null,

          longitude:
            friend.longitude ??
            friend.location?.lng ??
            null,

          weather:
            friend.weather || null,

          weatherSharing:
            friend.weatherSharing ??
            false,

          locationSharing:
            friend.locationSharing ||
            "none",

          weatherUpdatedAt:
            friend.weatherUpdatedAt ||
            null,
        };

        console.log(
          "👤 NEW FRIEND:",
          completeFriend
        );

        setFriendsList(
          (current) => {
            const exists =
              current.some(
                (existingFriend) =>
                  existingFriend.id ===
                  completeFriend.id
              );

            if (exists) {
              return current.map(
                (existingFriend) =>
                  existingFriend.id ===
                  completeFriend.id
                    ? completeFriend
                    : existingFriend
              );
            }

            return [
              ...current,
              completeFriend,
            ];
          }
        );

        setReceived(
          (current) =>
            current.filter(
              (receivedRequest) =>
                receivedRequest.requestId !==
                request.requestId
            )
        );

        await refreshFriends();

        pushToast(
          `${completeFriend.name} is now your friend`
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
    [
      user?.id,
      pushToast,
      refreshFriends,
    ]
  );

  /* =======================================================
     REJECT FRIEND REQUEST
  ======================================================= */

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

  /* =======================================================
     REMOVE FRIEND
  ======================================================= */

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

  /* =======================================================
     BLOCK USER
  ======================================================= */

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

        setFriendsList(
          (current) =>
            current.filter(
              (friend) =>
                friend.id !== person.id
            )
        );

        setReceived(
          (current) =>
            current.filter(
              (request) =>
                request.senderId !==
                person.id
            )
        );

        setSent(
          (current) =>
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

  /* =======================================================
     UNBLOCK USER
  ======================================================= */

  const unblockUserById =
    useCallback(
      async (person) => {
        if (!person) {
          return;
        }

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

  /* =======================================================
     WEATHER SHARING
  ======================================================= */

  const updateWeatherSharing =
    useCallback(
      async (enabled) => {
        if (!user?.id) {
          return;
        }

        const sharingEnabled =
          Boolean(enabled);

        try {
          await fs.updateWeatherSharing(
            user.id,
            sharingEnabled
          );

          setUser((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              weatherSharing:
                sharingEnabled,
            };
          });

          /*
            Refresh friend list.

            This is useful when the same user/session
            needs the latest Firebase state.
          */

          pushToast(
            sharingEnabled
              ? "Weather sharing turned ON"
              : "Weather sharing turned OFF"
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

  /* =======================================================
     LOCATION SHARING
  ======================================================= */

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
            locationSharing: mode,
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

  /* =======================================================
     SEARCH USERS
  ======================================================= */

  const searchUsers = useCallback(
    async (term) => {
      const text =
        term?.trim().toLowerCase();

      if (!text) {
        return [];
      }

      try {
        const users =
          await fs.searchUsers(text);

        const friendIds =
          new Set(
            friendsList.map(
              (friend) => friend.id
            )
          );

        const blockedIds =
          new Set(
            blocked.map(
              (person) => person.id
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
              person.id !== user?.id &&
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

  /* =======================================================
     DARK MODE
  ======================================================= */

  const toggleDarkMode =
    useCallback(() => {
      setDarkMode(
        (previous) => !previous
      );
    }, []);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

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

    refreshFriends,

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

