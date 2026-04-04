import { useEffect, useRef, useState } from "react";
import {
  getOrderTracking,
  subscribeOrderTracking,
} from "../api/deliveryApi";
import type { DeliveryRealtimeEvent, DeliveryTrackingViewModel } from "../types/delivery";

type StreamStatus = "idle" | "connecting" | "live" | "reconnecting" | "fallback";

interface UseOrderTrackingStreamOptions {
  enabled?: boolean;
  onSnapshot: (tracking: DeliveryTrackingViewModel) => void;
}

interface UseOrderTrackingStreamResult {
  streamStatus: StreamStatus;
  lastEvent?: DeliveryRealtimeEvent;
  streamError: boolean;
}

const RECONNECT_DELAYS = [1500, 3000, 5000];

export function useOrderTrackingStream(
  orderId: number,
  options: UseOrderTrackingStreamOptions
): UseOrderTrackingStreamResult {
  const { enabled = true, onSnapshot } = options;
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");
  const [lastEvent, setLastEvent] = useState<DeliveryRealtimeEvent>();
  const [streamError, setStreamError] = useState(false);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackInFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled || !orderId) {
      setStreamStatus("idle");
      setStreamError(false);
      return;
    }

    let active = true;

    // SSE fits this page because updates flow one-way from server to viewer.
    const cleanupStream = () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const fetchFallbackSnapshot = async () => {
      if (fallbackInFlightRef.current) {
        return;
      }

      fallbackInFlightRef.current = true;
      try {
        const snapshot = await getOrderTracking(orderId);
        if (!active) {
          return;
        }

        onSnapshot(snapshot);
        setStreamStatus("fallback");
        setStreamError(false);
      } catch {
        if (active) {
          setStreamError(true);
        }
      } finally {
        fallbackInFlightRef.current = false;
      }
    };

    const connect = () => {
      clearReconnectTimer();
      cleanupStream();
      setStreamStatus(reconnectAttemptRef.current > 0 ? "reconnecting" : "connecting");

      const eventSource = subscribeOrderTracking(orderId, {
        onMessage: (event) => {
          if (!active) {
            return;
          }

          reconnectAttemptRef.current = 0;
          setLastEvent(event);
          setStreamStatus("live");
          setStreamError(false);
          onSnapshot(event.tracking);
        },
        onError: () => {
          if (!active) {
            return;
          }

          cleanupStream();
          void fetchFallbackSnapshot();

          const attempt = reconnectAttemptRef.current;
          const delay = RECONNECT_DELAYS[Math.min(attempt, RECONNECT_DELAYS.length - 1)];
          reconnectAttemptRef.current += 1;
          setStreamError(true);
          setStreamStatus("reconnecting");
          reconnectTimerRef.current = window.setTimeout(connect, delay);
        },
      });

      if (!eventSource) {
        setStreamStatus("fallback");
        setStreamError(true);
        void fetchFallbackSnapshot();
        return;
      }

      eventSourceRef.current = eventSource;
      eventSource.onopen = () => {
        if (!active) {
          return;
        }

        reconnectAttemptRef.current = 0;
        setStreamStatus("live");
        setStreamError(false);
      };
    };

    connect();

    return () => {
      active = false;
      clearReconnectTimer();
      cleanupStream();
    };
  }, [enabled, onSnapshot, orderId]);

  return {
    streamStatus,
    lastEvent,
    streamError,
  };
}
