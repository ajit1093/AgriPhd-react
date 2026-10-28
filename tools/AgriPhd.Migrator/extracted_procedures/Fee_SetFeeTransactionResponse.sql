CREATE   PROCEDURE [dbo].[Fee_SetFeeTransactionResponse]
	@TransactionID BIGINT,
	@FeeAmount INT,
	@IsPaid	BIT,
	@BankReferenceNo VARCHAR(50),
	@PayGateID VARCHAR(50) = '',
	@TransactionResponse VARCHAR(400) = '',
	@PaymentGatewayResponse VARCHAR(MAX) = '',
	@Optional1 VARCHAR(100) = '',
	@Optional2 VARCHAR(100) = '',
	@Optional3 VARCHAR(100) = '',
	@Optional4 VARCHAR(100) = '',
	@Optional5 VARCHAR(100) = '',
	@UserLoginID VARCHAR(50) = '',
	@IPAddress VARCHAR(50) = ''
AS
	DECLARE @PayeeID BIGINT = 0
	DECLARE @PayeeApplicationID VARCHAR(10) = ''
	DECLARE @PhaseID INT = 0
	DECLARE @TxID BIGINT = 0
	DECLARE @TxAmount INT = 0
	DECLARE @TxIsPaid BIT = 0
	DECLARE @IsFeeAmountMatched BIT = 0
	DECLARE @ErrorMsg VARCHAR(MAX) = ''
	DECLARE @IsDone CHAR(1) = 'N'

	BEGIN TRY
		BEGIN TRAN

		INSERT INTO Fee_PaymentGatewayResponse (TransactionID, PaymentGatewayResponse)
		VALUES (@TransactionID, @PaymentGatewayResponse)

		SELECT @PayeeID = PayeeID, @PayeeApplicationID = PayeeApplicationID, @PhaseID = PhaseID, @TxID = TransactionID, @TxAmount = FeeAmount, @TxIsPaid = IsPaid FROM Fee_TransactionDetails (NOLOCK) WHERE TransactionID = @TransactionID

		IF (@IsPaid = 1)
			BEGIN
				SET @IsFeeAmountMatched = CASE WHEN @TxAmount = @FeeAmount THEN 1 ELSE 0 END
			END
		ELSE 
			BEGIN
				SET @IsFeeAmountMatched = 1
			END

		IF (@TxID > 0 AND @IsFeeAmountMatched = 1 AND @TxIsPaid = 0)
			BEGIN
				UPDATE Fee_TransactionDetails
				SET IsValid	= @IsPaid, IsPaid = @IsPaid, PaymentDate = CASE WHEN @IsPaid = 1 THEN dbo.fnGetISTDateTime() ELSE NULL END, BankReferenceNo = @BankReferenceNo, PayGateID = @PayGateID, TransactionResponse = @TransactionResponse, Optional1 = @Optional1, Optional2 = @Optional2, Optional3 = @Optional3, Optional4 = @Optional4, Optional5 = @Optional5
				WHERE TransactionID = @TransactionID AND IsPaid = 0		
				
				IF (@IsPaid = 1)
					BEGIN
						IF ((SELECT COUNT(TransactionID) FROM Fee_TransactionDetails (NOLOCK) WHERE PayeeID = @PayeeID AND PhaseID = @PhaseID AND IsPaid = 1) = 1)
							BEGIN
								UPDATE Fee_TransactionDetails SET IsMainTransaction = 1 WHERE TransactionID = @TransactionID AND PayeeID = @PayeeID AND PhaseID = @PhaseID AND IsPaid = 1 
							END
					END
				ELSE
					BEGIN
						SET @ErrorMsg = ISNULL(@TransactionResponse, '')
					END 													
			END 	
		ELSE
			BEGIN
				SET @ErrorMsg = 'Your Transaction Not Matched.'				
			END

		COMMIT TRAN
		SET @IsDone = 'Y'	
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
			
		SET @IsDone = 'N'
		 
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID) 
	END CATCH
	
	SELECT  
		TransactionID	= @TransactionID,
		FeeAmount		= @TxAmount,
		BankReferenceNo	= ISNULL(@BankReferenceNo, ''),
		SuccessFlag		= @IsDone,
		ErrorMessage	= @ErrorMsg

	IF (@IsDone = 'Y' AND @IsPaid = 1 AND @PhaseID = 99)
		BEGIN
			EXEC ApplicationForm_SaveApplicationFeeDetails @PayeeID, @PayeeApplicationID, @IPAddress, 'PayApplicationFee'
		END

