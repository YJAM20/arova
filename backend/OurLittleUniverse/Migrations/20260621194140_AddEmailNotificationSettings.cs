using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurLittleUniverse.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailNotificationSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DailyDigestEnabled",
                table: "CoupleSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EmailNotificationsEnabled",
                table: "CoupleSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PartnerActivityEmailsEnabled",
                table: "CoupleSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyDigestEnabled",
                table: "CoupleSettings");

            migrationBuilder.DropColumn(
                name: "EmailNotificationsEnabled",
                table: "CoupleSettings");

            migrationBuilder.DropColumn(
                name: "PartnerActivityEmailsEnabled",
                table: "CoupleSettings");
        }
    }
}
