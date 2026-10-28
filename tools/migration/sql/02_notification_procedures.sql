-- 02_notification_procedures.sql

DROP FUNCTION IF EXISTS base_isnewcandidateregistrationstarted() CASCADE;
DROP FUNCTION IF EXISTS administration_getnotificationlistfordisplay(SMALLINT, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS administration_getactivitystatuslist(SMALLINT) CASCADE;

-- 1. Base_IsNewCandidateRegistrationStarted
CREATE OR REPLACE FUNCTION base_isnewcandidateregistrationstarted()
RETURNS INT AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM master_activitystatus 
        WHERE activityname = 'NewCandidateRegistration' 
          AND activitystartdatetime IS NOT NULL 
          AND activityenddatetime IS NOT NULL 
          AND fngetistdatetime() BETWEEN activitystartdatetime AND activityenddatetime
    ) THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Administration_GetNotificationListForDisplay
CREATE OR REPLACE FUNCTION administration_getnotificationlistfordisplay(
    p_regionid SMALLINT,
    p_language VARCHAR(50) DEFAULT ''
)
RETURNS TABLE (
    srno BIGINT,
    notificationid BIGINT,
    notificationcategoryid INT,
    notificationcategory VARCHAR(100),
    notificationtitle VARCHAR(500),
    displaystartdatetime TIMESTAMP,
    displayenddatetime TIMESTAMP,
    publishdatetime TIMESTAMP,
    contenttype VARCHAR(50),
    textcontent TEXT,
    filecontentname VARCHAR(250),
    filecontenturl VARCHAR(500),
    openinnewpage INT,
    displaynewimage INT,
    isactive BOOLEAN
) AS $$
BEGIN
    IF (p_language = 'mr') THEN
        RETURN QUERY
        SELECT   
            ROW_NUMBER() OVER(PARTITION BY a.notificationcategoryid ORDER BY a.notificationcategoryid, a.publishdatetime DESC)::BIGINT AS srno,     
            a.notificationid, 
            a.notificationcategoryid, 
            b.notificationcategory::VARCHAR(100), 
            a.notificationtitlemarathi::VARCHAR(500) AS notificationtitle, 
            a.displaystartdatetime, 
            a.displayenddatetime, 
            a.publishdatetime, 
            (CASE WHEN a.notificationcategoryid = 8 THEN 'F' ELSE a.contenttype END)::VARCHAR(50) AS contenttype, 
            a.textcontentmarathi AS textcontent, 
            a.filecontentname::VARCHAR(250), 
            (CASE WHEN a.notificationcategoryid = 8 THEN a.textcontent ELSE a.filecontenturl END)::VARCHAR(500) AS filecontenturl, 
            a.openinnewpage::INT, 
            (CASE WHEN fngetistdatetime() > (a.displaystartdatetime + INTERVAL '7 days') THEN 0 ELSE a.displaynewimage END)::INT AS displaynewimage, 
            a.isactive
        FROM            
            administration_notificationdetails a
            INNER JOIN master_notificationcategory b ON a.notificationcategoryid = b.notificationcategoryid
        WHERE
            a.isdeleted = false 
            AND a.isactive = true 
            AND a.regionid = p_regionid 
            AND fngetistdatetime() BETWEEN a.displaystartdatetime AND a.displayenddatetime
        ORDER BY
            a.publishdatetime DESC, a.notificationid DESC;
    ELSE
        RETURN QUERY
        SELECT   
            ROW_NUMBER() OVER(PARTITION BY a.notificationcategoryid ORDER BY a.notificationcategoryid, a.publishdatetime DESC)::BIGINT AS srno,     
            a.notificationid, 
            a.notificationcategoryid, 
            b.notificationcategory::VARCHAR(100), 
            a.notificationtitle::VARCHAR(500), 
            a.displaystartdatetime, 
            a.displayenddatetime, 
            a.publishdatetime, 
            (CASE WHEN a.notificationcategoryid = 8 THEN 'F' ELSE a.contenttype END)::VARCHAR(50) AS contenttype, 
            a.textcontent, 
            a.filecontentname::VARCHAR(250), 
            (CASE WHEN a.notificationcategoryid = 8 THEN a.textcontent ELSE a.filecontenturl END)::VARCHAR(500) AS filecontenturl, 
            a.openinnewpage::INT, 
            (CASE WHEN fngetistdatetime() > (a.displaystartdatetime + INTERVAL '7 days') THEN 0 ELSE a.displaynewimage END)::INT AS displaynewimage, 
            a.isactive
        FROM            
            administration_notificationdetails a
            INNER JOIN master_notificationcategory b ON a.notificationcategoryid = b.notificationcategoryid
        WHERE
            a.isdeleted = false 
            AND a.isactive = true 
            AND a.regionid = p_regionid 
            AND fngetistdatetime() BETWEEN a.displaystartdatetime AND a.displayenddatetime
        ORDER BY
            a.publishdatetime DESC, a.notificationid DESC;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Administration_GetActivityStatusList
CREATE OR REPLACE FUNCTION administration_getactivitystatuslist(
    p_regionid SMALLINT
)
RETURNS TABLE (
    activityname VARCHAR(100),
    activitydetails VARCHAR(500),
    activitystartdatetime TIMESTAMP,
    activityenddatetime TIMESTAMP,
    activitystartdatetimef TEXT,
    activityenddatetimef TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.activityname::VARCHAR(100), 
        a.activitydetails::VARCHAR(500), 
        a.activitystartdatetime, 
        a.activityenddatetime,
        to_char(a.activitystartdatetime, 'DD-MM-YYYY HH24:MI')::TEXT AS activitystartdatetimef,
        to_char(a.activityenddatetime, 'DD-MM-YYYY HH24:MI')::TEXT AS activityenddatetimef
    FROM 
        master_activitystatus a
    WHERE 
        a.isactive = true AND a.regionid = p_regionid
    ORDER BY
        a.seqno;
END;
$$ LANGUAGE plpgsql;
