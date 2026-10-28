CREATE PROCEDURE [dbo].[Administration_GetPhaseDetails]
    @PhaseID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        PhaseID, 
        Phase, 
        AllotmentDisplayStartDate, 
        AdmissionStartDate, 
        CandidateAdmissionLastDate, 
        CollegeAdmissionLastDate, 
        SystemAdmissionLastDate, 
        IsCurrentPhase, 
        IsActive, 
        ModifiedDateTime, 
        ModifiedBy, 
        ModifiedByIPAddress,

        -- Formatted Dates for TextBox binding (dd-MM-yyyy HH:mm)
        CONVERT(VARCHAR(10), AllotmentDisplayStartDate, 105) + ' ' + CONVERT(VARCHAR(5), AllotmentDisplayStartDate, 108) AS AllotmentDisplayStartDateF,
        CONVERT(VARCHAR(10), AdmissionStartDate, 105) + ' ' + CONVERT(VARCHAR(5), AdmissionStartDate, 108) AS AdmissionStartDateF,
        CONVERT(VARCHAR(10), CandidateAdmissionLastDate, 105) + ' ' + CONVERT(VARCHAR(5), CandidateAdmissionLastDate, 108) AS CandidateAdmissionLastDateF,
        CONVERT(VARCHAR(10), CollegeAdmissionLastDate, 105) + ' ' + CONVERT(VARCHAR(5), CollegeAdmissionLastDate, 108) AS CollegeAdmissionLastDateF,
        CONVERT(VARCHAR(10), SystemAdmissionLastDate, 105) + ' ' + CONVERT(VARCHAR(5), SystemAdmissionLastDate, 108) AS SystemAdmissionLastDateF

    FROM 
        [dbo].[Master_Phase] (NOLOCK)
    WHERE 
        PhaseID = @PhaseID
END
