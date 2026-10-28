using System.Data;
using System.Text;
using System.Xml;
using Dapper;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Menu administration repository — ManageMenus.aspx + ManageLinks.aspx equivalents.
/// </summary>
public class MenuAdminRepository : IMenuAdminRepository
{
    private readonly IDbConnection _db;
    public MenuAdminRepository(IDbConnection db) => _db = db;

    public async Task<IEnumerable<dynamic>> GetGroupsListAsync(short regionId, int userTypeId)
    {
        var p = new DynamicParameters();
        p.Add("@RegionID",  regionId);
        p.Add("@UserTypeID", userTypeId);
        return await _db.QueryAsync<dynamic>("Menu_GetGroupsList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<dynamic>> GetMenusListAsync(short regionId, int userTypeId, int parentMenuId)
    {
        var p = new DynamicParameters();
        p.Add("@RegionID",     regionId);
        p.Add("@UserTypeID",   userTypeId);
        p.Add("@ParentMenuID", parentMenuId);
        return await _db.QueryAsync<dynamic>("Menu_GetMenusList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<string> SaveMenusActiveStatusAsync(string menusXml)
    {
        var p = new DynamicParameters();
        p.Add("@MenusXML", menusXml);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Menu_SaveMenusActiveStatus", p, commandType: CommandType.StoredProcedure);
        return Convert.ToString(result?.Result ?? result?.ReturnValue ?? "Y") ?? "Y";
    }

    public async Task<IEnumerable<dynamic>> GetLinksListAsync(string directory)
    {
        var p = new DynamicParameters();
        p.Add("@Directory", directory);
        return await _db.QueryAsync<dynamic>("Menu_GetLinksList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<string> SaveLinksActiveStatusAsync(string linksXml)
    {
        var p = new DynamicParameters();
        p.Add("@LinksXML", linksXml);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Menu_SaveLinksActiveStatus", p, commandType: CommandType.StoredProcedure);
        return Convert.ToString(result?.Result ?? result?.ReturnValue ?? "Y") ?? "Y";
    }

    /// <summary>
    /// Available module directories — same list as legacy (from DB distinct Directory values).
    /// </summary>
    public IEnumerable<string> GetAvailableDirectories() => new[]
    {
        "Admin", "Administration", "Admission", "Candidate", "CAPAdmission",
        "College", "EVerification", "Fee", "Groups", "GuidanceCenter",
        "Menu", "OptionForm", "Public", "Reports", "University", "ExtranalLinks"
    };

    // ── XML builders matching legacy List<MenuEntity> / List<LinkEntity> serialization ──

    public static string BuildMenusXml(List<MenuItemActiveStatus> items, string userLoginId, string ipAddress)
    {
        var sb = new StringBuilder("<ArrayOfMenuEntity>");
        foreach (var i in items)
        {
            sb.Append("<MenuEntity>");
            sb.Append($"<MenuID>{i.MenuId}</MenuID>");
            sb.Append($"<IsActive>{(i.IsActive ? "true" : "false")}</IsActive>");
            sb.Append($"<SeqNo>{i.SeqNo}</SeqNo>");
            sb.Append($"<UserLoginID>{XmlEscape(userLoginId)}</UserLoginID>");
            sb.Append($"<IPAddress>{XmlEscape(ipAddress)}</IPAddress>");
            sb.Append("</MenuEntity>");
        }
        sb.Append("</ArrayOfMenuEntity>");
        return sb.ToString();
    }

    public static string BuildLinksXml(List<LinkActiveStatus> items, string userLoginId, string ipAddress)
    {
        var sb = new StringBuilder("<ArrayOfLinkEntity>");
        foreach (var i in items)
        {
            sb.Append("<LinkEntity>");
            sb.Append($"<LinkID>{i.LinkId}</LinkID>");
            sb.Append($"<IsActive>{(i.IsActive ? "true" : "false")}</IsActive>");
            sb.Append($"<UserLoginID>{XmlEscape(userLoginId)}</UserLoginID>");
            sb.Append($"<IPAddress>{XmlEscape(ipAddress)}</IPAddress>");
            sb.Append("</LinkEntity>");
        }
        sb.Append("</ArrayOfLinkEntity>");
        return sb.ToString();
    }

    private static string XmlEscape(string s) =>
        System.Security.SecurityElement.Escape(s) ?? s;
}
