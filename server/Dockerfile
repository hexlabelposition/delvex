FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw \
    && ./mvnw --batch-mode --no-transfer-progress \
        dependency:go-offline

COPY src/ src/
RUN ./mvnw --batch-mode --no-transfer-progress \
    -DskipTests package

FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache curl \
    && addgroup --system delvex \
    && adduser --system --ingroup delvex delvex

WORKDIR /app

COPY --from=build --chown=delvex:delvex \
    /workspace/target/server-*.jar app.jar

USER delvex

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
    CMD curl --fail --silent http://localhost:8080/api/health/ready \
        || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
