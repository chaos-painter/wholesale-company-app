# Step 1: Compute a recipe file for caching dependencies
FROM lukemathwalker/cargo-chef:latest-rust-1.77 AS chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-json recipe.json

# Step 2: Build dependencies - this layer is cached unless Cargo.toml changes
FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-json recipe.json

# Step 3: Build the actual application
COPY . .
# We disable SQLx offline mode for simplicity since we're running migrations at startup
ENV SQLX_OFFLINE=false
RUN cargo build --release --bin backend

# Step 4: Runtime Stage
FROM debian:bookworm-slim AS runtime
WORKDIR /app
# Install OpenSSL and CA-certificates (needed for SQLx/TLS)
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder
COPY --from=builder /app/target/release/backend /usr/local/bin/app
# Copy the migrations folder so sqlx::migrate!() can find it
COPY --from=builder /app/migrations /app/migrations

ENTRYPOINT ["/usr/local/bin/app"]