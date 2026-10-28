CREATE PROCEDURE [dbo].[Fee_SetOrderIDForRazorPayTransaction]    
 @TransactionID   VARCHAR(50),  
 @orderID         NVARCHAR(50)  
AS    
BEGIN  
 DECLARE @status AS VARCHAR(10)  
  
    BEGIN TRY  
        BEGIN TRANSACTION  
  
        UPDATE Fee_TransactionDetails   
        SET Optional1 = @orderID  
        WHERE TransactionID = @TransactionID  
  
        SET @status = 'Y'  
  
        COMMIT TRANSACTION  
    END TRY  
    BEGIN CATCH  
        ROLLBACK TRANSACTION  
        SET @status = 'N'  
    INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)    
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For TransactionID '  + CAST(@TransactionID AS VARCHAR(20)),[dbo].[fnGetISTDateTime](), 'RazorPay')     
    END CATCH  
 SELECT @status AS Status  
END  
