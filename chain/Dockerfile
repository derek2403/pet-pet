# Use official Foundry image as base
FROM ghcr.io/foundry-rs/foundry:latest

# Expose the default Anvil RPC port
EXPOSE 8545

# Set the entrypoint to anvil
ENTRYPOINT ["anvil"]

# Default arguments for anvil
CMD ["--host", "0.0.0.0", "--chain-id", "2403", "--block-time", "6"]

