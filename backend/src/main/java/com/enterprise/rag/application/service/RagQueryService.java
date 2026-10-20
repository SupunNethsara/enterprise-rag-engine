package com.enterprise.rag.application.service;

import com.enterprise.rag.application.dto.ChatRequest;
import com.enterprise.rag.application.dto.ChatResponse;
import com.enterprise.rag.application.dto.CitationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagQueryService {

    private final VectorStore vectorStore;
    private final ChatModel chatModel;

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are an enterprise AI knowledge assistant.
            Your task is to answer the user query accurately, concisely, and strictly using ONLY the factual context provided below.
            
            Guidelines:
            - If the context does not contain enough information to answer the question, clearly state: "The requested information is not available in the indexed documents."
            - Do not make assumptions or fabricate information outside of the context.
            - When possible, refer to the document name or section mentioned in the context.
            
            ---------------------
            CONTEXT:
            %s
            ---------------------
            """;

    public ChatResponse processQuery(ChatRequest request) {
        log.info("Processing RAG query: '{}' with topK={}", request.getQuery(), request.getTopK());

        // 1. Vector Similarity Search via PgVectorStore
        SearchRequest searchRequest = SearchRequest.builder()
                .query(request.getQuery())
                .topK(request.getTopK())
                .similarityThreshold(0.5)
                .build();

        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);
        log.info("Retrieved {} relevant document chunks from vector store", similarDocuments.size());

        // 2. Build Context String from retrieved chunks
        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        // 3. Construct System and User messages for the LLM
        String formattedSystemPrompt = String.format(SYSTEM_PROMPT_TEMPLATE,
                context.isBlank() ? "No relevant document chunks found." : context);

        SystemMessage systemMessage = new SystemMessage(formattedSystemPrompt);
        UserMessage userMessage = new UserMessage(request.getQuery());

        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));

        // 4. Generate answer using Ollama (llama3.2)
        String aiAnswer = chatModel.call(prompt).getResult().getOutput().getText();

        // 5. Extract citations for frontend verification
        List<CitationDto> citations = new ArrayList<>();
        for (Document doc : similarDocuments) {
            String filename = doc.getMetadata().getOrDefault("filename", "unknown").toString();
            Integer pageNumber = null;
            if (doc.getMetadata().containsKey("page_number")) {
                Object pageObj = doc.getMetadata().get("page_number");
                if (pageObj instanceof Number num) {
                    pageNumber = num.intValue();
                }
            }
            Double score = doc.getScore();

            citations.add(CitationDto.builder()
                    .content(doc.getText())
                    .sourceFilename(filename)
                    .pageNumber(pageNumber)
                    .score(score)
                    .metadata(doc.getMetadata())
                    .build());
        }

        return ChatResponse.builder()
                .answer(aiAnswer)
                .citations(citations)
                .build();
    }
}
