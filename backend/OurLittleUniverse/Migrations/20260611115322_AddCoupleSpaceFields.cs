using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurLittleUniverse.Migrations
{
    /// <inheritdoc />
    public partial class AddCoupleSpaceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Couples",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Couples",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Couples_CreatedByUserId",
                table: "Couples",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Couples_AppUsers_CreatedByUserId",
                table: "Couples",
                column: "CreatedByUserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Couples_AppUsers_CreatedByUserId",
                table: "Couples");

            migrationBuilder.DropIndex(
                name: "IX_Couples_CreatedByUserId",
                table: "Couples");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Couples");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Couples");
        }
    }
}
