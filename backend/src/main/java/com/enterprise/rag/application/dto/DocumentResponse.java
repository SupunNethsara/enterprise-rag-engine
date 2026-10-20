package com.enterprise.rag.application.dto;

import com.enterprise.rag.domain.model.DocumentRecord;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class DocumentResponse {
    UUID id;
    String filename;
    String contentType;
    Long sizeBytes;
    Integer chunkCount;
    DocumentRecord.IngestionStatus status;
    Instant createdAt;

    public static DocumentResponse from(DocumentRecord doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .filename(doc.getFilename())
                .contentType(doc.getContentType())
                .sizeBytes(doc.getSizeBytes())
                .chunkCount(doc.getChunkCount())
                .status(doc.getStatus())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
