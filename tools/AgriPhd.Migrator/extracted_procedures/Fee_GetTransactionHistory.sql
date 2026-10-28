CREATE   PROCEDURE [dbo].[Fee_GetTransactionHistory]
	@PayeeID VARCHAR(50)
AS
	SELECT
		TransactionID			= A.TransactionID,
		AppliedCourse			= B.Course,
		PhaseID					= A.PhaseID,
		Purpose					= A.Purpose,
		PayeeID					= A.PayeeID,
		PayeeApplicationID		= A.PayeeApplicationID,
		PayeeName				= A.PayeeName,
		PayeeMobileNo			= A.PayeeMobileNo,
		PayeeEMailID			= A.PayeeEMailID,
		FeeAmount				= A.FeeAmount,
		ServiceCharge			= A.ServiceCharge,
		TotalAmount				= A.TotalAmount,
		PaymentGateway			= C.PaymentGateway,
		IsValid					= A.IsValid,
		IsPaid					= A.IsPaid,
		TransactionDate			= FORMAT(A.TransactionDate, 'dd MMM, yyyy hh:mm:ss tt'),
		LastPaymentDate			= FORMAT(A.LastPaymentDate, 'dd MMM, yyyy hh:mm:ss tt'),
		BankReferenceNo			= A.BankReferenceNo,
		PayGateID				= A.PayGateID,
		PaymentDate				= ISNULL(FORMAT(A.PaymentDate, 'dd MMM, yyyy hh:mm:ss tt'), ''),
		TransactionResponse		= A.TransactionResponse,
		Optional1				= A.Optional1,
		Optional2				= A.Optional2,
		Optional3				= A.Optional3,
		Optional4				= A.Optional4,
		Optional5				= A.Optional5,
		IsRefundInitiated		= A.IsRefundInitiated,
		IsRefunded				= A.IsRefunded,
		IsChargeBackAccepted	= A.IsChargeBackAccepted,
		IsPushResponse			= A.IsPushResponse,
		IsMainTransaction		= A.IsMainTransaction,
		IsReconciled			= A.IsReconciled,
		PaymentDoneBy			= A.CreatedBy,
		ReceiptURL				= CASE WHEN A.IsPaid = 1 AND IsRefundInitiated = 0 AND IsRefunded = 0 AND IsChargeBackAccepted = 0 THEN '<a target=_blank href=../Fee/PaymentReceipt.aspx?TransactionID=' + CAST(A.TransactionID AS VARCHAR(30)) + '><i class="fa fa-print" style="font-size:24px"></i></a>' 
									WHEN A.IsChargeBackAccepted = 1 THEN ' Refunded through ChargeBack'
									WHEN A.IsRefundInitiated = 1 OR A.IsRefunded = 1 THEN 'Refunded</font>'
									ELSE '' 
								END,
		TransactionStatus		= CASE 
									WHEN A.IsPaid = 1 THEN 'Paid' + 
										CASE 
											WHEN A.IsRefundInitiated = 1 OR A.IsRefunded = 1 THEN ' <font color=blue><b>(Refunded)</font>'
											WHEN A.IsChargeBackAccepted = 1 THEN ' <font color=blue><b>(Refunded through ChargeBack)</b></font>'
											ELSE '' 
										END
									ELSE 'Failed' 
								END		
	FROM 
		Fee_TransactionDetails (NOLOCK) A
		INNER JOIN Master_Course (NOLOCK) B ON A.CourseID = B.CourseID
		INNER JOIN Master_PaymentGateway (NOLOCK) C ON A.PaymentGatewayID = C.PaymentGatewayID
	WHERE 
		A.PayeeID = @PayeeID 
	ORDER BY 
		A.TransactionDate DESC

