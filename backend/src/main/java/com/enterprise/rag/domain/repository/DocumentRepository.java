package com.enterprise.rag.domain.repository;

import com.enterprise.rag.domain.model.DocumentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentRecord, UUID> {
}
