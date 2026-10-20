package com.enterprise.rag.application.dto;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class CitationDto {
    String content;
    String sourceFilename;
    Integer pageNumber;
    Double score;
    Map<String, Object> metadata;
}
