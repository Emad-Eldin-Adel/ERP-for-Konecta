# Multi-stage build
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Make Maven a bit more resilient to flaky networks
ENV MAVEN_OPTS="-Dmaven.wagon.http.retryHandler.count=5 -Dmaven.wagon.http.retryHandler.requestSentEnabled=true"

# Copy pom.xml and download dependencies
COPY pom.xml .
# Retry the dependency download a few times to absorb transient failures
RUN set -eux; \
    for attempt in 1 2 3; do \
        mvn dependency:go-offline -B && break; \
        if [ "$attempt" -eq 3 ]; then exit 1; fi; \
        echo "Retrying dependency:go-offline (attempt ${attempt}/3)"; \
        sleep $((attempt * 5)); \
    done

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8094

ENTRYPOINT ["java", "-jar", "app.jar"]
