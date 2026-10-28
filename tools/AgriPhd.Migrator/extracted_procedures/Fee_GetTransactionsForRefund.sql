
CREATE   PROCEDURE [dbo].[Fee_GetTransactionsForRefund]
	@InputValue VARCHAR(20)
AS
	SELECT DISTINCT 
		PayeeApplicationID, PayeeName
	FROM
		Fee_TransactionDetails (NOLOCK)
	WHERE
		PayeeApplicationID = @InputValue OR TransactionID = @InputValue 

	SELECT
		TransactionID			= TransactionID,
		Purpose					= Purpose,
		PayeeID					= PayeeID,
		PayeeApplicationID		= PayeeApplicationID,
		PayeeName				= PayeeName,
		PayeeMobileNo			= PayeeMobileNo,
		PayeeEMailID			= PayeeEMailID,
		FeeAmount				= FeeAmount,
		TransactionDate			= FORMAT(TransactionDate, 'dd MMM, yyyy hh:mm:ss tt'),
		BankReferenceNo			= BankReferenceNo,
		PayGateID				= PayGateID,
		PaymentDate				= ISNULL(FORMAT(PaymentDate, 'dd MMM, yyyy hh:mm:ss tt'), ''),
		IsRefundInitiated		= IsRefundInitiated,
		RefundRequestID			= RefundRequestID,
		RefundPayGateID			= RefundPayGateID,
		RefundBankRRN			= RefundBankRRN,
		RefundInitiatedDate		= ISNULL(FORMAT(RefundInitiatedDateTime, 'dd MMM, yyyy hh:mm:ss tt'), ''),
		IsRefunded				= IsRefunded,
		RefundedDate			= ISNULL(FORMAT(RefundedDateTime, 'dd MMM, yyyy hh:mm:ss tt'), ''),
		IsChargeBackAccepted	= IsChargeBackAccepted,
		ChargeBackDate			= ISNULL(FORMAT(ChargeBackDateTime, 'dd MMM, yyyy hh:mm:ss tt'), ''),
		ReceiptURL				= '<a target=_blank href=../Fee/PaymentReceipt.aspx?TransactionID=' + CAST(TransactionID AS VARCHAR(30)) + '><i class="fa fa-print" style="font-size:24px"></i></a>',
		TransactionStatus		= CASE 
									WHEN IsRefundInitiated = 1 AND IsRefunded = 0 THEN 'Refund Initiated'
									WHEN IsRefunded = 1 THEN 'Refunded'
									WHEN IsChargeBackAccepted = 1 THEN 'Chargeback Accepted'
									ELSE 'Paid'
								END,
		IsEligibleForRefund		= CASE WHEN IsRefundInitiated = 0 AND IsRefunded = 0 AND IsChargeBackAccepted = 0 THEN 1 ELSE 0 END,
		PaymentGatewayID = PaymentGatewayID
	FROM 
		Fee_TransactionDetails (NOLOCK)
	WHERE 
		(PayeeApplicationID = @InputValue OR TransactionID = @InputValue) AND IsPaid = 1
	ORDER BY 
		PhaseID, TransactionID DESC
