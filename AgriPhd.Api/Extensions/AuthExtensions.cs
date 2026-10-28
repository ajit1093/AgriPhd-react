using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Implementations;
using AgriPhd.Api.Repositories.Interfaces;
using AgriPhd.Api.Services.Implementations;
using AgriPhd.Api.Services.Interfaces;
using AgriPhd.Api.Middleware;

namespace AgriPhd.Api.Extensions;

public static class AuthExtensions
{
    /// <summary>
    /// Registers auth services, JWT bearer authentication, and related helpers.
    /// </summary>
    public static IServiceCollection AddAuthServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>()
            ?? throw new InvalidOperationException("JwtSettings section is missing from configuration.");

        // Register JwtHelper as singleton (no state, only config)
        services.AddSingleton(new JwtHelper(
            jwtSettings.SecretKey,
            jwtSettings.Issuer,
            jwtSettings.Audience,
            jwtSettings.AccessTokenExpiryMinutes));

        // JWT Bearer authentication — validates the httpOnly cookie on every request
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                ValidateIssuer   = true,
                ValidIssuer      = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience    = jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew        = TimeSpan.Zero,
            };

            // Read JWT from httpOnly cookie instead of Authorization header
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = ctx =>
                {
                    var token = ctx.Request.Cookies["agri-jwt"];
                    if (!string.IsNullOrEmpty(token))
                        ctx.Token = token;
                    return Task.CompletedTask;
                }
            };
        });

        // Repository + Service
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IAuthService, AuthService>();

        // Session validation filter (P1-AUTH-06) — registered as scoped filter
        services.AddScoped<SessionValidationFilter>();

        return services;
    }
}
