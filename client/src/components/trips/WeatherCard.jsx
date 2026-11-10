import React, { useEffect, useState } from "react";
import { getDestinationWeather } from "../../services/weatherservices";

// Convert weather codes into readable descriptions
const getWeatherDescription = (code) => {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rainy";
  if ([71, 73, 75, 77].includes(code)) return "Snowy";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";

  return "Unknown conditions";
};

// Generate travel suggestions based on weather
const getTravelSuggestions = (forecast) => {
  const suggestions = [];

  const minTemperature = Math.min(
    ...forecast.temperature_2m_min
  );

  const maxTemperature = Math.max(
    ...forecast.temperature_2m_max
  );

  const maxRainProbability = Math.max(
    ...forecast.precipitation_probability_max
  );

  const hasSnow = forecast.weather_code.some((code) =>
    [71, 73, 75, 77, 85, 86].includes(code)
  );

  if (minTemperature < 10) {
    suggestions.push("Carry warm clothes for cold weather.");
  }

  if (maxTemperature > 30) {
    suggestions.push("Carry sunscreen and stay hydrated.");
  }

  if (maxRainProbability > 60) {
    suggestions.push("Carry an umbrella or raincoat.");
  }

  if (hasSnow) {
    suggestions.push(
      "Carry winter clothing and suitable footwear."
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Weather looks relatively comfortable. Check the daily forecast before travelling."
    );
  }

  return suggestions;
};

const WeatherCard = ({ latitude, longitude, destination }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDestinationWeather(
          latitude,
          longitude
        );

        setWeather(response.weather);
      } catch (err) {
        console.error("Weather Fetch Error:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load weather information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (loading) {
    return <p>Loading weather information...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!weather) return null;

  const current = weather.current;
  const suggestions = getTravelSuggestions(weather.forecast);

  return (
    <div className="weather-card">
      <h2>Weather in {destination}</h2>

      {/* Current Weather */}
      <div className="weather-current">
        <h3>
          {Math.round(current.temperature_2m)}°C
        </h3>

        <p>
          {getWeatherDescription(current.weather_code)}
        </p>

        <p>
          Feels like: {current.apparent_temperature}°C
        </p>
      </div>

      {/* Weather Details */}
      <div className="weather-details">
        <div>
          <strong>Humidity</strong>
          <p>{current.relative_humidity_2m}%</p>
        </div>

        <div>
          <strong>Wind Speed</strong>
          <p>{current.wind_speed_10m} km/h</p>
        </div>

        <div>
          <strong>Precipitation</strong>
          <p>{current.precipitation} mm</p>
        </div>
      </div>

      {/* Seven-Day Forecast */}
      <div className="weather-forecast">
        <h3>7-Day Weather Forecast</h3>

        <div className="forecast-list">
          {weather.forecast.time.map((date, index) => (
            <div className="forecast-item" key={date}>
              <h4>
                {new Date(`${date}T00:00:00`).toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  }
                )}
              </h4>

              <p>
                {getWeatherDescription(
                  weather.forecast.weather_code[index]
                )}
              </p>

              <p>
                <strong>
                  {Math.round(
                    weather.forecast.temperature_2m_max[index]
                  )}°C
                </strong>
                {" / "}
                {Math.round(
                  weather.forecast.temperature_2m_min[index]
                )}°C
              </p>

              <p>
                Rain probability:{" "}
                {weather.forecast.precipitation_probability_max[index] ?? "N/A"}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Recommendations */}
      <div className="travel-suggestions">
        <h3>Travel Recommendations</h3>

        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeatherCard;

