namespace LoveUniverse.Api.Common;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }

    public string Message { get; init; } = string.Empty;

    public T? Data { get; init; }

    public IReadOnlyList<string> Errors { get; init; } = [];

    public static ApiResponse<T> CreateSuccess(T data, string message = "Request successful.")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            Errors = []
        };
    }

    public static ApiResponse<T> CreateFailure(string message, IReadOnlyList<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default,
            Errors = errors ?? []
        };
    }
}
