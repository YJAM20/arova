using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace OurLittleUniverse.Migrations
{
    /// <inheritdoc />
    public partial class ArovaProductFoundationV1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentMimeType",
                table: "ChatMessages",
                type: "TEXT",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "AttachmentSizeBytes",
                table: "ChatMessages",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentUrl",
                table: "ChatMessages",
                type: "TEXT",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EncryptedPayload",
                table: "ChatMessages",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EncryptionMode",
                table: "ChatMessages",
                type: "TEXT",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "KeyId",
                table: "ChatMessages",
                type: "TEXT",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MessageType",
                table: "ChatMessages",
                type: "TEXT",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Nonce",
                table: "ChatMessages",
                type: "TEXT",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AgeRange",
                table: "AppUsers",
                type: "TEXT",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "AppUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailVerifiedAt",
                table: "AppUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsVerified",
                table: "AppUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MatureContentEnabled",
                table: "AppUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "AppUsers",
                type: "TEXT",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PhoneVerifiedAt",
                table: "AppUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AccountVerificationCodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Channel = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    Destination = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    CodeHash = table.Column<string>(type: "TEXT", maxLength: 512, nullable: false),
                    Purpose = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Attempts = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
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
                name: "CoupleSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CoupleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PlanType = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    IsGifted = table.Column<bool>(type: "INTEGER", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
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
                name: "FeedbackEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Rating = table.Column<int>(type: "INTEGER", nullable: true),
                    Message = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    Context = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
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
                name: "OnboardingQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Key = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    TextEn = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    TextAr = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    TextEs = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsQuickStart = table.Column<bool>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnboardingQuestions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserOnboardingAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuestionKey = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    AnswerValue = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
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
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AgeRange = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true),
                    RelationshipStatus = table.Column<string>(type: "TEXT", maxLength: 80, nullable: true),
                    RelationshipType = table.Column<string>(type: "TEXT", maxLength: 80, nullable: true),
                    PersonalityStyle = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                    LoveLanguage = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                    PreferredTheme = table.Column<string>(type: "TEXT", maxLength: 80, nullable: true),
                    PreferredLanguage = table.Column<string>(type: "TEXT", maxLength: 8, nullable: true),
                    AvatarUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                    Bio = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    MatureContentEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
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
                name: "IX_CoupleSubscriptions_CoupleId",
                table: "CoupleSubscriptions",
                column: "CoupleId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CoupleSubscriptions_CreatedAt",
                table: "CoupleSubscriptions",
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
                name: "IX_OnboardingQuestions_Key",
                table: "OnboardingQuestions",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingQuestions_SortOrder",
                table: "OnboardingQuestions",
                column: "SortOrder");

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
            migrationBuilder.DropTable(
                name: "AccountVerificationCodes");

            migrationBuilder.DropTable(
                name: "CoupleSubscriptions");

            migrationBuilder.DropTable(
                name: "FeedbackEntries");

            migrationBuilder.DropTable(
                name: "OnboardingQuestions");

            migrationBuilder.DropTable(
                name: "UserOnboardingAnswers");

            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "AttachmentMimeType",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "AttachmentSizeBytes",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "AttachmentUrl",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "EncryptedPayload",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "EncryptionMode",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "KeyId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "MessageType",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "Nonce",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "AgeRange",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "EmailVerifiedAt",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "IsVerified",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "MatureContentEnabled",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "PhoneVerifiedAt",
                table: "AppUsers");
        }
    }
}
