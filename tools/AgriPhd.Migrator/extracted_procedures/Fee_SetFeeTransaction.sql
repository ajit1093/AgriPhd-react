CREATE PROCEDURE [dbo].[Fee_SetFeeTransaction]  
 @PayeeID BIGINT,  
 @PhaseID SMALLINT,  
 @PaymentGatewayID SMALLINT,  
 @UserLoginID VARCHAR(50),  
 @IPAddress VARCHAR(50)  
AS    
 DECLARE @TransactionID BIGINT = 0  
 DECLARE @AppliedCourseID SMALLINT = 0  
 DECLARE @PayeeApplicationID VARCHAR(20) = ''  
 DECLARE @PayeeName VARCHAR(100) = ''  
 DECLARE @PayeeMobileNo VARCHAR(15) = ''  
 DECLARE @PayeeEMailID VARCHAR(100) = ''  
 DECLARE @FeeAmount NUMERIC(9, 2) = 0.0  
 DECLARE @ServiceCharge NUMERIC(9, 2) = 0.0  
 DECLARE @LastPaymentDate DATETIME = NULL  
 DECLARE @Purpose VARCHAR(50) = ''  
 DECLARE @ProjectCode VARCHAR(4) = (SELECT ProjectCode FROM Master_Project (NOLOCK))  
 DECLARE @AppendZero VARCHAR(12) = @ProjectCode + '00000000'  
 DECLARE @TransactionLength SMALLINT = 12  
 DECLARE @ErrorMsg VARCHAR(1000) = ''  
  
  SET @AppliedCourseID=1 /*MSC Agri*/

 BEGIN TRY  
  SELECT @FeeAmount = RemainingFee, @LastPaymentDate = LastPaymentDate, @Purpose = Purpose FROM dbo.fnCalculateFee(@PayeeID, @PhaseID)  
    
  IF (@FeeAmount > 0 AND @LastPaymentDate >= dbo.fnGetISTDateTime())  
   BEGIN  
    BEGIN TRAN       
      
    SELECT/* @AppliedCourseID = AppliedCourseID,*/ @PayeeApplicationID = ApplicationID, @PayeeName = CandidateName, @PayeeMobileNo = MobileNo, @PayeeEMailID = EMailID   
    FROM ApplicationForm_RegistrationDetails (NOLOCK)  
    WHERE CandidateID = @PayeeID  
  
    INSERT INTO Fee_TransactionDetails (TransactionID, CourseID, PhaseID, Purpose, PayeeID, PayeeApplicationID, PayeeName, PayeeMobileNo, PayeeEMailID, FeeAmount, ServiceCharge, TotalAmount, LastPaymentDate, PaymentGatewayID, CreatedDateTime, CreatedBy, CreatedByIPAddress)  
    SELECT ISNULL((SELECT MAX(TransactionID) FROM Fee_TransactionDetails (NOLOCK) WHERE LEN(TransactionID) = @TransactionLength), @AppendZero) + CAST(1 AS BIGINT), @AppliedCourseID, @PhaseID, @Purpose, @PayeeID, @PayeeApplicationID, @PayeeName, @PayeeMobileNo, @PayeeEMailID, @FeeAmount, @ServiceCharge, @FeeAmount + @ServiceCharge, CAST(@LastPaymentDate AS DATE), @PaymentGatewayID, dbo.fnGetISTDateTime(), @PayeeApplicationID, @IPAddress  
      
    SELECT @TransactionID = ISNULL(MAX(TransactionID), 0) FROM Fee_TransactionDetails (NOLOCK) WHERE PayeeID = @PayeeID AND PhaseID = @PhaseID AND FeeAmount = @FeeAmount          
      
    IF (LEN(@TransactionID) = @TransactionLength AND LEFT(@TransactionID, 4) = @ProjectCode)  
     BEGIN  
      COMMIT TRAN         
     END  
    ELSE  
     BEGIN  
      ROLLBACK TRAN   
         
      SET @TransactionID = 0    
      SET @ErrorMsg = 'Some Error has been occurred. Please try again. Please check transacion length'  
     END  
   END  
  ELSE IF(@LastPaymentDate < dbo.fnGetISTDateTime())  
   BEGIN  
    SET @ErrorMsg = 'Last Payment Date has been crossed.'  
   END  
 END TRY  
 BEGIN CATCH  
  IF(@@TRANCOUNT > 0)  
   ROLLBACK TRAN  
      
  SET @TransactionID = 0  
  SET @ErrorMsg = ERROR_MESSAGE() +  ' ' + CAST(ERROR_LINE() AS VARCHAR(10))  
  
  INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)  
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @PayeeID)  
 END CATCH  
     
 SELECT   
  TransactionID  = @TransactionID,  
  PaymentGatewayURL = (SELECT PaymentGatewayURL FROM Master_PaymentGateway (NOLOCK) WHERE PaymentGatewayID = @PaymentGatewayID),  
  SuccessFlag   = CASE WHEN @TransactionID > 0 THEN 'Y' ELSE 'N' END,   
  ErrorMessage  = @ErrorMsg  
