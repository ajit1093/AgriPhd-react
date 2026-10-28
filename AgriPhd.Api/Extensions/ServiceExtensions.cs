using AgriPhd.Api.Helpers;
using AgriPhd.Api.Repositories.Implementations;
using AgriPhd.Api.Repositories.Interfaces;
using AgriPhd.Api.Services.Implementations;
using AgriPhd.Api.Services.Interfaces;

namespace AgriPhd.Api.Extensions;

public static class ServiceExtensions
{
    /// <summary>Registers all repositories and services beyond auth.</summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Repositories
        services.AddScoped<IMasterRepository,       MasterRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<ICollegeRepository,      CollegeRepository>();
        services.AddScoped<IRegistrationRepository, RegistrationRepository>();
        services.AddScoped<IDashboardRepository,       DashboardRepository>();
        services.AddScoped<IApplicationFormRepository, ApplicationFormRepository>();
        services.AddScoped<IFeeRepository,             FeeRepository>();
        services.AddScoped<IEVerificationRepository,   EVerificationRepository>();
        services.AddScoped<IAdmissionRepository,       AdmissionRepository>();

        // Admin management
        services.AddScoped<IAdminRepository,           AdminRepository>();
        services.AddScoped<IMenuAdminRepository,       MenuAdminRepository>();

        // Services
        services.AddScoped<IRegistrationService, RegistrationService>();
        services.AddHttpClient<IAdmissionAiService, AdmissionAiService>();

        // Helpers (singleton — stateless, config-driven)
        services.AddSingleton<BlobStorageHelper>();

        return services;
    }
}
