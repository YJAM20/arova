using System.Text;
using LoveUniverse.Api.Auth;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.Hubs;
using LoveUniverse.Api.Options;
using LoveUniverse.Api.Services;
using LoveUniverse.Api.Services.Email;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

const string AngularDevCorsPolicy = "AngularDevClient";
const string SwaggerSecurityScheme = "Bearer";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Arova API",
        Version = "v1",
        Description = "Arova - A private space for two."
    });

    options.AddSecurityDefinition(SwaggerSecurityScheme, new OpenApiSecurityScheme
    {
        Description = "Enter a JWT bearer token. Example: Bearer eyJhbGciOi...",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference(SwaggerSecurityScheme, document, null),
            []
        }
    });
});
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<ProductProfileOptions>(builder.Configuration.GetSection("ProductProfile"));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IPasswordStrengthService, PasswordStrengthService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<ISetupStatusService, SetupStatusService>();
builder.Services.AddScoped<ICoupleService, CoupleService>();
builder.Services.AddScoped<IMemoryService, MemoryService>();
builder.Services.AddScoped<IReasonService, ReasonService>();
builder.Services.AddScoped<ILetterService, LetterService>();
builder.Services.AddScoped<IMoodService, MoodService>();
builder.Services.AddScoped<ISongService, SongService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IChallengeService, ChallengeService>();
builder.Services.AddScoped<IFuturePlanService, FuturePlanService>();
builder.Services.AddScoped<ICoupleGoalService, CoupleGoalService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IBackupService, BackupService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IOnboardingService, OnboardingService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IPlanetService, PlanetService>();
builder.Services.AddScoped<IRelationshipScoreService, RelationshipScoreService>();
builder.Services.AddScoped<ICustomSectionService, CustomSectionService>();
builder.Services.AddScoped<IDailyQuestionService, DailyQuestionService>();
builder.Services.AddScoped<ICheckInService, CheckInService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IDailyDigestService, DailyDigestService>();
builder.Services.AddScoped<IImportantDateService, ImportantDateService>();
builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Email"));
builder.Services.AddHttpClient();
builder.Services.AddScoped<ConsoleEmailSender>();
builder.Services.AddScoped<ResendEmailSender>();
builder.Services.AddScoped<IEmailSender>(sp =>
{
    var options = sp.GetRequiredService<IOptions<EmailOptions>>().Value;
    var logger = sp.GetRequiredService<ILogger<Program>>();

    if (string.Equals(options.Provider, "Resend", StringComparison.OrdinalIgnoreCase))
    {
        if (string.IsNullOrWhiteSpace(options.ResendApiKey))
        {
            logger.LogWarning("Email provider is configured as Resend, but ResendApiKey is missing. Falling back to ConsoleEmailSender.");
            return sp.GetRequiredService<ConsoleEmailSender>();
        }
        return sp.GetRequiredService<ResendEmailSender>();
    }

    return sp.GetRequiredService<ConsoleEmailSender>();
});
builder.Services.AddScoped<ISmsSender, ConsoleSmsSender>();
builder.Services.AddScoped<IAccountVerificationService, AccountVerificationService>();
builder.Services.AddScoped<IExternalAuthVerifier, GoogleExternalAuthVerifier>();
builder.Services.AddScoped<IExternalAuthVerifier, AppleExternalAuthVerifier>();
builder.Services.AddSignalR();
builder.Services.AddAuthorization();
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

    options.UseSqlServer(connectionString);
});

var jwtIssuer = builder.Configuration["JwtSettings:Issuer"]
    ?? throw new InvalidOperationException("JWT issuer is not configured.");
var jwtAudience = builder.Configuration["JwtSettings:Audience"]
    ?? throw new InvalidOperationException("JWT audience is not configured.");
var jwtSecretKey = builder.Configuration["JwtSettings:SecretKey"]
    ?? throw new InvalidOperationException("JWT secret key is not configured.");

if (jwtSecretKey.Length < 32)
{
    throw new InvalidOperationException("JWT secret key must be at least 32 characters.");
}

var jwtSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = jwtSigningKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrWhiteSpace(accessToken) && path.StartsWithSegments("/hubs/couple"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .GetChildren()
    .Select(origin => origin.Value)
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin!)
    .ToArray();

if (allowedOrigins.Length == 0)
{
    allowedOrigins =
    [
        "http://localhost:4200",
        "https://localhost:4200"
    ];
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularDevCorsPolicy, policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(AngularDevCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<CoupleHub>("/hubs/couple");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var environment = app.Environment;
    var configuration = app.Configuration;
    var logger = services.GetRequiredService<ILogger<Program>>();

    bool isDevelopment = environment.IsDevelopment();
    bool autoMigrateConfig = configuration.GetValue<bool>("Database:AutoMigrate") || configuration.GetValue<bool>("Database__AutoMigrate");

    if (isDevelopment || autoMigrateConfig)
    {
        logger.LogInformation("Database auto-migration starting. Environment: {Env}, Config Flag: {Flag}", 
            environment.EnvironmentName, autoMigrateConfig);

        try
        {
            var db = services.GetRequiredService<AppDbContext>();
            db.Database.Migrate();
            logger.LogInformation("Database auto-migration completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database auto-migration encountered a critical failure.");
            if (!isDevelopment)
            {
                throw new InvalidOperationException("Critical failure: Production database migration failed. Application startup aborted.", ex);
            }
        }
    }
}

app.Run();
