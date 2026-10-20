# ---------------------------------------------------
# STAGE 1: Build the JAR artifact using Maven & JDK 21
# ---------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper & POM first for layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Fix potential Windows CRLF issues and grant execute permissions
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copy application sources & build optimized jar
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ---------------------------------------------------
# STAGE 2: Lightweight Production JRE Runner (~200MB)
# ---------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Security: Non-root user
RUN addgroup -S raggroup && adduser -S raguser -G raggroup
USER raguser

# Copy compiled JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

# Production JVM Flags
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
