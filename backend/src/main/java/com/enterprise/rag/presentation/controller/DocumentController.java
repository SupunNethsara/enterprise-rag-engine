package com.enterprise.rag.presentation.controller;

import com.enterprise.rag.application.dto.DocumentResponse;
import com.enterprise.rag.application.service.DocumentIngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Cross-origin ready for Next.js frontend
public class DocumentController {

    private final DocumentIngestionService ingestionService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> uploadDocument(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("Received document upload request: {}", file.getOriginalFilename());
        DocumentResponse response = ingestionService.ingestDocument(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> listDocuments() {
        return ResponseEntity.ok(ingestionService.listAllDocuments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable UUID id) {
        return ingestionService.getDocument(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
