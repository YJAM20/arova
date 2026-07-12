using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace OurLittleUniverse.Migrations
{
    /// <inheritdoc />
    public partial class InitialSqlServerCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider != "Microsoft.EntityFrameworkCore.SqlServer")
            {
                return;
            }

            migrationBuilder.CreateTable(
                name: "AppUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Username = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    AvatarUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    PasswordHash = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    EmailVerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    PhoneVerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AgeRange = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    MatureContentEnabled = table.Column<bool>(type: "bit", nullable: false),
                    IsSystemAdmin = table.Column<bool>(type: "bit", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OnboardingQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    TextEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TextAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TextEs = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsQuickStart = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnboardingQuestions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanetDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ThemeKey = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    EstimatedMinutes = table.Column<int>(type: "int", nullable: false),
                    PointsReward = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanetDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AccountVerificationCodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Channel = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Destination = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CodeHash = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Attempts = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountVerificationCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountVerificationCodes_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Couples",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Couples", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Couples_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FeedbackEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Context = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedbackEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeedbackEntries_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UserOnboardingAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionKey = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    AnswerValue = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOnboardingAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserOnboardingAnswers_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AgeRange = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    RelationshipStatus = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    RelationshipType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    PersonalityStyle = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    LoveLanguage = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    PreferredTheme = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    PreferredLanguage = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    AvatarUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    MatureContentEnabled = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserProfiles_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlanetTaskDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanetDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskKey = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    PointsReward = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanetTaskDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanetTaskDefinitions_PlanetDefinitions_PlanetDefinitionId",
                        column: x => x.PlanetDefinitionId,
                        principalTable: "PlanetDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Challenges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    StartsAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndsAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Challenges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Challenges_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Challenges_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MessageType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    AttachmentUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    AttachmentMimeType = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    AttachmentSizeBytes = table.Column<long>(type: "bigint", nullable: true),
                    EncryptionMode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    EncryptedPayload = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nonce = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    KeyId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatMessages_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChatMessages_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CheckIns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Mood = table.Column<int>(type: "int", nullable: false),
                    Energy = table.Column<int>(type: "int", nullable: false),
                    Need = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckIns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CheckIns_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CheckIns_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CoupleGoals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TargetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProgressPercent = table.Column<double>(type: "float", nullable: false),
                    IsPrivate = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoupleGoals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CoupleGoals_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CoupleGoals_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CoupleMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoupleMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CoupleMembers_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CoupleMembers_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CoupleSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DailyReasonsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    MoodTrackingEnabled = table.Column<bool>(type: "bit", nullable: false),
                    PrivateByDefault = table.Column<bool>(type: "bit", nullable: false),
                    ActiveTheme = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    LanguageMode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    AnimationsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    MusicEnabled = table.Column<bool>(type: "bit", nullable: false),
                    EmailNotificationsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    DailyDigestEnabled = table.Column<bool>(type: "bit", nullable: false),
                    PartnerActivityEmailsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoupleSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CoupleSettings_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CoupleSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    IsGifted = table.Column<bool>(type: "bit", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoupleSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CoupleSubscriptions_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CustomSections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    VisibilityLevel = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomSections_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomSections_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DailyCouplePlanets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanetDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyCouplePlanets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyCouplePlanets_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyCouplePlanets_PlanetDefinitions_PlanetDefinitionId",
                        column: x => x.PlanetDefinitionId,
                        principalTable: "PlanetDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DailyQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Prompt = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyQuestions_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FuturePlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PlannedFor = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VisibilityLevel = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FuturePlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FuturePlans_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FuturePlans_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ImportantDates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Recurrence = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReminderEnabled = table.Column<bool>(type: "bit", nullable: false),
                    ReminderDaysBefore = table.Column<int>(type: "int", nullable: false),
                    IsPrivate = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImportantDates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImportantDates_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImportantDates_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Letters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false),
                    PasscodeHash = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    VisibilityLevel = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    OpenOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Letters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Letters_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Letters_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Memories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PrivateNote = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    MemoryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: true),
                    MediaUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    VisibilityLevel = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Memories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Memories_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Memories_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MoodEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntryDate = table.Column<DateOnly>(type: "date", nullable: false),
                    MoodValue = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Response = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RespondedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MoodEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MoodEntries_AppUsers_RespondedByUserId",
                        column: x => x.RespondedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MoodEntries_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MoodEntries_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PairingCodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PairingCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PairingCodes_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PairingCodes_AppUsers_UsedByUserId",
                        column: x => x.UsedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PairingCodes_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reasons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    VisibilityLevel = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    UnlockDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reasons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reasons_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reasons_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RelationshipDailyTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskKey = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    PointsReward = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelationshipDailyTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RelationshipDailyTasks_AppUsers_CompletedByUserId",
                        column: x => x.CompletedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RelationshipDailyTasks_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RelationshipPointLedgers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SourceType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    SourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelationshipPointLedgers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RelationshipPointLedgers_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RelationshipPointLedgers_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Songs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Artist = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ExternalUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    AudioUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    CoverUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    License = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Attribution = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsFavorite = table.Column<bool>(type: "bit", nullable: false),
                    FavoritedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FavoritedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VisibilityLevel = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Songs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Songs_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Songs_AppUsers_FavoritedByUserId",
                        column: x => x.FavoritedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Songs_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ChallengeCompletions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChallengeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChallengeCompletions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChallengeCompletions_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChallengeCompletions_Challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "Challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChallengeCompletions_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CoupleGoalMilestones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GoalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoupleGoalMilestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CoupleGoalMilestones_CoupleGoals_GoalId",
                        column: x => x.GoalId,
                        principalTable: "CoupleGoals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomSectionItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomSectionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomSectionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomSectionItems_CustomSections_CustomSectionId",
                        column: x => x.CustomSectionId,
                        principalTable: "CustomSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyPlanetTaskCompletions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DailyCouplePlanetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskKey = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    PointsAwarded = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyPlanetTaskCompletions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyPlanetTaskCompletions_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyPlanetTaskCompletions_DailyCouplePlanets_DailyCouplePlanetId",
                        column: x => x.DailyCouplePlanetId,
                        principalTable: "DailyCouplePlanets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyQuestionAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyQuestionAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyQuestionAnswers_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyQuestionAnswers_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyQuestionAnswers_DailyQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "DailyQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReasonReactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReasonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoupleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReactionType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReasonReactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReasonReactions_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReasonReactions_Couples_CoupleId",
                        column: x => x.CoupleId,
                        principalTable: "Couples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReasonReactions_Reasons_ReasonId",
                        column: x => x.ReasonId,
                        principalTable: "Reasons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "OnboardingQuestions",
                columns: new[] { "Id", "Category", "IsActive", "IsQuickStart", "IsRequired", "Key", "SortOrder", "TextAr", "TextEn", "TextEs", "Type" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "identity", true, true, true, "display_name", 10, "ما الاسم الذي تريد أن تستخدمه Arova لك؟", "What name should Arova use for you?", "¿Qué nombre debe usar Arova para ti?", "text" },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "identity", true, true, true, "age_or_birthdate", 20, "ما الفئة العمرية أو تاريخ الميلاد الذي تريد مشاركته؟", "What age range or birthdate would you like to share?", "¿Qué rango de edad o fecha de nacimiento quieres compartir?", "text" },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "preferences", true, true, true, "preferred_language", 30, "ما اللغة التي يجب أن تستخدمها Arova أولاً؟", "Which language should Arova use first?", "¿Qué idioma debe usar Arova primero?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "relationship", true, true, true, "relationship_type", 40, "كيف تصف هذه المساحة المشتركة؟", "How would you describe this shared space?", "¿Cómo describirías este espacio compartido?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "personalization", true, true, true, "what_should_arova_help_with", 50, "ما أكثر شيء تريدان أن تساعدكما فيه Arova؟", "What should Arova help you both with most?", "¿En qué debería ayudarles más Arova?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "preferences", true, true, true, "preferred_space_tone", 60, "ما الشعور الذي تريده لمساحتكما؟", "What tone should your space feel like?", "¿Qué tono debería tener su espacio?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000007"), "relationship", true, true, true, "create_or_join_space", 70, "هل تريد إنشاء مساحة أم الانضمام إلى مساحة؟", "Do you want to create a space or join one?", "¿Quieres crear un espacio o unirte a uno?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000008"), "mood", true, false, false, "daily_checkin_style", 110, "كم مرة تفضل تسجيل الاطمئنان البسيط؟", "How often do you enjoy simple check-ins?", "¿Con qué frecuencia prefieres los registros simples?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000009"), "relationship", true, false, false, "favorite_memory_type", 120, "ما نوع الذكريات الأهم بالنسبة لك؟", "What kind of memories matter most to you?", "¿Qué tipo de recuerdos te importan más?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000010"), "communication", true, false, false, "communication_preference", 130, "كيف تفضل البقاء على تواصل؟", "How do you prefer to stay connected?", "¿Cómo prefieres mantenerte conectado?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000011"), "communication", true, false, false, "quiet_support_style", 140, "ما نوع الدعم الذي يناسبك في الأيام الصعبة؟", "What kind of support feels good on hard days?", "¿Qué tipo de apoyo se siente bien en días difíciles?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000012"), "preferences", true, false, false, "celebration_style", 150, "كيف تحب الاحتفال بالإنجازات الصغيرة؟", "How do you like to celebrate small wins?", "¿Cómo te gusta celebrar los pequeños logros?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000013"), "love-language", true, false, false, "love_language_primary", 160, "ما طرق التعبير عن الاهتمام الأكثر معنى لك؟", "Which expressions of care feel most meaningful?", "¿Qué expresiones de cariño son más significativas para ti?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000014"), "mood", true, false, false, "mood_prompt_preference", 170, "ما نوع أسئلة المزاج التي تبدو مفيدة؟", "What kind of mood prompts feel helpful?", "¿Qué tipo de preguntas de ánimo te ayudan?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000015"), "conflict", true, false, false, "conflict_reset_style", 180, "بعد الخلاف، ما الذي يساعدك على العودة بهدوء؟", "After a disagreement, what helps you reset?", "Después de un desacuerdo, ¿qué te ayuda a recomenzar?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000016"), "distance", true, false, false, "distance_support", 190, "إذا ابتعدتما لفترة، ما الذي يساعدك على الشعور بالقرب؟", "If you spend time apart, what helps you feel close?", "Si pasan tiempo separados, ¿qué les ayuda a sentirse cerca?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000017"), "privacy", true, false, false, "privacy_comfort", 200, "ما الذي يجب أن يبقى أكثر خصوصية افتراضياً؟", "What should stay more private by default?", "¿Qué debería ser más privado por defecto?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000018"), "future", true, false, false, "future_board_style", 210, "كيف تحب تخطيط الأفكار المستقبلية؟", "How do you like to plan future ideas?", "¿Cómo te gusta planear ideas futuras?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000019"), "relationship", true, false, false, "ritual_preference", 220, "ما الطقوس الصغيرة التي قد تستمتع بها؟", "What small rituals would you enjoy?", "¿Qué pequeños rituales disfrutarías?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000020"), "personalization", true, false, false, "profile_customization", 230, "ما مقدار تخصيص الملف الشخصي الذي تريده؟", "How much profile personalization do you want?", "¿Cuánta personalización de perfil quieres?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000021"), "preferences", true, false, false, "theme_preference", 240, "ما النمط البصري الذي تفضله؟", "What visual mood do you prefer?", "¿Qué estilo visual prefieres?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000022"), "personality", true, false, false, "question_depth", 250, "ما العمق المناسب عادة للأسئلة اليومية؟", "How deep should daily questions usually be?", "¿Qué tan profundas deberían ser las preguntas diarias?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000023"), "boundaries", true, false, false, "boundary_topic", 260, "هل توجد مواضيع تفضل أن تتعامل معها Arova بلطف؟", "Are there topics you prefer Arova to keep gentle?", "¿Hay temas que prefieres que Arova trate con suavidad?", "text" },
                    { new Guid("10000000-0000-0000-0000-000000000024"), "personality", true, false, false, "surprise_preference", 270, "هل تفضل الأسئلة المفاجئة أم الروتين المتوقع؟", "Do you enjoy surprise prompts or predictable routines?", "¿Prefieres sorpresas o rutinas predecibles?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000025"), "preferences", true, false, false, "memory_filters", 280, "ما مرشحات الذكريات التي ستكون مفيدة لاحقاً؟", "What memory filters would be useful later?", "¿Qué filtros de recuerdos serían útiles más adelante?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000026"), "communication", true, false, false, "conversation_starters", 290, "ما نوع بدايات الحديث التي تفضلها؟", "What kinds of conversation starters do you like?", "¿Qué tipos de temas para conversar te gustan?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000027"), "personalization", true, false, false, "care_reminders", 300, "هل ستكون تذكيرات الاهتمام اللطيفة مفيدة؟", "Would gentle care reminders be helpful?", "¿Serían útiles los recordatorios amables de cuidado?", "singleChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000028"), "future", true, false, false, "future_milestones", 310, "ما المحطات المستقبلية التي تريد تذكرها؟", "What future milestones would you like to remember?", "¿Qué metas futuras quisieras recordar?", "multiChoice" },
                    { new Guid("10000000-0000-0000-0000-000000000029"), "privacy", true, false, false, "data_privacy_expectation", 320, "ما توقعات الخصوصية التي يجب أن تحترمها Arova أكثر؟", "What privacy expectations should Arova respect most?", "¿Qué expectativas de privacidad debe respetar más Arova?", "multiChoice" }
                });

            migrationBuilder.InsertData(
                table: "PlanetDefinitions",
                columns: new[] { "Id", "Description", "Difficulty", "EstimatedMinutes", "IsActive", "Key", "Name", "PointsReward", "Purpose", "SortOrder", "ThemeKey" },
                values: new object[,]
                {
                    { new Guid("12ba0911-34cd-4ef1-89ab-da710cba0999"), "Discover new ideas, ask daily questions, and check-in.", "Easy", 10, true, "kepler", "Kepler", 25, "Discovery", 10, "kepler_theme" },
                    { new Guid("3dfa5611-cfcb-419b-aefb-b89a421c70e2"), "Foster passion, deeper expression, and intimate letters.", "Medium", 20, true, "mars", "Mars", 40, "Passion", 4, "mars_theme" },
                    { new Guid("47ba12ef-bc11-47fa-8ab2-da781cba9088"), "Embark on adventures, try new hobbies, and share laughs.", "Medium", 18, true, "uranus", "Uranus", 35, "Adventure", 7, "uranus_theme" },
                    { new Guid("5fba6a87-c10a-4dae-bcda-89710f22f7b1"), "Grow together by setting goals and reflecting on lessons.", "Hard", 30, true, "jupiter", "Jupiter", 50, "Growth", 5, "jupiter_theme" },
                    { new Guid("8a8d16eb-8bfb-4d43-85bb-41fa9bf6b9b1"), "Deepen communication and understand each other's expressions.", "Easy", 10, true, "mercury", "Mercury", 20, "Communication", 1, "mercury_theme" },
                    { new Guid("a98db25f-2a31-4db4-bb1f-36fa89c4ba22"), "Strengthen connection by recalling shared history.", "Easy", 12, true, "earth", "Earth", 25, "Connection", 3, "earth_theme" },
                    { new Guid("ba12389a-f4ab-45bc-9abc-da81cdba0899"), "Explore dreams, share sleep patterns, and ambient music.", "Easy", 15, true, "neptune", "Neptune", 30, "Dreams", 8, "neptune_theme" },
                    { new Guid("de123cba-45fa-42f1-aa8b-4fa8bba81234"), "Build long-term commitment, structure, and joint habits.", "Hard", 25, true, "saturn", "Saturn", 45, "Commitment", 6, "saturn_theme" },
                    { new Guid("deba0988-12ab-47bc-ba91-cdba08901abc"), "Unveil deepest vulnerabilities and craft secret memories.", "Hard", 25, true, "pluto", "Pluto", 45, "Depth", 9, "pluto_theme" },
                    { new Guid("f4bb42fd-5c02-4b2a-89a0-128a1c876b5b"), "Ignite romance, appreciation, and special mutual gestures.", "Medium", 15, true, "venus", "Venus", 30, "Romance", 2, "venus_theme" }
                });

            migrationBuilder.InsertData(
                table: "PlanetTaskDefinitions",
                columns: new[] { "Id", "Description", "IsRequired", "PlanetDefinitionId", "PointsReward", "SortOrder", "TaskKey", "Title" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "Start the day by saying hello to your partner.", true, new Guid("8a8d16eb-8bfb-4d43-85bb-41fa9bf6b9b1"), 10, 1, "mercury_task_1", "Send a morning message" },
                    { new Guid("11111111-1111-1111-1111-111111111112"), "Tell your partner one small thing you appreciate today.", true, new Guid("8a8d16eb-8bfb-4d43-85bb-41fa9bf6b9b1"), 10, 2, "mercury_task_2", "Share one thing you appreciate" },
                    { new Guid("11111111-1111-1111-1111-111111111113"), "Update your mood status.", false, new Guid("8a8d16eb-8bfb-4d43-85bb-41fa9bf6b9b1"), 5, 3, "mercury_task_3", "Check in on mood" },
                    { new Guid("22222222-2222-2222-2222-222222222221"), "Write a reason why you love your partner.", true, new Guid("f4bb42fd-5c02-4b2a-89a0-128a1c876b5b"), 15, 1, "venus_task_1", "Write a sweet reason" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Add a song to the shared playlist.", true, new Guid("f4bb42fd-5c02-4b2a-89a0-128a1c876b5b"), 10, 2, "venus_task_2", "Add a song you both love" },
                    { new Guid("22222222-2222-2222-2222-222222222223"), "Send emojis that represent your day.", false, new Guid("f4bb42fd-5c02-4b2a-89a0-128a1c876b5b"), 5, 3, "venus_task_3", "Send a cute emoji sequence" },
                    { new Guid("33333333-3333-3333-3333-333333333331"), "Talk about a favorite memory you share.", true, new Guid("a98db25f-2a31-4db4-bb1f-36fa89c4ba22"), 15, 1, "earth_task_1", "Recall a favorite memory" },
                    { new Guid("33333333-3333-3333-3333-333333333332"), "Create a bucket list item for this weekend.", true, new Guid("a98db25f-2a31-4db4-bb1f-36fa89c4ba22"), 10, 2, "earth_task_2", "Plan a small date" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "Upload a picture of the two of you.", false, new Guid("a98db25f-2a31-4db4-bb1f-36fa89c4ba22"), 15, 3, "earth_task_3", "Upload a couple photo" },
                    { new Guid("44444444-4444-4444-4444-444444444441"), "Tell your partner a dream you haven't shared before.", true, new Guid("3dfa5611-cfcb-419b-aefb-b89a421c70e2"), 20, 1, "mars_task_1", "Share a hidden dream" },
                    { new Guid("44444444-4444-4444-4444-444444444442"), "Write a digital letter reflecting on your bond.", true, new Guid("3dfa5611-cfcb-419b-aefb-b89a421c70e2"), 20, 2, "mars_task_2", "Write a longer letter" },
                    { new Guid("44444444-4444-4444-4444-444444444443"), "Give your partner a sincere compliment.", false, new Guid("3dfa5611-cfcb-419b-aefb-b89a421c70e2"), 10, 3, "mars_task_3", "Give a genuine compliment" },
                    { new Guid("55555555-5555-5555-5555-555555555551"), "Ask and answer a meaningful relationship question.", true, new Guid("5fba6a87-c10a-4dae-bcda-89710f22f7b1"), 25, 1, "jupiter_task_1", "Answer a deep question" },
                    { new Guid("55555555-5555-5555-5555-555555555552"), "Write down a goal you want to achieve together.", true, new Guid("5fba6a87-c10a-4dae-bcda-89710f22f7b1"), 20, 2, "jupiter_task_2", "Set a joint goal" },
                    { new Guid("55555555-5555-5555-5555-555555555553"), "Share how you both overcame a past challenge.", false, new Guid("5fba6a87-c10a-4dae-bcda-89710f22f7b1"), 20, 3, "jupiter_task_3", "Reflect on a challenge" },
                    { new Guid("66666666-6666-6666-6666-666666666661"), "Write a small promise or commitment to your partner.", true, new Guid("de123cba-45fa-42f1-aa8b-4fa8bba81234"), 20, 1, "saturn_task_1", "Write a promise" },
                    { new Guid("66666666-6666-6666-6666-666666666662"), "Mark a calendar date for a future milestone.", true, new Guid("de123cba-45fa-42f1-aa8b-4fa8bba81234"), 15, 2, "saturn_task_2", "Create a future memory date" },
                    { new Guid("66666666-6666-6666-6666-666666666663"), "Thank your partner for their support in tough times.", false, new Guid("de123cba-45fa-42f1-aa8b-4fa8bba81234"), 15, 3, "saturn_task_3", "Say thank you for support" },
                    { new Guid("77777777-7777-7777-7777-777777777771"), "Propose a new activity to try together.", true, new Guid("47ba12ef-bc11-47fa-8ab2-da781cba9088"), 15, 1, "uranus_task_1", "Suggest a new hobby" },
                    { new Guid("77777777-7777-7777-7777-777777777772"), "Tell your partner something that made you laugh.", true, new Guid("47ba12ef-bc11-47fa-8ab2-da781cba9088"), 10, 2, "uranus_task_2", "Share a funny story" },
                    { new Guid("77777777-7777-7777-7777-777777777773"), "Describe your dream vacation destination.", false, new Guid("47ba12ef-bc11-47fa-8ab2-da781cba9088"), 15, 3, "uranus_task_3", "Plan an imaginary trip" },
                    { new Guid("88888888-8888-8888-8888-888888888881"), "Describe a recent dream you had while sleeping.", true, new Guid("ba12389a-f4ab-45bc-9abc-da81cdba0899"), 10, 1, "neptune_task_1", "Share a night dream" },
                    { new Guid("88888888-8888-8888-8888-888888888882"), "Describe a fun fictional scenario for both of you.", true, new Guid("ba12389a-f4ab-45bc-9abc-da81cdba0899"), 15, 2, "neptune_task_2", "Write a fantasy scenario" },
                    { new Guid("88888888-8888-8888-8888-888888888883"), "Recommend a relaxing track to listen to.", false, new Guid("ba12389a-f4ab-45bc-9abc-da81cdba0899"), 10, 3, "neptune_task_3", "Listen to ambient music" },
                    { new Guid("99999999-9999-9999-9999-999999999991"), "Share a small vulnerability or fear with your partner.", true, new Guid("deba0988-12ab-47bc-ba91-cdba08901abc"), 25, 1, "pluto_task_1", "Discuss a vulnerability" },
                    { new Guid("99999999-9999-9999-9999-999999999992"), "Thank your partner for their presence in your life.", true, new Guid("deba0988-12ab-47bc-ba91-cdba08901abc"), 20, 2, "pluto_task_2", "Express a deep gratitude" },
                    { new Guid("99999999-9999-9999-9999-999999999993"), "Come up with a private word or code just for you two.", false, new Guid("deba0988-12ab-47bc-ba91-cdba08901abc"), 10, 3, "pluto_task_3", "Create a secret word" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "Tell your partner an interesting fact you learned today.", true, new Guid("12ba0911-34cd-4ef1-89ab-da710cba0999"), 10, 1, "kepler_task_1", "Share a new fact" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab"), "Ask a detailed question about their day.", true, new Guid("12ba0911-34cd-4ef1-89ab-da710cba0999"), 10, 2, "kepler_task_2", "Ask about their day" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac"), "Send a message checking in on how they are feeling right now.", false, new Guid("12ba0911-34cd-4ef1-89ab-da710cba0999"), 10, 3, "kepler_task_3", "Send a custom check-in" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountVerificationCodes_Destination",
                table: "AccountVerificationCodes",
                column: "Destination");

            migrationBuilder.CreateIndex(
                name: "IX_AccountVerificationCodes_ExpiresAt",
                table: "AccountVerificationCodes",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_AccountVerificationCodes_UserId",
                table: "AccountVerificationCodes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AppUsers_CreatedAt",
                table: "AppUsers",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AppUsers_Email",
                table: "AppUsers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppUsers_Username",
                table: "AppUsers",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeCompletions_ChallengeId",
                table: "ChallengeCompletions",
                column: "ChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeCompletions_ChallengeId_UserId",
                table: "ChallengeCompletions",
                columns: new[] { "ChallengeId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeCompletions_CoupleId",
                table: "ChallengeCompletions",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeCompletions_CreatedAt",
                table: "ChallengeCompletions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeCompletions_UserId",
                table: "ChallengeCompletions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_CoupleId",
                table: "Challenges",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_CreatedAt",
                table: "Challenges",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_CreatedByUserId",
                table: "Challenges",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_CoupleId",
                table: "ChatMessages",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_CreatedAt",
                table: "ChatMessages",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_UserId",
                table: "ChatMessages",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckIns_CoupleId",
                table: "CheckIns",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckIns_CreatedAt",
                table: "CheckIns",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CheckIns_UserId",
                table: "CheckIns",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CoupleGoalMilestones_GoalId",
                table: "CoupleGoalMilestones",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_CoupleGoals_CoupleId",
                table: "CoupleGoals",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_CoupleGoals_CreatedByUserId",
                table: "CoupleGoals",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CoupleMembers_CoupleId",
                table: "CoupleMembers",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_CoupleMembers_CoupleId_UserId",
                table: "CoupleMembers",
                columns: new[] { "CoupleId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CoupleMembers_CreatedAt",
                table: "CoupleMembers",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CoupleMembers_UserId",
                table: "CoupleMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Couples_CreatedAt",
                table: "Couples",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Couples_CreatedByUserId",
                table: "Couples",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CoupleSettings_CoupleId",
                table: "CoupleSettings",
                column: "CoupleId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CoupleSettings_CreatedAt",
                table: "CoupleSettings",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CoupleSubscriptions_CoupleId",
                table: "CoupleSubscriptions",
                column: "CoupleId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CoupleSubscriptions_CreatedAt",
                table: "CoupleSubscriptions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CustomSectionItems_CustomSectionId",
                table: "CustomSectionItems",
                column: "CustomSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomSections_CoupleId",
                table: "CustomSections",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomSections_CreatedByUserId",
                table: "CustomSections",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyCouplePlanets_CoupleId_Date",
                table: "DailyCouplePlanets",
                columns: new[] { "CoupleId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DailyCouplePlanets_PlanetDefinitionId",
                table: "DailyCouplePlanets",
                column: "PlanetDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyPlanetTaskCompletions_DailyCouplePlanetId_UserId_TaskKey",
                table: "DailyPlanetTaskCompletions",
                columns: new[] { "DailyCouplePlanetId", "UserId", "TaskKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DailyPlanetTaskCompletions_UserId",
                table: "DailyPlanetTaskCompletions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyQuestionAnswers_CoupleId",
                table: "DailyQuestionAnswers",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyQuestionAnswers_CoupleId_QuestionId_UserId",
                table: "DailyQuestionAnswers",
                columns: new[] { "CoupleId", "QuestionId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DailyQuestionAnswers_QuestionId",
                table: "DailyQuestionAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyQuestionAnswers_UserId",
                table: "DailyQuestionAnswers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyQuestions_CoupleId",
                table: "DailyQuestions",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyQuestions_CreatedAt",
                table: "DailyQuestions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackEntries_CreatedAt",
                table: "FeedbackEntries",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackEntries_UserId",
                table: "FeedbackEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FuturePlans_CoupleId",
                table: "FuturePlans",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_FuturePlans_CreatedAt",
                table: "FuturePlans",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_FuturePlans_CreatedByUserId",
                table: "FuturePlans",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ImportantDates_CoupleId",
                table: "ImportantDates",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_ImportantDates_CreatedByUserId",
                table: "ImportantDates",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Letters_CoupleId",
                table: "Letters",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_Letters_CreatedAt",
                table: "Letters",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Letters_CreatedByUserId",
                table: "Letters",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Memories_CoupleId",
                table: "Memories",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_Memories_CreatedAt",
                table: "Memories",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Memories_CreatedByUserId",
                table: "Memories",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MoodEntries_CoupleId",
                table: "MoodEntries",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_MoodEntries_CoupleId_UserId_EntryDate",
                table: "MoodEntries",
                columns: new[] { "CoupleId", "UserId", "EntryDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MoodEntries_CreatedAt",
                table: "MoodEntries",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_MoodEntries_RespondedByUserId",
                table: "MoodEntries",
                column: "RespondedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MoodEntries_UserId",
                table: "MoodEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingQuestions_Key",
                table: "OnboardingQuestions",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingQuestions_SortOrder",
                table: "OnboardingQuestions",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_PairingCodes_Code",
                table: "PairingCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PairingCodes_CoupleId",
                table: "PairingCodes",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_PairingCodes_CreatedAt",
                table: "PairingCodes",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PairingCodes_CreatedByUserId",
                table: "PairingCodes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PairingCodes_UsedByUserId",
                table: "PairingCodes",
                column: "UsedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanetDefinitions_Key",
                table: "PlanetDefinitions",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlanetTaskDefinitions_PlanetDefinitionId_TaskKey",
                table: "PlanetTaskDefinitions",
                columns: new[] { "PlanetDefinitionId", "TaskKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReasonReactions_CoupleId",
                table: "ReasonReactions",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_ReasonReactions_CreatedAt",
                table: "ReasonReactions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ReasonReactions_ReasonId",
                table: "ReasonReactions",
                column: "ReasonId");

            migrationBuilder.CreateIndex(
                name: "IX_ReasonReactions_ReasonId_UserId_ReactionType",
                table: "ReasonReactions",
                columns: new[] { "ReasonId", "UserId", "ReactionType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReasonReactions_UserId",
                table: "ReasonReactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reasons_CoupleId",
                table: "Reasons",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_Reasons_CreatedAt",
                table: "Reasons",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Reasons_CreatedByUserId",
                table: "Reasons",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RelationshipDailyTasks_CompletedByUserId",
                table: "RelationshipDailyTasks",
                column: "CompletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RelationshipDailyTasks_CoupleId_Date_TaskKey",
                table: "RelationshipDailyTasks",
                columns: new[] { "CoupleId", "Date", "TaskKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RelationshipPointLedgers_CoupleId",
                table: "RelationshipPointLedgers",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_RelationshipPointLedgers_CreatedAt",
                table: "RelationshipPointLedgers",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_RelationshipPointLedgers_UserId",
                table: "RelationshipPointLedgers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Songs_CoupleId",
                table: "Songs",
                column: "CoupleId");

            migrationBuilder.CreateIndex(
                name: "IX_Songs_CreatedAt",
                table: "Songs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Songs_CreatedByUserId",
                table: "Songs",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Songs_FavoritedByUserId",
                table: "Songs",
                column: "FavoritedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnboardingAnswers_UserId",
                table: "UserOnboardingAnswers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnboardingAnswers_UserId_QuestionKey",
                table: "UserOnboardingAnswers",
                columns: new[] { "UserId", "QuestionKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_UserId",
                table: "UserProfiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider != "Microsoft.EntityFrameworkCore.SqlServer")
            {
                return;
            }

            migrationBuilder.DropTable(
                name: "AccountVerificationCodes");

            migrationBuilder.DropTable(
                name: "ChallengeCompletions");

            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "CheckIns");

            migrationBuilder.DropTable(
                name: "CoupleGoalMilestones");

            migrationBuilder.DropTable(
                name: "CoupleMembers");

            migrationBuilder.DropTable(
                name: "CoupleSettings");

            migrationBuilder.DropTable(
                name: "CoupleSubscriptions");

            migrationBuilder.DropTable(
                name: "CustomSectionItems");

            migrationBuilder.DropTable(
                name: "DailyPlanetTaskCompletions");

            migrationBuilder.DropTable(
                name: "DailyQuestionAnswers");

            migrationBuilder.DropTable(
                name: "FeedbackEntries");

            migrationBuilder.DropTable(
                name: "FuturePlans");

            migrationBuilder.DropTable(
                name: "ImportantDates");

            migrationBuilder.DropTable(
                name: "Letters");

            migrationBuilder.DropTable(
                name: "Memories");

            migrationBuilder.DropTable(
                name: "MoodEntries");

            migrationBuilder.DropTable(
                name: "OnboardingQuestions");

            migrationBuilder.DropTable(
                name: "PairingCodes");

            migrationBuilder.DropTable(
                name: "PlanetTaskDefinitions");

            migrationBuilder.DropTable(
                name: "ReasonReactions");

            migrationBuilder.DropTable(
                name: "RelationshipDailyTasks");

            migrationBuilder.DropTable(
                name: "RelationshipPointLedgers");

            migrationBuilder.DropTable(
                name: "Songs");

            migrationBuilder.DropTable(
                name: "UserOnboardingAnswers");

            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.DropTable(
                name: "Challenges");

            migrationBuilder.DropTable(
                name: "CoupleGoals");

            migrationBuilder.DropTable(
                name: "CustomSections");

            migrationBuilder.DropTable(
                name: "DailyCouplePlanets");

            migrationBuilder.DropTable(
                name: "DailyQuestions");

            migrationBuilder.DropTable(
                name: "Reasons");

            migrationBuilder.DropTable(
                name: "PlanetDefinitions");

            migrationBuilder.DropTable(
                name: "Couples");

            migrationBuilder.DropTable(
                name: "AppUsers");
        }
    }
}
