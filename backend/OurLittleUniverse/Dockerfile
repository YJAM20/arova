# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution/projects and restore dependencies
COPY ["OurLittleUniverse/OurLittleUniverse.csproj", "OurLittleUniverse/"]
RUN dotnet restore "OurLittleUniverse/OurLittleUniverse.csproj"

COPY . .
WORKDIR "/src/OurLittleUniverse"
RUN dotnet publish "OurLittleUniverse.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

# Create a dedicated non-root user and group
RUN groupadd -g 2000 appgroup && \
    useradd -r -u 2000 -g appgroup appuser

COPY --chown=appuser:appgroup --from=build /app/publish .

USER appuser

ENTRYPOINT ["dotnet", "OurLittleUniverse.dll"]
