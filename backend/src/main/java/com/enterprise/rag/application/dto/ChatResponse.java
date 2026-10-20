package com.enterprise.rag.application.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class ChatResponse {
    String answer;
    List<CitationDto> citations;
}
