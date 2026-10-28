
CREATE   PROCEDURE [dbo].[Fee_UpdateRefundStatus]
	@TransactionID BIGINT, 
	@RefundRequestID VARCHAR(50), 
	@RefundPayGateID VARCHAR(50), 
	@RefundBankRRN VARCHAR(50),
	@RefundInitiatedDateTime BIGINT,
	@CommandName VARCHAR(50),
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50)
AS
	DECLARE @IsPaid BIT = 0
	DECLARE @IsRefundInitiated BIT = 0
	DECLARE @IsRefunded BIT = 0 
	DECLARE @IsChargeBackAccepted BIT = 0
	DECLARE @IsDone VARCHAR(500) = 'N'
	
	BEGIN TRY
		SELECT 
			@IsPaid					= IsPaid,
			@IsRefundInitiated		= IsRefundInitiated,
			@IsRefunded				= IsRefunded,
			@IsChargeBackAccepted	= IsChargeBackAccepted
		FROM
			Fee_transactionDetails (NOLOCK)
		WHERE
			TransactionID = @TransactionID

		IF (@CommandName = 'InitiateRefund' AND @IsPaid = 1 AND @IsRefundInitiated = 0 AND @IsRefunded = 0 AND @IsChargeBackAccepted = 0)
			BEGIN
				UPDATE Fee_TransactionDetails
				SET IsRefundInitiated = 1, RefundRequestID = @RefundRequestID, RefundPayGateID = @RefundPayGateID, RefundBankRRN = @RefundBankRRN, RefundInitiatedDateTime = DATEADD(MINUTE, 330, DATEADD(S, CONVERT(INT, LEFT(@RefundInitiatedDateTime, 10)), '1970-01-01')), RefundInitiatedBy = @UserLoginID, RefundInitiatedByIPAddress = @IPAddress
				WHERE TransactionID = @TransactionID AND IsPaid = 1 AND IsRefundInitiated = 0 AND IsRefunded = 0 AND IsChargeBackAccepted = 0

				SET @IsDone = 'Refund Initiated Successfully.'
			END
		ELSE IF (@CommandName = 'AcceptChargeBack' AND @IsPaid = 1 AND @IsRefundInitiated = 0 AND @IsRefunded = 0 AND @IsChargeBackAccepted = 0)
			BEGIN
				UPDATE Fee_TransactionDetails 
				SET IsChargeBackAccepted = 1, ChargeBackDateTime = dbo.fnGetISTDateTime(), ChargeBackBy = @UserLoginID, ChargeBackByIPAddress = @IPAddress
				WHERE TransactionID = @TransactionID AND IsPaid = 1 AND IsRefundInitiated = 0 AND IsRefunded = 0 AND IsChargeBackAccepted = 0

				SET @IsDone = 'Chargeback Accepted Successfully. Please reply through the mail about this to bank.'
			END
		ELSE IF (@CommandName = 'CompleteRefund' AND @IsPaid = 1 AND @IsRefundInitiated = 1 AND @IsRefunded = 0 AND @IsChargeBackAccepted = 0)
			BEGIN
				UPDATE Fee_TransactionDetails 
				SET IsRefunded = 1, RefundedDateTime = dbo.fnGetISTDateTime(), RefundedBy = @UserLoginID, RefundedByIPAddress = @IPAddress
				WHERE TransactionID = @TransactionID AND IsPaid = 1 AND IsRefundInitiated = 1 AND IsRefunded = 0 AND IsChargeBackAccepted = 0

				SET @IsDone = 'Refund Completed Successfully.'
			END
		ELSE
			BEGIN
				IF (@IsPaid = 0)
					SET @IsDone = 'Transaction Not Paid.'
				ELSE IF (@IsChargeBackAccepted = 1)
					SET @IsDone = 'Charge Back Already Accepted.'
				ELSE IF (@IsRefunded = 1)
					SET @IsDone = 'Refund Already Done.'
				ELSE IF (@IsRefundInitiated = 1)
					SET @IsDone = 'Refund Already Inititated.'
			END
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN

		SET @IsDone = 'N'

		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For Transaction ID '  + CAST(@TransactionID AS VARCHAR(20)) , [dbo].[fnGetISTDateTime](), @UserLoginID) 
	END CATCH

	SELECT  @IsDone AS IsOk


