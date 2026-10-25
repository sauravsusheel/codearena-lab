FROM node:22-bookworm
RUN npm install --global --no-audit --no-fund typescript@5.9.3
RUN usermod -l codearena node && usermod -d /home/codearena -m codearena
USER codearena
WORKDIR /work
