using LoveUniverse.Api.DTOs.Auth;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPasswordStrengthService _passwordStrengthService;
    private readonly IAccountVerificationService _verificationService;
    private readonly IEnumerable<IExternalAuthVerifier> _externalAuthVerifiers;

    public AuthController(
        IAuthService authService,
        ICurrentUserService currentUserService,
        IPasswordStrengthService passwordStrengthService,
        IAccountVerificationService verificationService,
        IEnumerable<IExternalAuthVerifier> externalAuthVerifiers)
    {
        _authService = authService;
        _currentUserService = currentUserService;
        _passwordStrengthService = passwordStrengthService;
        _verificationService = verificationService;
        _externalAuthVerifiers = externalAuthVerifiers;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Response);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = result.ErrorMessage });
        }

        return Ok(result.Response);
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserResponse>> Me(CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId is not { } userId)
        {
            return Unauthorized(new { message = "Please sign in to continue." });
        }

        var user = await _authService.GetCurrentUserAsync(userId, cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "Please sign in to continue." });
        }

        return Ok(user);
    }

    [HttpPost("password-strength")]
    [ProducesResponseType(typeof(PasswordStrengthResponse), StatusCodes.Status200OK)]
    public ActionResult<PasswordStrengthResponse> PasswordStrength(PasswordStrengthRequest request)
    {
        return Ok(_passwordStrengthService.CheckStrength(request.Password));
    }

    [HttpPost("request-verification-code")]
    [ProducesResponseType(typeof(VerificationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VerificationResponse>> RequestVerificationCode(
        VerificationCodeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _verificationService.RequestCodeAsync(request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("verify-code")]
    [ProducesResponseType(typeof(VerificationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VerificationResponse>> VerifyCode(
        VerifyCodeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _verificationService.VerifyCodeAsync(request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("external-login")]
    [ProducesResponseType(typeof(ExternalLoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ExternalLoginResponse>> ExternalLogin(
        ExternalLoginRequest request,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<ExternalAuthProvider>(request.Provider, ignoreCase: true, out var provider))
        {
            return BadRequest(new { message = "External login provider is invalid." });
        }

        var verifier = _externalAuthVerifiers.FirstOrDefault(candidate => candidate.Provider == provider);
        if (verifier is null)
        {
            return Ok(new ExternalLoginResponse
            {
                Succeeded = false,
                Message = "External login provider is not configured in this environment."
            });
        }

        var result = await verifier.VerifyAsync(request.IdToken, cancellationToken);
        return Ok(new ExternalLoginResponse
        {
            Succeeded = result.Succeeded,
            Message = result.Message
        });
    }

    private ActionResult ToActionResult<T>(
        ContentServiceResult<T> result,
        Func<T, ActionResult> onSuccess)
    {
        if (result.Status == ContentServiceStatus.Success && result.Value is not null)
        {
            return onSuccess(result.Value);
        }

        var error = new { message = result.ErrorMessage ?? "The request could not be completed." };
        return result.Status switch
        {
            ContentServiceStatus.BadRequest => BadRequest(error),
            ContentServiceStatus.Unauthorized => Unauthorized(error),
            ContentServiceStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, error),
            ContentServiceStatus.NotFound => NotFound(error),
            _ => BadRequest(error)
        };
    }
}
