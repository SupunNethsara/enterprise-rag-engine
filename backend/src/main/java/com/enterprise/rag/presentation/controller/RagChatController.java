package com.enterprise.rag.presentation.controller;

import com.enterprise.rag.application.dto.ChatRequest;
import com.enterprise.rag.application.dto.ChatResponse;
import com.enterprise.rag.application.service.RagQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Cross-origin ready for Next.js frontend
public class RagChatController {

    private final RagQueryService ragQueryService;

    @PostMapping
    public ResponseEntity<ChatResponse> askQuestion(@Valid @RequestBody ChatRequest request) {
        log.info("Received chat query: {}", request.getQuery());
        ChatResponse response = ragQueryService.processQuery(request);
        return ResponseEntity.ok(response);
    }
}
