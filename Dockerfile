FROM node:20-alpine

WORKDIR /app

# 依存関係インストール用にpackageファイルだけ先にコピー
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.* ./

RUN npm install

# 残りのソースをコピー
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
