# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – Build the Vite / React client
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS client-build

WORKDIR /app/client

# Install dependencies first (better layer caching)
COPY housetohome.client/package*.json ./
RUN npm ci

# Copy source and build
COPY housetohome.client/ ./
RUN npm run build
# Output lands in housetohome.client/dist


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – Build the ASP.NET Core server
# ─────────────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS server-build

WORKDIR /app/server

# Restore dependencies first (better layer caching)
COPY HouseToHome.Server/*.csproj ./
RUN dotnet restore

# Copy everything else and publish
COPY HouseToHome.Server/ ./
RUN dotnet publish -c Release -o /app/publish --no-restore


# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 – Final runtime image
# ─────────────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Copy published .NET app
COPY --from=server-build /app/publish ./

# Copy built React app into wwwroot so UseStaticFiles() serves it
COPY --from=client-build /app/client/dist ./wwwroot

# Render injects PORT env var; ASP.NET Core reads ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "HouseToHome.Server.dll"]
