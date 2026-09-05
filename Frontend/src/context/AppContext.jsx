import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  currentUser as initialUser,
  friends as initialFriends,
  receivedRequests as initialReceived,
  sentRequests as initialSent,
  blockedUsers as initialBlocked,
  weatherAlerts,
  searchResultsPool,
} from "../data/mockData";

import * as fs from "../firebase/firestore";
import { getCurrentWeather } from "../services/weatherService";
import { getCurrentPosition } from "../services/locationService";

const AppContext = createContext(null);

let toastId = 0;

export function AppProvider({ children, firebaseUser }) {
  const [user, setUser] = useState(null);
  const [friendsList, setFriendsList] = useState(initialFriends);
  const [received, setReceived] = useState(initialReceived);
  const [sent, setSent] = useState(initialSent);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [toasts, setToasts] = useState([]);
  const [locating, setLocating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ----------------------------------------------------
  // FIREBASE AUTH USER
  // ----------------------------------------------------

  useEffect(() => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    setUser((previousUser) => ({
      ...initialUser,
      ...previousUser,

      id: firebaseUser.uid,

      name: firebaseUser.displayName || previousUser?.name || "User",

      email: firebaseUser.email || "",

      photoURL: firebaseUser.photoURL || previousUser?.photoURL || "",
    }));
  }, [firebaseUser]);

  // ----------------------------------------------------
  // TOASTS
  // ----------------------------------------------------

  const pushToast = useCallback((message, tone = "success") => {
    const id = ++toastId;

    setToasts((t) => [
      ...t,
      {
        id,
        message,
        tone,
      },
    ]);

    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  // ----------------------------------------------------
  // LOCATION + WEATHER
  // ----------------------------------------------------

  const detectLocation = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLocating(true);

    try {
      // Get real GPS coordinates
      const { latitude, longitude } = await getCurrentPosition();

      //EXACT POSITION
      console.log("📍 EXACT LATITUDE:", latitude);
      console.log("📍 EXACT LONGITUDE:", longitude);
      console.log("📍 EXACT COORDINATES:", {
        latitude,
        longitude,
      });

      // Save coordinates to Firebase
      await fs.updateUserLocation(user.id, latitude, longitude);

      // Get weather from backend
      const weather = await getCurrentWeather(latitude, longitude);

      // PRINT CURRENT WEATHER
      console.log("🌤️ CURRENT WEATHER:", weather);
      console.log("🌡️ Temperature:", weather.temp);
      console.log("☁️ Condition:", weather.condition);
      console.log("💧 Humidity:", weather.humidity);
      console.log("💨 Wind:", weather.wind);
      console.log("🌧️ Rain:", weather.rain);

      // Update local user
      setUser((u) => {
        if (!u) return u;

        return {
          ...u,

          latitude,
          longitude,

          location: weather.locationName
            ? `${weather.locationName}${
                weather.country ? `, ${weather.country}` : ""
              }`
            : u.location,

          weather,
        };
      });

      pushToast("Location updated");
    } catch (e) {
      console.error("Location/weather error:", e);

      pushToast("Couldn't access your location", "error");
    } finally {
      setLocating(false);
    }
  }, [user?.id, pushToast]);

  // Automatically detect location after login
  useEffect(() => {
    if (user?.id) {
      detectLocation();
    }
  }, [user?.id, detectLocation]);

  // ----------------------------------------------------
  // FRIEND REQUESTS
  // ----------------------------------------------------

  const sendRequest = useCallback(
    async (person) => {
      if (!user?.id) return;

      await fs.sendFriendRequest(user.id, person.id);

      setSent((s) => [
        ...s,
        {
          requestId: `local_${person.id}`,
          receiverId: person.id,
          name: person.name,
          username: person.username,
          location: person.location,
          photoURL: person.photoURL,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ]);

      pushToast("Friend request sent");
    },
    [user?.id, pushToast],
  );

  const cancelRequest = useCallback(
    async (requestId) => {
      await fs.cancelFriendRequest(requestId);

      setSent((s) => s.filter((r) => r.requestId !== requestId));

      pushToast("Request cancelled");
    },
    [pushToast],
  );

  const acceptRequest = useCallback(
    async (request) => {
      if (!user?.id) return;

      await fs.acceptFriendRequest(
        request.requestId,
        user.id,
        request.senderId,
      );

      setReceived((r) =>
        r.filter((req) => req.requestId !== request.requestId),
      );

      setFriendsList((f) => [
        ...f,
        {
          id: request.senderId,
          name: request.name,
          username: request.username,
          photoURL: request.photoURL,
          location: request.location,

          distanceKm: Math.round(5 + Math.random() * 200),

          weatherSharing: true,
          locationSharing: "approximate",

          weather: {
            icon: "partly-cloudy",
            temp: 26,
            condition: "Partly Cloudy",
            feelsLike: 27,
            humidity: 68,
            wind: 9,
            rain: 25,
          },
        },
      ]);

      pushToast("Friend request accepted");
    },
    [user?.id, pushToast],
  );

  const rejectRequest = useCallback(
    async (requestId) => {
      await fs.rejectFriendRequest(requestId);

      setReceived((r) => r.filter((req) => req.requestId !== requestId));

      pushToast("Request rejected");
    },
    [pushToast],
  );

  // ----------------------------------------------------
  // FRIENDS
  // ----------------------------------------------------

  const removeFriend = useCallback(
    async (friendId) => {
      await fs.removeFriend(friendId);

      setFriendsList((f) => f.filter((fr) => fr.id !== friendId));

      pushToast("Friend removed");
    },
    [pushToast],
  );

  // ----------------------------------------------------
  // BLOCK USER
  // ----------------------------------------------------

  const blockUserById = useCallback(
    async (person) => {
      if (!user?.id) return;

      await fs.blockUser(user.id, person.id);

      setFriendsList((f) => f.filter((fr) => fr.id !== person.id));

      setReceived((r) => r.filter((req) => req.senderId !== person.id));

      setSent((s) => s.filter((req) => req.receiverId !== person.id));

      setBlocked((b) => [
        ...b,
        {
          id: person.id,
          name: person.name,
          username: person.username,
          location: person.location,
          photoURL: person.photoURL,
        },
      ]);

      pushToast("User blocked");
    },
    [user?.id, pushToast],
  );

  const unblockUserById = useCallback(
    async (personId) => {
      await fs.unblockUser(personId);

      setBlocked((b) => b.filter((u) => u.id !== personId));

      pushToast("User unblocked");
    },
    [pushToast],
  );

  // ----------------------------------------------------
  // WEATHER SHARING
  // ----------------------------------------------------

  const updateWeatherSharing = useCallback(
    async (enabled) => {
      if (!user?.id) return;

      await fs.updateWeatherSharing(user.id, {
        weatherSharing: enabled,
      });

      setUser((u) => ({
        ...u,
        weatherSharing: enabled,
      }));

      pushToast("Weather sharing updated");
    },
    [user?.id, pushToast],
  );

  // ----------------------------------------------------
  // LOCATION SHARING
  // ----------------------------------------------------

  const updateLocationSharing = useCallback(
    async (mode) => {
      if (!user?.id) return;

      await fs.updateLocationSharing(user.id, mode);

      setUser((u) => ({
        ...u,
        locationSharing: mode,
      }));

      pushToast("Location sharing updated");
    },
    [user?.id, pushToast],
  );

  // ----------------------------------------------------
  // SEARCH USERS
  // ----------------------------------------------------

  const searchUsers = useCallback(
    (term) => {
      const t = term.trim().toLowerCase();

      if (!t) return [];

      const friendIds = new Set(friendsList.map((f) => f.id));

      const blockedIds = new Set(blocked.map((b) => b.id));

      const pendingIds = new Set(sent.map((s) => s.receiverId));

      return searchResultsPool
        .filter(
          (p) =>
            (p.name.toLowerCase().includes(t) ||
              p.username.toLowerCase().includes(t)) &&
            !blockedIds.has(p.id) &&
            p.id !== user?.id,
        )
        .map((p) => ({
          ...p,
          isFriend: friendIds.has(p.id),
          isPending: pendingIds.has(p.id),
        }));
    },
    [friendsList, blocked, sent, user?.id],
  );

  // ----------------------------------------------------
  // DARK MODE
  // ----------------------------------------------------

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // ----------------------------------------------------
  // CONTEXT VALUE
  // ----------------------------------------------------

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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }

  return ctx;
}
