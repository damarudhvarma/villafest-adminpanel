import React, { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { StandaloneSearchBox } from "@react-google-maps/api";
import "./GoogleMap.css";

// Only load essential libraries
const libraries = ["places"];

const mapOptions = {
  mapId: "8f9c3c8c3c8c3c8c",
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: true,
  mapTypeControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

const MapComponent = ({
  onLocationSelect,
  initialLocation,
  isViewOnly = false,
}) => {
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [marker, setMarker] = useState(
    initialLocation || {
      lat: 20.5937,
      lng: 78.9629,
    }
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const markerRef = useRef(null);
  const searchBoxRef = useRef(null);
  const mapRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const isApiLoaded = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const mapStyles = {
    height: "400px",
    width: "100%",
  };

  const handleRetry = useCallback(() => {
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      setIsLoading(true);
      setError(null);
      isApiLoaded.current = false;
      // Force a reload of the Google Maps script
      const script = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (script) {
        script.remove();
      }
      // Trigger a re-render of the LoadScript component
      setIsLoading(true);
    } else {
      setError("Maximum retry attempts reached. Please refresh the page.");
    }
  }, []);

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsLoading(false);
      isApiLoaded.current = true;
      return;
    }

    // Set a timeout to handle cases where the map fails to load
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        handleRetry();
      }
    }, 5000); // Reduced timeout to 5 seconds

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, handleRetry]);

  const onLoad = useCallback((map) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    setMap(map);
    mapRef.current = map;
    setIsLoading(false);
    isApiLoaded.current = true;
    retryCount.current = 0; // Reset retry count on successful load
  }, []);

  const onError = useCallback(
    (error) => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      console.error("Error loading Google Maps:", error);
      handleRetry();
    },
    [handleRetry]
  );

  const onLoadSearchBox = useCallback((ref) => {
    setSearchBox(ref);
  }, []);

  const onPlacesChanged = useCallback(() => {
    if (searchBox && !isViewOnly) {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setMarker(newLocation);
      if (mapRef.current) {
        mapRef.current.panTo(newLocation);
        mapRef.current.setZoom(15);
      }
      if (onLocationSelect) {
        onLocationSelect(newLocation);
      }

      // Prevent the modal from closing
      const event = new CustomEvent("placeSelected", {
        bubbles: true,
        detail: { place },
      });
      document.dispatchEvent(event);
    }
  }, [searchBox, onLocationSelect, isViewOnly]);

  useEffect(() => {
    if (mapRef.current && initialLocation) {
      const newPosition = {
        lat: parseFloat(initialLocation.lat),
        lng: parseFloat(initialLocation.lng),
      };
      setMarker(newPosition);
      mapRef.current.panTo(newPosition);
      mapRef.current.setZoom(15);
    }
  }, [initialLocation]);

  useEffect(() => {
    // Add event listener to prevent modal closing when selecting a place
    const handlePlaceSelected = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    document.addEventListener("placeSelected", handlePlaceSelected, true);

    return () => {
      document.removeEventListener("placeSelected", handlePlaceSelected, true);
    };
  }, []);

  const handleMapClick = useCallback(
    (event) => {
      if (!isViewOnly) {
        const searchBoxElement = searchBoxRef.current;
        if (searchBoxElement) {
          const searchBoxRect = searchBoxElement.getBoundingClientRect();
          const clickX = event.domEvent.clientX;
          const clickY = event.domEvent.clientY;

          if (
            clickX >= searchBoxRect.left &&
            clickX <= searchBoxRect.right &&
            clickY >= searchBoxRect.top &&
            clickY <= searchBoxRect.bottom
          ) {
            return;
          }
        }

        const newLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        setMarker(newLocation);
        if (mapRef.current) {
          mapRef.current.panTo(newLocation);
          mapRef.current.setZoom(15);
        }
        if (onLocationSelect) {
          onLocationSelect(newLocation);
        }
      }
    },
    [onLocationSelect, isViewOnly]
  );

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    if (markerRef.current) {
      markerRef.current.map = null;
    }

    const { AdvancedMarkerElement } = window.google.maps.marker;

    const pinElement = document.createElement("div");
    pinElement.className = "custom-marker";
    pinElement.innerHTML = `
      <div class="marker-pin"></div>
    `;

    const newMarker = new AdvancedMarkerElement({
      map: mapRef.current,
      position: marker,
      content: pinElement,
      draggable: !isViewOnly,
    });

    if (!isViewOnly) {
      newMarker.addListener("dragend", () => {
        const position = newMarker.position;
        const newLocation = {
          lat: position.lat,
          lng: position.lng,
        };
        setMarker(newLocation);
        if (onLocationSelect) {
          onLocationSelect(newLocation);
        }
      });
    }

    markerRef.current = newMarker;

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [marker, isViewOnly, onLocationSelect]);

  // Don't render the map if the API isn't loaded
  if (!window.google || !window.google.maps) {
    return (
      <div className="map-container">
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>
            Loading map...{" "}
            {retryCount.current > 0
              ? `(Attempt ${retryCount.current}/${maxRetries})`
              : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      {isLoading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>
            Loading map...{" "}
            {retryCount.current > 0
              ? `(Attempt ${retryCount.current}/${maxRetries})`
              : ""}
          </p>
        </div>
      )}
      {error && (
        <div className="map-error">
          <p>{error}</p>
          {retryCount.current < maxRetries && (
            <button
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          )}
        </div>
      )}
      {!isViewOnly && (
        <div className="search-box-container">
          <StandaloneSearchBox
            onLoad={onLoadSearchBox}
            onPlacesChanged={onPlacesChanged}
          >
            <input
              ref={searchBoxRef}
              type="text"
              placeholder="Search for a location"
              className="search-input"
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              onFocus={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onBlur={(e) => {
                // Add a small delay to allow place selection to complete
                setTimeout(() => {
                  if (!e.relatedTarget?.closest(".pac-container")) {
                    e.stopPropagation();
                  }
                }, 100);
              }}
            />
          </StandaloneSearchBox>
        </div>
      )}
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={initialLocation ? 15 : 6}
        center={marker}
        onClick={handleMapClick}
        onLoad={onLoad}
        options={{
          ...mapOptions,
          mapTypeControl: isViewOnly ? false : true,
          scrollwheel: !isViewOnly,
          gestureHandling: isViewOnly ? "cooperative" : "greedy",
          draggable: !isViewOnly,
        }}
      />
    </div>
  );
};

export default MapComponent;
