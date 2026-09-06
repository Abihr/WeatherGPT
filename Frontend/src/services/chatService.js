const API_URL = "http://localhost:5000";

export async function sendChatMessage(
    message,
    currentLocation
) {
    const response = await fetch(
        `${API_URL}/api/chat`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                message,
                currentLocation,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to send message"
        );
    }

    return response.json();
}