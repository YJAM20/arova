namespace LoveUniverse.Api.Services;

public enum ContentServiceStatus
{
    Success,
    BadRequest,
    Unauthorized,
    Forbidden,
    NotFound
}

public sealed record ContentServiceResult<T>(
    ContentServiceStatus Status,
    T? Value,
    string? ErrorMessage)
{
    public bool Succeeded => Status == ContentServiceStatus.Success;

    public static ContentServiceResult<T> Success(T value)
    {
        return new ContentServiceResult<T>(ContentServiceStatus.Success, value, null);
    }

    public static ContentServiceResult<T> Failure(ContentServiceStatus status, string errorMessage)
    {
        return new ContentServiceResult<T>(status, default, errorMessage);
    }
}
