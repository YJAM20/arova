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
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "OurLittleUniverse.dll"]
