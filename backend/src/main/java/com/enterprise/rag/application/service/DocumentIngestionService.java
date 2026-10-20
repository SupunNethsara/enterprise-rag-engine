package com.enterprise.rag.application.service;

import com.enterprise.rag.application.dto.DocumentResponse;
import com.enterprise.rag.domain.model.DocumentRecord;
import com.enterprise.rag.domain.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final DocumentRepository documentRepository;

    @Transactional
    public DocumentResponse ingestDocument(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        log.info("Starting ingestion for file: {}, size: {} bytes, type: {}", filename, file.getSize(), contentType);

        // 1. Create relational record with INDEXING status
        DocumentRecord record = DocumentRecord.builder()
                .filename(filename)
                .contentType(contentType)
                .sizeBytes(file.getSize())
                .chunkCount(0)
                .status(DocumentRecord.IngestionStatus.INDEXING)
                .build();
        record = documentRepository.save(record);

        try {
            // 2. Extract raw documents based on content type
            List<Document> rawDocuments = parseFile(file);

            // 3. Chunking (Semantic Splitting)
            TokenTextSplitter textSplitter = TokenTextSplitter.builder()
                    .withChunkSize(600)
                    .withMinChunkSizeChars(100)
                    .build();

            List<Document> chunks = textSplitter.apply(rawDocuments);
            log.info("Document {} parsed into {} raw segments and split into {} chunks",
                    filename, rawDocuments.size(), chunks.size());

            // 4. Enrich chunk metadata for filtering and citations
            UUID docId = record.getId();
            for (int i = 0; i < chunks.size(); i++) {
                Document chunk = chunks.get(i);
                Map<String, Object> metadata = chunk.getMetadata();
                metadata.put("document_id", docId.toString());
                metadata.put("filename", filename);
                metadata.put("chunk_index", i);
            }

            // 5. Embed and store into pgvector
            vectorStore.add(chunks);

            // 6. Update relational record to COMPLETED
            record.setChunkCount(chunks.size());
            record.setStatus(DocumentRecord.IngestionStatus.COMPLETED);
            documentRepository.save(record);

            log.info("Successfully indexed document: {} with {} vector chunks", filename, chunks.size());
            return DocumentResponse.from(record);

        } catch (Exception ex) {
            log.error("Failed to ingest document: {}", filename, ex);
            record.setStatus(DocumentRecord.IngestionStatus.FAILED);
            documentRepository.save(record);
            throw new RuntimeException("Document indexing failed: " + ex.getMessage(), ex);
        }
    }

    private List<Document> parseFile(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();

        if (contentType != null && contentType.equalsIgnoreCase("application/pdf")
                || (filename != null && filename.toLowerCase().endsWith(".pdf"))) {
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            PagePdfDocumentReader reader = new PagePdfDocumentReader(resource, PdfDocumentReaderConfig.defaultConfig());
            return reader.read();
        } else {
            // Plain text, Markdown, CSV, JSON
            String text = new String(file.getBytes(), StandardCharsets.UTF_8);
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("filename", filename);
            return List.of(new Document(text, metadata));
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listAllDocuments() {
        return documentRepository.findAll().stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<DocumentResponse> getDocument(UUID id) {
        return documentRepository.findById(id).map(DocumentResponse::from);
    }
}
