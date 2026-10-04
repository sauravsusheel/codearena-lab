FROM node:22-bookworm
RUN npm install --global --no-audit --no-fund typescript@5.9.3
RUN useradd -u 1000 -m codearena
USER codearena
WORKDIR /work
