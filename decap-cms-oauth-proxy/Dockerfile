# Use a Go base image to build the application
FROM golang:1.21-alpine AS builder

# Set the working directory
WORKDIR /app

# Install git
RUN apk update && apk add git

# Step 1: Manually clone the public repository.
RUN git clone https://github.com/aduco/proxice.git

# Step 2: Navigate into the correct directory and build the application from source.
WORKDIR /app/proxice
RUN CGO_ENABLED=0 go build -o /proxice ./cmd/proxice

# Use a minimal, non-root final image for security
FROM gcr.io/distroless/static-debian11

# Copy the compiled binary from the builder stage.
COPY --from=builder /proxice /

# Set the entrypoint for the container
ENTRYPOINT ["/proxice"]