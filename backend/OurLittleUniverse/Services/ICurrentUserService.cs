namespace LoveUniverse.Api.Services;

public interface ICurrentUserService
{
    Guid? UserId { get; }
}
