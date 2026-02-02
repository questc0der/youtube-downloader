FROM node:18-slim

# Install Python3, pip, and ffmpeg (required for yt-dlp)
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install yt-dlp with curl_cffi support for impersonation bypasses
RUN pip3 install "yt-dlp[default,curl_cffi]" --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
