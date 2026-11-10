
import { useState } from "react";
import { chatWithAssistant } from "../../services/assistantservices";

function TravelAssistant({
  tripId,
  onApplyChanges,
  applying,
  applyMessage,
}) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [proposedItinerary, setProposedItinerary] = useState(null);

  // Send message to AI assistant
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading || applying) return;

    const userMessage = message.trim();

    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);
    setError("");
    setProposedItinerary(null);

    try {
      const response = await chatWithAssistant(
        tripId,
        userMessage
      );

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
          canApply: response.canApply,
        },
      ]);

      if (response.canApply) {
        setProposedItinerary(response.proposedItinerary);
      }
    } catch (error) {
      console.error("Assistant error:", error);

      setError(
        error.response?.data?.message ||
        "Unable to get a response from the AI assistant."
      );
    } finally {
      setLoading(false);
    }
  };

  // Apply proposed itinerary
  const handleApplyProposal = async () => {
    if (!proposedItinerary || applying) return;

    const applied = await onApplyChanges(proposedItinerary);

    if (applied) {
      setProposedItinerary(null);
    }
  };

  // Discard proposed itinerary
  const handleDiscardProposal = () => {
    setProposedItinerary(null);
  };

  return (
    <section className="travel-assistant">

      <h2>TravelMate AI Assistant</h2>

      <p>
        Tell me how you want to modify or improve your
        travel itinerary.
      </p>

      {/* Chat history */}
      <div className="assistant-chat-history">

        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`chat-message ${chat.role}`}
          >
            <strong>
              {chat.role === "user"
                ? "You"
                : "TravelMate AI"}
            </strong>

            <p>{chat.content}</p>
          </div>
        ))}

        {loading && (
          <p>TravelMate AI is thinking...</p>
        )}

      </div>

      {/* Error message */}
      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* Message input */}
      <form onSubmit={handleSendMessage}>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Example: Make Day 2 less hectic..."
          rows={3}
          disabled={loading || applying}
        />

        <button
          type="submit"
          disabled={
            loading ||
            applying ||
            !message.trim()
          }
        >
          {loading ? "Sending..." : "Send Message"}
        </button>

      </form>

      {/* AI proposal */}
      {proposedItinerary && (
        <div className="assistant-proposal">

          <h3>Itinerary Proposal Ready</h3>

          <p>
            AI has prepared a modified itinerary.
            Review it before applying changes.
          </p>

          <button
            type="button"
            onClick={handleApplyProposal}
            disabled={applying}
          >
            {applying
              ? "Applying Changes..."
              : "Apply Changes"}
          </button>

          <button
            type="button"
            onClick={handleDiscardProposal}
            disabled={applying}
          >
            Discard Proposal
          </button>

        </div>
      )}

      {/* Apply result message */}
      {applyMessage && (
        <p className="assistant-apply-message">
          {applyMessage}
        </p>
      )}

    </section>
  );
}

export default TravelAssistant;

