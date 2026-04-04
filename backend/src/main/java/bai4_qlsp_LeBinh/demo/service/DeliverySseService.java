package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.DeliveryRealtimeEventResponse;
import bai4_qlsp_LeBinh.demo.dto.response.DeliveryTrackingResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class DeliverySseService {

    private static final long SSE_TIMEOUT_MS = 30L * 60L * 1000L;

    private final Map<Long, List<SseEmitter>> emittersByOrderId = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long orderId, DeliveryTrackingResponse snapshot) {
        // SSE is enough here because tracking is server-to-client push, simpler than full WebSocket.
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        emittersByOrderId.computeIfAbsent(orderId, ignored -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(orderId, emitter));
        emitter.onTimeout(() -> removeEmitter(orderId, emitter));
        emitter.onError(error -> removeEmitter(orderId, emitter));

        sendEvent(emitter, DeliveryRealtimeEventResponse.builder()
                .eventType("TRACKING_SNAPSHOT")
                .orderId(orderId)
                .emittedAt(LocalDateTime.now())
                .tracking(snapshot)
                .build());

        return emitter;
    }

    public void publishUpdate(Long orderId, String eventType, DeliveryTrackingResponse snapshot) {
        List<SseEmitter> emitters = emittersByOrderId.get(orderId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        DeliveryRealtimeEventResponse payload = DeliveryRealtimeEventResponse.builder()
                .eventType(eventType)
                .orderId(orderId)
                .emittedAt(LocalDateTime.now())
                .tracking(snapshot)
                .build();

        emitters.forEach(emitter -> sendEvent(emitter, payload));
    }

    private void sendEvent(SseEmitter emitter, DeliveryRealtimeEventResponse payload) {
        try {
            emitter.send(SseEmitter.event().name(payload.eventType()).data(payload));
        } catch (IOException exception) {
            emitter.complete();
        }
    }

    private void removeEmitter(Long orderId, SseEmitter emitter) {
        List<SseEmitter> emitters = emittersByOrderId.get(orderId);
        if (emitters == null) {
            return;
        }
        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByOrderId.remove(orderId);
        }
    }
}
