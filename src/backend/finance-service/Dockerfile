FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY finance-service.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5288
EXPOSE 5288

ENTRYPOINT ["dotnet", "finance-service.dll"]
