using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace OurLittleUniverse.Migrations
{
    /// <inheritdoc />
    public partial class ArovaProductExpansionV1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSystemAdmin",
                table: "AppUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "CustomSections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CoupleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Icon = table.Column<string>(type: "TEXT", maxLength: 80, nullable: true),
                    VisibilityLevel = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
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
                name: "PlanetDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Key = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    ThemeKey = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Purpose = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Difficulty = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    EstimatedMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    PointsReward = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanetDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RelationshipDailyTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CoupleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TaskKey = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    PointsReward = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    IsCompleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    CompletedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
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
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CoupleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ActionType = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    Reason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    SourceType = table.Column<string>(type: "TEXT", maxLength: 80, nullable: true),
                    SourceId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
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
                name: "CustomSectionItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CustomSectionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Text = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    IsCompleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
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
                name: "DailyCouplePlanets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CoupleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PlanetDefinitionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
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
                name: "PlanetTaskDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PlanetDefinitionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TaskKey = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    PointsReward = table.Column<int>(type: "INTEGER", nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false)
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
                name: "DailyPlanetTaskCompletions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DailyCouplePlanetId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TaskKey = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    PointsAwarded = table.Column<int>(type: "INTEGER", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomSectionItems");

            migrationBuilder.DropTable(
                name: "DailyPlanetTaskCompletions");

            migrationBuilder.DropTable(
                name: "PlanetTaskDefinitions");

            migrationBuilder.DropTable(
                name: "RelationshipDailyTasks");

            migrationBuilder.DropTable(
                name: "RelationshipPointLedgers");

            migrationBuilder.DropTable(
                name: "CustomSections");

            migrationBuilder.DropTable(
                name: "DailyCouplePlanets");

            migrationBuilder.DropTable(
                name: "PlanetDefinitions");

            migrationBuilder.DropColumn(
                name: "IsSystemAdmin",
                table: "AppUsers");
        }
    }
}
