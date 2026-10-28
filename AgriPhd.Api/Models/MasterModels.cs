namespace AgriPhd.Api.Models;

/// <summary>
/// Generic dropdown item — ported from legacy DropdownEntity.
/// Used for all master table lists (gender, category, state, district, etc.)
/// </summary>
public class DropdownItem
{
    public string Value { get; set; } = string.Empty;
    public string Text  { get; set; } = string.Empty;
    /// <summary>Optional grouping — maps to legacy DropdownEntity.Group (ParentFieldValue).</summary>
    public string? Group { get; set; }
}

/// <summary>
/// Salutation → gender mapping. Used on Personal Details page to filter
/// salutations by the candidate's gender (Mr./Mrs./Dr. etc).
/// Ported from legacy SaluationMap entity.
/// </summary>
public class SaluationMapItem
{
    public int    SaluationId    { get; set; }
    public int    SaluationMapId { get; set; }
    public string GenderCode     { get; set; } = string.Empty;
}

/// <summary>
/// A single menu item returned by Menu_GetMenu.
/// </summary>
public class MenuItem
{
    public int     MenuId       { get; set; }
    public int?    ParentMenuId { get; set; }
    public string  MenuName     { get; set; } = string.Empty;
    public string  MenuUrl      { get; set; } = string.Empty;
    public string  Target       { get; set; } = "_self";
    public bool    IsNew        { get; set; }
    public int     SeqNo        { get; set; }
    /// <summary>Child items — populated in the service layer after SP call.</summary>
    public List<MenuItem> Children { get; set; } = new();
}
