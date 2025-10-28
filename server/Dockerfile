# syntax=docker/dockerfile:1
FROM scratch
WORKDIR /app

ENV PORT=8080

COPY bin/api /app/api

EXPOSE 8080
ENTRYPOINT ["/app/api"]
