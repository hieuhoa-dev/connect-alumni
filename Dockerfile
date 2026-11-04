# 1. Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 2. Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Biến môi trường giả lập (dummy) cho giai đoạn build
# Giúp Next.js pre-render trang và khởi tạo Better Auth mà không bị crash
# Các giá trị thật sẽ được nạp khi container chạy (runtime) từ docker-compose/.env
ENV BETTER_AUTH_SECRET="build_dummy_secret_at_least_32_characters_long_12345"
ENV BETTER_AUTH_URL="http://localhost:3000"
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/connect_alumni"
ENV REDIS_URL="redis://localhost:6379"
ENV AWS_ENDPOINT_URL_S3="http://localhost:8333"
ENV AWS_ACCESS_KEY_ID="seaweedadmin"
ENV AWS_SECRET_ACCESS_KEY="seaweedadmin"
ENV AWS_REGION="us-east-1"
ENV S3_BUCKET_NAME="alumni"

RUN npm run build

# 4. Runner stage (Production)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Tạo user bảo mật
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy thư mục static công khai
COPY --from=builder /app/public ./public

# Phân quyền cho Next.js cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy output standalone (chỉ bao gồm các file tối thiểu cần thiết để chạy)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# (Tùy chọn) Chỉ copy nếu bạn thực sự cần chạy Drizzle migration trong container lúc khởi động:
# COPY --from=builder /app/drizzle ./drizzle

USER nextjs

EXPOSE 3000

# Khởi động thẳng bằng node thay vì thông qua npm
CMD ["node", "server.js"]

# 5. Worker stage (BullMQ Background Worker)
FROM base AS worker
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

CMD ["npx", "tsx", "src/workers/notification.worker.ts"]