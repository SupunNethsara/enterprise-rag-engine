package com.enterprise.rag.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    @NotBlank(message = "Message/Query cannot be empty")
    private String query;

    @Builder.Default
    private Integer topK = 4;

    public int getTopK() {
        return topK != null ? topK : 4;
    }

    private UUID documentId;
}
