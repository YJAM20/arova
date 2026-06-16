using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurLittleUniverse.Migrations
{
    /// <inheritdoc />
    public partial class AddRomanticContentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UnlockDate",
                table: "Reasons",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrivateNote",
                table: "Memories",
                type: "TEXT",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "Letters",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PasscodeHash",
                table: "Letters",
                type: "TEXT",
                maxLength: 512,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnlockDate",
                table: "Reasons");

            migrationBuilder.DropColumn(
                name: "PrivateNote",
                table: "Memories");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "Letters");

            migrationBuilder.DropColumn(
                name: "PasscodeHash",
                table: "Letters");
        }
    }
}
