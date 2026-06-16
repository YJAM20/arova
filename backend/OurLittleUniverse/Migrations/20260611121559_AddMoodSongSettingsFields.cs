using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurLittleUniverse.Migrations
{
    /// <inheritdoc />
    public partial class AddMoodSongSettingsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Attribution",
                table: "Songs",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AudioUrl",
                table: "Songs",
                type: "TEXT",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverUrl",
                table: "Songs",
                type: "TEXT",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FavoritedAt",
                table: "Songs",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FavoritedByUserId",
                table: "Songs",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFavorite",
                table: "Songs",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "License",
                table: "Songs",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RespondedAt",
                table: "MoodEntries",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RespondedByUserId",
                table: "MoodEntries",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Response",
                table: "MoodEntries",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActiveTheme",
                table: "CoupleSettings",
                type: "TEXT",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "AnimationsEnabled",
                table: "CoupleSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LanguageMode",
                table: "CoupleSettings",
                type: "TEXT",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "MusicEnabled",
                table: "CoupleSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Songs_FavoritedByUserId",
                table: "Songs",
                column: "FavoritedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MoodEntries_RespondedByUserId",
                table: "MoodEntries",
                column: "RespondedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_MoodEntries_AppUsers_RespondedByUserId",
                table: "MoodEntries",
                column: "RespondedByUserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Songs_AppUsers_FavoritedByUserId",
                table: "Songs",
                column: "FavoritedByUserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MoodEntries_AppUsers_RespondedByUserId",
                table: "MoodEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_Songs_AppUsers_FavoritedByUserId",
                table: "Songs");

            migrationBuilder.DropIndex(
                name: "IX_Songs_FavoritedByUserId",
                table: "Songs");

            migrationBuilder.DropIndex(
                name: "IX_MoodEntries_RespondedByUserId",
                table: "MoodEntries");

            migrationBuilder.DropColumn(
                name: "Attribution",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "AudioUrl",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "CoverUrl",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "FavoritedAt",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "FavoritedByUserId",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "IsFavorite",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "License",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "RespondedAt",
                table: "MoodEntries");

            migrationBuilder.DropColumn(
                name: "RespondedByUserId",
                table: "MoodEntries");

            migrationBuilder.DropColumn(
                name: "Response",
                table: "MoodEntries");

            migrationBuilder.DropColumn(
                name: "ActiveTheme",
                table: "CoupleSettings");

            migrationBuilder.DropColumn(
                name: "AnimationsEnabled",
                table: "CoupleSettings");

            migrationBuilder.DropColumn(
                name: "LanguageMode",
                table: "CoupleSettings");

            migrationBuilder.DropColumn(
                name: "MusicEnabled",
                table: "CoupleSettings");
        }
    }
}
